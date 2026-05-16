import type { PomodoroSession } from "../../types/timer";
import { getDatabase } from "./initialization.js";
import { parseRawPomodoroSessionDBEntries } from "./parse.js";

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

async function deleteSession(id: string) {
    const query = await db.prepare("DELETE FROM pomodoro_entries WHERE id = ?");
    return query.run([id]);
}

async function getCurrentSession(): Promise<PomodoroSession | null> {
    const query = await db.prepare("SELECT id, type, start_time, end_time, task_description, updated_at FROM current_session WHERE singleton_key = 'current'");
    const raw = await query.get();
    if (!raw) return null;
    if (raw.type !== "focus" && raw.type !== "break") return null;
    return {
        id: raw.id,
        type: raw.type,
        startTime: new Date(raw.start_time),
        endTime: new Date(raw.end_time),
        taskDescription: raw.task_description ?? undefined,
        updatedAt: new Date(raw.updated_at),
    };
}

async function upsertCurrentSession(session: PomodoroSession) {
    const existing = await getCurrentSession();
    if (existing?.updatedAt && session.updatedAt && existing.updatedAt > session.updatedAt) {
        return existing;
    }

    const updatedAt = session.updatedAt ?? new Date();
    const query = await db.prepare(`
        INSERT INTO current_session (
            singleton_key,
            id,
            type,
            start_time,
            end_time,
            task_description,
            updated_at
        )
        VALUES ('current', ?, ?, ?, ?, ?, ?)
        ON CONFLICT(singleton_key) DO UPDATE SET
            id = excluded.id,
            type = excluded.type,
            start_time = excluded.start_time,
            end_time = excluded.end_time,
            task_description = excluded.task_description,
            updated_at = excluded.updated_at
    `);
    await query.run([
        session.id,
        session.type,
        session.startTime.toISOString(),
        session.endTime.toISOString(),
        session.taskDescription ?? null,
        updatedAt.toISOString(),
    ]);
    return {
        ...session,
        updatedAt,
    };
}

async function clearCurrentSession() {
    const query = await db.prepare("DELETE FROM current_session WHERE singleton_key = 'current'");
    return query.run();
}

const tursoOperations = {
    getLatestNSessions,
    insertSession,
    updateSession,
    deleteSession,
    getCurrentSession,
    upsertCurrentSession,
    clearCurrentSession,
};

export { tursoOperations };
