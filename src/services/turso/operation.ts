import type { PomodoroSession } from "../../types/timer";
import { getDatabase } from "./initialization";
import { parseRawPomodoroSessionDBEntries } from "./parse";

const db = getDatabase();
async function getLatestNSessions(n: number): Promise<PomodoroSession[]> {
    const query = await db.prepare("SELECT * FROM pomodoro_entries ORDER BY start_time DESC LIMIT (?)")
    const raws = await query.all(n);
    return parseRawPomodoroSessionDBEntries(raws);
}

async function insertSession(session: PomodoroSession) {
    const query = await db.prepare("INSERT INTO pomodoro_entries (id, type, start_time, end_time, task_description) VALUES (?, ?, ?, ?, ?)");
    return query.run([session.id, session.type, session.startTime.toISOString(), session.endTime.toISOString(), session.taskDescription ?? null]);
}

async function updateSession(session: PomodoroSession) {
    const query = await db.prepare("UPDATE pomodoro_entries SET type = ?, start_time = ?, end_time = ?, task_description = ? WHERE id = ?");
    return query.run([session.type, session.startTime.toISOString(), session.endTime.toISOString(), session.taskDescription ?? null, session.id]);
}

const tursoOperations = {
    getLatestNSessions,
    insertSession,
    updateSession,
};

export { tursoOperations };
