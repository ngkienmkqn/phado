import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic'; // Never cache
export const revalidate = 0;

export async function GET() {
    const filePath = join(process.cwd(), 'src', 'data', 'family_data.json');
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    return NextResponse.json(data, {
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
    });
}
