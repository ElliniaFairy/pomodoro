# Pomodoro

> A timer that respects how you actually work.


## Why This Exists

Every pomodoro app assumes the same thing: you press Start on time, you stop when it rings, and you take a five-minute break. That is not how focus works.

You sit down. You start reading the code. Twenty minutes pass. You are deep in it now — and then you realize: you never pressed Start. The session is gone. The app does not know it happened. You either lie to yourself and start a fresh 25-minute timer from right now, or you give up tracking entirely. Even worse, you start thinking about it — and the twenty minutes you already worked begin to feel like a waste.

Or the timer rings, but you are mid-thought. You are just three lines away from finishing the function. Every other app says: stop. Session recorded. Time for a break — and the break timer starts immediately. If you keep going, those extra ten minutes vanish — or worse, they eat into your break session, making you anxious that you will lose the break time completely — and that anxiety alone is enough to break your flow.

And then the break. Five minutes. You stand up, walk to the bathroom, come back, sit down. Break over. You did not drink water. You did not have time to write down what you just learned. You did not throw your clothes into the washing machine. Five minutes is not a break — it is a pause long enough to lose your momentum but too short to actually recover.

None of the hundreds of existing apps solve this. They all worship the original 25/5 rule like it is scripture. Real work does not fit in 25 minutes. Some tasks need 40 minutes just to load into your head, and sometimes for something you have not touched in a long time, you just need 5 minutes to start working and call it a win. A five-minute break after a fifty-minute deep session is a joke. And if too much human effort is involved — opening spreadsheets, typing timestamps, calculating durations — the habit dies in three days.

So I built this one. Not for anyone else. For the way I actually work.


## What Makes This Different

### Retroactive Start

You forgot to press Start. It happens every time. Twenty minutes into focus, you finally notice. Instead of pretending those twenty minutes did not happen, you type `18:14` and the timer rewinds. It picks up where you actually began, shows you the remaining time, and records the full session — including the part you already did. Your log tells the truth.

### Flexible Break Time

Break duration is not a fixed number. It is one-third of however long you actually focused, and the ratio is easy to change. A 36-minute focus gives you a 12-minute break — long enough to drink water, use the bathroom, throw clothes in the washing machine, write down what you learned, and still have a moment to breathe. A 50-minute deep session earns you nearly 17 minutes. You can even focus 90 minutes developing something and earn a 30-minute walk to your favorite park. The break scales with the work because recovery should match effort.

### Time Adjustment, Anytime

The timer rang ten minutes ago but you kept going. Press `+3m` and the session extends — your end time shifts forward, and the record captures the real duration. Need more? `+10m`. Overshot? `-1m`, `-3m`, `-10m`. These work during focus, during break, and even after the timer hits zero. The session is not locked the moment it ends. Your record is not frozen until you say it is.

### Cloud Sync with Turso

Session data lives in Turso Cloud, not just localStorage. Start a pomodoro at work, check your history at home, glance at today's rhythm on your phone. Your focus record follows you across devices without setup friction, and it survives clearing your browser.

### Break Checklist

When a focus session ends, a checklist appears — not as a productivity hack, but as a way to actually let go. The most common reason people cannot break properly is that they are still holding the thread: what was I thinking, what comes next, what if I forget. The checklist gives you a place to put those worries down. Record your unfinished thoughts. Log what you learned. Update your habits. Drink water. Then the checklist fades, and the break is yours.

Two modes are available — work and private — each with its own items. Switch between them with `?mode=work` or `?mode=private` in the URL.

### 36-Minute Default

Not 25. Twenty-five minutes is too short for real flow. By the time you are warmed up and thinking clearly, the timer is already ringing. Twenty-five minutes is too awkward to complete meaningful work — too long for a quick task, too short for anything deep. Thirty-six minutes is where focus actually lives. But this is configurable. The point is not the number — it is that you choose it, not some rule from 1987.

### Task Descriptions

Every focus session can carry a note about what you worked on. Click below the timer to type it, or add it after the fact. Your Mission Log becomes more than timestamps — it is a journal of what you actually did.

### The UI

Every other pomodoro app looks like a kitchen timer. This one looks like a spaceship cockpit. Dark background. Cyan glow. Holographic control panel. A progress bar made of 1,000 tiny blocks that fill in random order like a Windows defragmenter — because watching that animation as a kid was hypnotic, and it still is. The aesthetic also creates a sense of mission, giving me the feeling that I am not just sitting at a desk. I am piloting something.

### Notifications That Sound Different

When focus ends, the melody descends: C6, G5, E5, C5 — calming, telling you to come down gently. When break ends, it ascends: C5, E5, G5, C6 — energizing, pulling you back up. No sound files. The melodies are synthesized live through the Web Audio API.


## What It Records

- Every completed session: type (focus or break), start time, end time, actual duration, task description
- Today's statistics: focus session count, break count, total focus time
- Full history: the last 50 sessions, scrollable, deletable, synced to the cloud


## Tech

- **React 19** + **TypeScript** + **Vite 7** — fast builds, fast HMR
- **styled-components** — scoped CSS with the sci-fi theme baked in
- **Turso Cloud** (libsql) — serverless SQLite for cross-device sync
- **Vercel** — serverless API routes for database operations
- **Web Audio API** — procedural notification melodies, no audio files
- **Inter** — clean typography throughout


## What's Next

- Heat map visualization — GitHub-style activity calendar for focus patterns
- Experience and leveling system — XP for completed sessions, streak bonuses, daily-first bonuses
- Achievement system — milestones and rewards for consistency
- Dashboard — charts, trends, and deeper statistics over time
