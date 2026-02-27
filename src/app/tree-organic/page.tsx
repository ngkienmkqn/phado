import OrganicTreeCanvas from "@/components/OrganicTreeCanvas";
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function loadFamilyData() {
    const filePath = join(process.cwd(), 'src', 'data', 'family_data.json');
    return JSON.parse(readFileSync(filePath, 'utf8'));
}

export default function TreeOrganicPage() {
    const familyDataRaw = loadFamilyData();

    return (
        <div className="w-full h-screen overflow-hidden">
            <OrganicTreeCanvas data={familyDataRaw} />
        </div>
    );
}
