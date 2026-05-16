import { tursoOperations } from "../src/services/turso/index.js";

export default {
  async fetch(request: Request) {
    try {
      if (request.method === "GET") {
        const session = await tursoOperations.getCurrentSession();
        return Response.json(session);
      }

      if (request.method === "PUT") {
        const body = await request.json();
        if (!body?.id || !body?.type || !body?.startTime || !body?.endTime) {
          throw new Error("Missing required session fields");
        }
        const result = await tursoOperations.upsertCurrentSession({
          id: body.id,
          type: body.type,
          startTime: new Date(body.startTime),
          endTime: new Date(body.endTime),
          taskDescription: body.taskDescription,
          updatedAt: body.updatedAt ? new Date(body.updatedAt) : undefined,
        });
        return Response.json(result);
      }

      if (request.method === "DELETE") {
        const result = await tursoOperations.clearCurrentSession();
        return Response.json(result);
      }

      return Response.json({ error: "Method not allowed" }, { status: 405 });
    } catch (error) {
      return Response.json({ error: String(error) }, { status: 400 });
    }
  },
};
