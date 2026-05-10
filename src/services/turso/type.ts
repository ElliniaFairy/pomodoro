export interface RawPomodoroSessionDBEntry {
    id: string;
    type: string;
    start_time: string;
    end_time: string;
    task_description: string | null;
}