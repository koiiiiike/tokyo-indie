import { NextResponse } from "next/server";
import { listDocs } from "@/lib/repositories/mock-doc-repository";

// TODO(HO-003): `repositories/index` を作成し、mock/redis の切替を env で制御する。
// TODO(HO-004): API は `repositories/index` 経由で repository を参照する。
export async function GET() {
  const docs = await listDocs();
  return NextResponse.json(docs);
}
