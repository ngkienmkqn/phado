import { NextResponse, NextRequest } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

const CONFIG_PATH = join(process.cwd(), 'src', 'data', 'admin_config.json');
const TMP_PASS_FILE = '/tmp/phado_admin_pass';

// Read current admin password (check /tmp first, then fall back to config)
function getAdminPassword(): string {
    try {
        if (existsSync(TMP_PASS_FILE)) {
            return readFileSync(TMP_PASS_FILE, 'utf8').trim();
        }
    } catch { /* ignore */ }

    try {
        const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
        return config.adminPassword || '123456';
    } catch { /* ignore */ }

    return '123456';
}

// Read system admin password from config
function getSystemAdminPassword(): string {
    try {
        const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
        return config.systemAdminPassword || '671164';
    } catch { /* ignore */ }
    return '671164';
}

// POST /api/admin-auth - Login
// Body: { action: 'login', password: string }
// Body: { action: 'change-password', currentPassword: string, newPassword: string }
// Body: { action: 'get-current-password' } - Returns the current admin password (for system admin only)
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { action } = body;

    if (action === 'login') {
        const { password } = body;
        const adminPass = getAdminPassword();
        const systemPass = getSystemAdminPassword();

        if (password === systemPass) {
            return NextResponse.json({ success: true, role: 'system_admin' });
        }
        if (password === adminPass) {
            return NextResponse.json({ success: true, role: 'admin' });
        }
        return NextResponse.json({ success: false, error: 'Sai mật khẩu' }, { status: 401 });
    }

    if (action === 'change-password') {
        const { currentPassword, newPassword } = body;
        const adminPass = getAdminPassword();
        const systemPass = getSystemAdminPassword();

        // Only allow password change if current password is correct
        if (currentPassword !== adminPass && currentPassword !== systemPass) {
            return NextResponse.json({ success: false, error: 'Mật khẩu hiện tại không đúng' }, { status: 401 });
        }

        if (!newPassword || newPassword.length < 4) {
            return NextResponse.json({ success: false, error: 'Mật khẩu mới phải ít nhất 4 ký tự' }, { status: 400 });
        }

        // Don't allow changing system admin password from UI
        if (newPassword === systemPass) {
            return NextResponse.json({ success: false, error: 'Không thể dùng mật khẩu này' }, { status: 400 });
        }

        try {
            // Write to /tmp for runtime persistence
            writeFileSync(TMP_PASS_FILE, newPassword, 'utf8');
            return NextResponse.json({ success: true, message: 'Đã đổi mật khẩu thành công!' });
        } catch {
            return NextResponse.json({ success: false, error: 'Lỗi hệ thống' }, { status: 500 });
        }
    }

    if (action === 'get-current-password') {
        // Only system admin can see current password
        const { password } = body;
        const systemPass = getSystemAdminPassword();

        if (password !== systemPass) {
            return NextResponse.json({ success: false, error: 'Không có quyền' }, { status: 403 });
        }

        return NextResponse.json({ success: true, currentAdminPassword: getAdminPassword() });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
