import { NextResponse } from "next/server";
import { pruneStorageKeepingLatestSet } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

export type ResetDemoResponse = {
  kept: string | null;
  deleted: number;
};

export async function POST() {
  try {
    const result = await pruneStorageKeepingLatestSet();
    return NextResponse.json(result satisfies ResetDemoResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[reset-demo]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
