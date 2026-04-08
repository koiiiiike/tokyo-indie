import { NextResponse } from "next/server";
import { docRepository } from "@/lib/repositories";

export async function GET() {
  try {
    const docs = await docRepository.listDocs();
    return NextResponse.json(docs);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
