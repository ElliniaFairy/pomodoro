import type { RawPomodoroSessionDBEntry } from "./type";
import type { PomodoroSession } from "../../types/timer";

function parseRawPomodoroSessionDBEntry(raw: RawPomodoroSessionDBEntry): PomodoroSession | null {
    if (raw.type !== "focus" && raw.type !== "break") {
        console.log("Encounter Invalid session type, skipping");
        return null;
    }
    
    return {
        id: raw.id,
        type: raw.type,
        startTime: new Date(raw.start_time),
        endTime: new Date(raw.end_time),
        taskDescription: raw.task_description ?? undefined,
    };
}

function parseRawPomodoroSessionDBEntries(raws: RawPomodoroSessionDBEntry[]): PomodoroSession[] {
    return raws.map(parseRawPomodoroSessionDBEntry).filter((session) => session !== null);
}

export { parseRawPomodoroSessionDBEntries };
