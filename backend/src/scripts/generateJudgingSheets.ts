import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

dotenv.config();

async function generateJudgingSheets() {
    await mongoose.connect(process.env.MONGODB_URI!);
    const col = mongoose.connection.db!.collection('Data_Collection_Pre-Hackthon_1');

    // Fetch all teams with submissions
    const teams = await col.find({
        problemStatement: { $exists: true, $ne: '' }
    }).sort({ roomNumber: 1, allocatedTeamId: 1 }).toArray();

    // Group teams by room
    const roomMap: Record<string, any[]> = {};
    for (const t of teams) {
        const room = t.roomNumber || 'Unassigned';
        if (!roomMap[room]) roomMap[room] = [];
        roomMap[room].push(t);
    }

    // Output directory
    const outDir = path.join(__dirname, '..', '..', '..', 'judging_sheets');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const sortedRooms = Object.keys(roomMap).sort();

    // ── 1. One Excel file PER ROOM ──
    for (const room of sortedRooms) {
        const roomTeams = roomMap[room];
        const rows = roomTeams.map((t, i) => ({
            'S.No': i + 1,
            'Team ID': t.allocatedTeamId ? `T-${t.allocatedTeamId}` : '',
            'Team Name': t.teamName || '',
            'Leader Name': t.leaderName || '',
            'Problem Statement': t.problemStatement || '',
            'GitHub Repo': t.githubRepo || '',
            'Problem Understanding (10)': '',
            'Proposed Solution (10)': '',
            'Tech Stack (10)': '',
            'Expected Features (10)': '',
            'Impact on India/Bharat (10)': '',
            'Total (50)': '',
            'Remarks': '',
        }));

        const ws = XLSX.utils.json_to_sheet(rows);

        // Auto-width columns
        const colWidths = Object.keys(rows[0]).map(key => {
            const maxLen = Math.max(
                key.length,
                ...rows.map(r => String((r as any)[key] || '').length)
            );
            return { wch: Math.min(maxLen + 2, 50) };
        });
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        const safeRoom = room.replace(/[/\\?*[\]]/g, '-');
        XLSX.utils.book_append_sheet(wb, ws, safeRoom);

        const filename = `Judging_${safeRoom.replace(/\s+/g, '_')}.xlsx`;
        const filepath = path.join(outDir, filename);
        XLSX.writeFile(wb, filepath);
        console.log(`✅ ${filename} — ${roomTeams.length} teams`);
    }

    // ── 2. Combined Excel with all rooms as separate sheets ──
    const combinedWb = XLSX.utils.book_new();
    for (const room of sortedRooms) {
        const roomTeams = roomMap[room];
        const rows = roomTeams.map((t, i) => ({
            'S.No': i + 1,
            'Team ID': t.allocatedTeamId ? `T-${t.allocatedTeamId}` : '',
            'Team Name': t.teamName || '',
            'Leader Name': t.leaderName || '',
            'Problem Statement': t.problemStatement || '',
            'GitHub Repo': t.githubRepo || '',
            'Problem Understanding (10)': '',
            'Proposed Solution (10)': '',
            'Tech Stack (10)': '',
            'Expected Features (10)': '',
            'Impact on India/Bharat (10)': '',
            'Total (50)': '',
            'Remarks': '',
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        const colWidths = Object.keys(rows[0]).map(key => {
            const maxLen = Math.max(
                key.length,
                ...rows.map(r => String((r as any)[key] || '').length)
            );
            return { wch: Math.min(maxLen + 2, 50) };
        });
        ws['!cols'] = colWidths;

        const safeRoom = room.replace(/[/\\?*[\]]/g, '-');
        XLSX.utils.book_append_sheet(combinedWb, ws, safeRoom);
    }

    const combinedPath = path.join(outDir, 'Judging_All_Rooms.xlsx');
    XLSX.writeFile(combinedWb, combinedPath);
    console.log(`\n📊 Combined file: Judging_All_Rooms.xlsx (${sortedRooms.length} sheets)`);

    console.log(`\n📁 All files saved to: ${outDir}`);
    console.log(`\nRooms: ${sortedRooms.join(', ')}`);
    console.log(`Total teams: ${teams.length}`);

    await mongoose.disconnect();
    process.exit(0);
}

generateJudgingSheets().catch(e => { console.error(e); process.exit(1); });
