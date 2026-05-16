import { tursoOperations } from "../src/services/turso/index.js";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const n = parseInt(url.searchParams.get("n") || "50");
    const history = await tursoOperations.getLatestNSessions(n);
    return Response.json(history);
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
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
    const result = await tursoOperations.updateSession({
      id: body.id,
      type: body.type,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      taskDescription: body.taskDescription,
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) throw new Error("Missing required session id");
    const result = await tursoOperations.deleteSession(id);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 400 });
  }
}
