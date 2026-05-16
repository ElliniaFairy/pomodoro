import { tursoOperations } from "../src/services/turso/index.js";

export async function GET() {
  try {
    const session = await tursoOperations.getCurrentSession();
    return Response.json(session);
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
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
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 400 });
  }
}

export async function DELETE() {
  try {
    const result = await tursoOperations.clearCurrentSession();
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 400 });
  }
}
