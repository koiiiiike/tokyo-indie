import { NextResponse } from "next/server";
import { docRepository } from "@/lib/repositories";

export async function GET() {
  const docs = await docRepository.listDocs();
  return NextResponse.json(docs);
}
