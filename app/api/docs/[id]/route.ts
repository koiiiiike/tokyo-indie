import { NextResponse } from "next/server";
import { docRepository } from "@/lib/repositories";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const doc = await docRepository.getDoc(id);

  if (!doc) {
    return NextResponse.json({ message: "Document not found." }, { status: 404 });
  }

  return NextResponse.json(doc);
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON request body." }, { status: 400 });
  }

  if (!isValidPayload(payload)) {
    return NextResponse.json(
      { message: "Payload must include title:string and body:any." },
      { status: 400 }
    );
  }

  if (payload.title.trim() === "") {
    return NextResponse.json({ message: "title は空にできません。" }, { status: 400 });
  }

  const updated = await docRepository.updateDoc(id, payload);

  if (!updated) {
    return NextResponse.json({ message: "Document not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

function isValidPayload(
  value: unknown
): value is {
  title: string;
  body: unknown;
} {
  if (!value || typeof value !== "object") return false;
  const maybe = value as { title?: unknown; body?: unknown };
  return typeof maybe.title === "string" && "body" in maybe;
}
