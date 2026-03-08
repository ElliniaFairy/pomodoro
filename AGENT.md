# AGENT.md

## Purpose
This project is a Vite + React + TypeScript pomodoro app. For the planned feature, the important flow is: start a session, optionally store a task description on that session, render it under the active timer, then persist it into history and sync.

## Main UI flow
- [`src/App.tsx`](src/App.tsx) only renders [`PomodoroTimer`](src/components/PomodoroTimer.tsx).
- [`src/components/PomodoroTimer.tsx`](src/components/PomodoroTimer.tsx) is the main screen container. It pulls state and actions from [`useTimer`](src/hooks/useTimer.ts) and renders:
  - [`TimerCountdown`](src/components/TimerCountdown.tsx) for the active timer display
  - [`GridProgressBar`](src/components/GridProgressBar.tsx) / [`BreakChecklist`](src/components/BreakChecklist.tsx) for current-session visuals
  - [`SpaceshipControlPanel`](src/components/SpaceshipControlPanel.tsx) for start/stop/adjust controls
  - [`SessionHistory`](src/components/SessionHistory.tsx) for saved sessions

## Data model
- [`src/types/timer.ts`](src/types/timer.ts) defines [`PomodoroSession`](src/types/timer.ts:1).
- The session model already has [`taskDescription`](src/types/timer.ts:6) as an optional field.
- The [`START_SESSION`](src/types/timer.ts:27) action already accepts an optional task description.

## Timer state and persistence
- [`src/hooks/useTimer.ts`](src/hooks/useTimer.ts) owns app state with a reducer.
- In [`timerReducer()`](src/hooks/useTimer.ts:42):
  - [`START_SESSION`](src/hooks/useTimer.ts:44) creates the active session and copies [`action.taskDescription`](src/hooks/useTimer.ts:56) into the new session.
  - [`COMPLETE_SESSION`](src/hooks/useTimer.ts:91) moves the current session into history.
  - If a new session starts while another is active, the previous one is pushed into history first.
- In [`useTimer()`](src/hooks/useTimer.ts:139):
  - [`startSession`](src/hooks/useTimer.ts:215) already accepts [`taskDescription`](src/hooks/useTimer.ts:216).
  - current session is persisted with [`saveCurrentSession()`](src/utils/storage.ts:11)
  - history is persisted and synced with [`saveHistoryWithSync()`](src/utils/syncIntegration.ts:74)

## Storage and sync
- [`src/utils/storage.ts`](src/utils/storage.ts) saves sessions to localStorage via JSON.
- On load, [`loadCurrentSession()`](src/utils/storage.ts:20) and [`loadHistory()`](src/utils/storage.ts:48) restore Date fields.
- Because [`taskDescription`](src/types/timer.ts:6) is plain JSON data, it should already round-trip through storage without special handling.
- [`src/utils/syncIntegration.ts`](src/utils/syncIntegration.ts) and [`src/utils/sync.ts`](src/utils/sync.ts) sync whole session objects, so extra session fields also flow through automatically.

## Current rendering of task descriptions
- [`src/components/SessionHistory.tsx`](src/components/SessionHistory.tsx) already renders [`session.taskDescription`](src/components/SessionHistory.tsx:201) inside each history card.
- [`src/components/TimerCountdown.tsx`](src/components/TimerCountdown.tsx) currently only renders time and session type styling; it does not show a task description or handle clicks.

## Likely implementation area for the new feature
For a click-the-timer dialog flow, expect the main changes to center around:
- [`src/components/PomodoroTimer.tsx`](src/components/PomodoroTimer.tsx) for wiring active session description state and passing handlers/props
- [`src/components/TimerCountdown.tsx`](src/components/TimerCountdown.tsx) if the timer display itself becomes clickable and shows the current task under the time
- possibly [`src/hooks/useTimer.ts`](src/hooks/useTimer.ts) and [`src/types/timer.ts`](src/types/timer.ts) if you decide the current session description must be editable after session start, not only supplied when starting

## Important observation before implementation
The data layer is partly ready already because [`taskDescription`](src/types/timer.ts:6) exists end-to-end. The missing part appears to be UI and possibly an "update current session description" action if the description is entered after clicking the running timer instead of before starting the session.
