import { connect } from "@tursodatabase/sync";
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
}

const db = await connect({
    path: "./app.db",
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
})
import history from './history.json' with { type: 'json' };
const insertSQL = db.prepare("INSERT OR IGNORE INTO pomodoro_entries (id, type, start_time, end_time, task_description) VALUES (?, ?, ?, ?, ?)")

try {
    await db.pull();
    for (const entry of history) {
        const insertResult = await insertSQL.run(entry.id, entry.type, entry.startTime, entry.endTime, entry.taskDescription ?? null);
        console.log("Inserted:", insertResult);
    }
    await db.push();
} catch (error) {
    console.error(error);
}
