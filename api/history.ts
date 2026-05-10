import { tursoOperations } from "../src/services/turso/index.js";

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
        const body = await request.json();
        if (!body?.id || !body?.type || !body?.startTime || !body?.endTime) {
          throw new Error("Missing required session fields");
        }
        const result = await tursoOperations.insertSession({
          id: body.id,
          type: body.type,
          startTime: new Date(body.startTime),
          endTime: new Date(body.endTime),
          taskDescription: body.taskDescription,
        });
        return Response.json(result);
      }

      if (request.method === "PUT") {
        const body = await request.json();
        if (!body?.id || !body?.type || !body?.startTime || !body?.endTime) {
          throw new Error("Missing required session fields");
        }
        const result = await tursoOperations.updateSession({
          id: body.id,
          type: body.type,
          startTime: new Date(body.startTime),
          endTime: new Date(body.endTime),
          taskDescription: body.taskDescription,
        });
        return Response.json(result);
      }

      if (request.method === "DELETE") {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) throw new Error("Missing required session id");
        const result = await tursoOperations.deleteSession(id);
        return Response.json(result);
      }

      return Response.json({ error: "Method not allowed" }, { status: 405 });
    } catch (error) {
      return Response.json({ error: String(error) }, { status: 400 });
    }
  },
};
