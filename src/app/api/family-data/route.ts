import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic'; // Never cache
export const revalidate = 0;

export async function GET() {
    const filePath = join(process.cwd(), 'src', 'data', 'family_data.json');
    const data = JSON.parse(readFileSync(filePath, 'utf8'));

    // Compute dynamic stats based on database members
    const members = data.members || [];
    data.totalMembers = members.length;
    data.totalGenerations = members.length > 0
        ? Math.max(...members.map((m: any) => m.generation))
        : 0;

    return NextResponse.json(data, {
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
    });
}
