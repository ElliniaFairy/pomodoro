import { tursoOperations } from "../src/services/turso";
import type { PomodoroSession } from "../src/types/timer";

function parseSession(body: any): PomodoroSession {
  if (!body?.id || !body?.type || !body?.startTime || !body?.endTime) {
    throw new Error("Missing required session fields");
  }

  return {
    id: body.id,
    type: body.type,
    startTime: new Date(body.startTime),
    endTime: new Date(body.endTime),
    taskDescription: body.taskDescription,
  };
}

export default {
  async fetch(request: Request) {
    try {
      if (request.method === "GET") {
        const url = new URL(request.url);
        const n = parseInt(url.searchParams.get("n") || "50");
        const history = await tursoOperations.getLatestNSessions(n);
        return Response.json(history);
      }

      if (request.method === "POST") {
        const result = await tursoOperations.insertSession(parseSession(await request.json()));
        return Response.json(result);
      }

      if (request.method === "PUT") {
        const result = await tursoOperations.updateSession(parseSession(await request.json()));
        return Response.json(result);
      }

      return Response.json({ error: "Method not allowed" }, { status: 405 });
    } catch (error) {
      return Response.json({ error: String(error) }, { status: 400 });
    }
  },
};
