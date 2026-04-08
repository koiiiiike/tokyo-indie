import { NextResponse } from "next/server";
import { getDoc, updateDoc } from "@/lib/repositories/mock-doc-repository";

// TODO(HO-004): API は `repositories/index` 経由で repository を参照する。
type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const doc = await getDoc(id);

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

  // TODO(HO-005): title の空文字を許可するか仕様を確定し、必要なら 400 を返す。
  const updated = await updateDoc(id, payload);

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
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybe = value as { title?: unknown; body?: unknown };
  return typeof maybe.title === "string" && "body" in maybe;
}
