import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function fix() {
    await mongoose.connect(process.env.MONGODB_URI!);
    const col = mongoose.connection.db!.collection('Data_Collection_Pre-Hackthon_1');

    // 1. Check in all teams that have a problem statement (they submitted = they're present)
    const r1 = await col.updateMany(
        { problemStatement: { $exists: true, $ne: '' }, isCheckedIn: { $ne: true } },
        { $set: { isCheckedIn: true } }
    );
    console.log(`Checked in ${r1.modifiedCount} teams that had submissions but weren't checked in`);

    // 2. Fix remaining room number inconsistencies - normalize ALL to "EB{n} - {room}" format
    const allWithRooms = await col.find({ roomNumber: { $exists: true, $ne: '' } }).toArray();
    let roomFixed = 0;

    for (const team of allWithRooms) {
        const old = team.roomNumber as string;
        if (!old) continue;
        // Match any variant: EB2-104, EB2104, EB-2104, EB 2-104, EB-2 104, EB02-205, etc.
        const match = old.match(/^eb\s*-?\s*0?(\d)\s*[-\s]*(\d{3,4})$/i);
        if (match) {
            const normalized = `EB${match[1]} - ${match[2]}`;
            if (normalized !== old) {
                await col.updateOne({ _id: team._id }, { $set: { roomNumber: normalized } });
                console.log(`  "${team.teamName}": "${old}" -> "${normalized}"`);
                roomFixed++;
            }
        }
    }

    console.log(`\nRoom numbers fixed: ${roomFixed}`);

    // Show final stats
    const checkedIn = await col.countDocuments({ isCheckedIn: true });
    const withPS = await col.countDocuments({ problemStatement: { $exists: true, $ne: '' } });
    const rooms = await col.distinct('roomNumber', { problemStatement: { $exists: true, $ne: '' } });
    console.log(`\nChecked in: ${checkedIn}`);
    console.log(`With submissions: ${withPS}`);
    console.log(`Room tabs: ${rooms.filter(Boolean).sort().join(', ')}`);

    await mongoose.disconnect();
    process.exit(0);
}

fix().catch(e => { console.error(e); process.exit(1); });
