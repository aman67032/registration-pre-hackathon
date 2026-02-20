import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function diagnoseAndFix() {
    await mongoose.connect(process.env.MONGODB_URI!);
    const col = mongoose.connection.db!.collection('Data_Collection_Pre-Hackthon_1');

    const total = await col.countDocuments();
    const checkedIn = await col.countDocuments({ isCheckedIn: true });
    const withPS = await col.countDocuments({ problemStatement: { $exists: true, $ne: '' } });

    console.log(`Total teams: ${total}`);
    console.log(`Checked in: ${checkedIn}`);
    console.log(`With submissions: ${withPS}`);

    // Find teams with PS but not checked in
    const notCI = await col.find({
        problemStatement: { $exists: true, $ne: '' },
        isCheckedIn: { $ne: true }
    }).project({ teamName: 1, isCheckedIn: 1 }).toArray();

    console.log(`\nTeams with submission but NOT checked in (${notCI.length}):`);
    for (const t of notCI) {
        console.log(`  - "${t.teamName}" (isCheckedIn: ${t.isCheckedIn})`);
    }

    // Check in those teams
    if (notCI.length > 0) {
        const ids = notCI.map(t => t._id);
        const r = await col.updateMany({ _id: { $in: ids } }, { $set: { isCheckedIn: true } });
        console.log(`\nFixed: checked in ${r.modifiedCount} teams`);
    }

    // Fix remaining room number issues
    const roomTeams = await col.find({ roomNumber: { $exists: true, $ne: '' } }).toArray();
    let roomFixed = 0;
    for (const team of roomTeams) {
        const old = team.roomNumber;
        if (!old || typeof old !== 'string') continue;

        const m = old.match(/^eb\s*-?\s*0?(\d)\s*[-\s]*(\d{3,4})$/i);
        if (m) {
            const normalized = `EB${m[1]} - ${m[2]}`;
            if (normalized !== old) {
                await col.updateOne({ _id: team._id }, { $set: { roomNumber: normalized } });
                console.log(`Room fix: "${team.teamName}": "${old}" -> "${normalized}"`);
                roomFixed++;
            }
        }
    }
    console.log(`Room numbers fixed: ${roomFixed}`);

    // Final room list
    const rooms = await col.distinct('roomNumber', { problemStatement: { $exists: true, $ne: '' } });
    console.log(`\nFinal room tabs: ${rooms.filter(Boolean).sort().join(', ')}`);

    const finalCI = await col.countDocuments({ isCheckedIn: true });
    console.log(`Final checked in: ${finalCI}`);

    await mongoose.disconnect();
    process.exit(0);
}

diagnoseAndFix().catch(e => { console.error(e); process.exit(1); });
