import { readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";
import type { FitbExercise } from "@/lib/fillInTheBlanks/types";

export async function GET() {
  try {
    const raw = await readFile(join(process.cwd(), "data", "fill-in-the-blanks.json"), "utf8");
    const data = JSON.parse(raw) as { exercises?: FitbExercise[] };
    return NextResponse.json({ exercises: data.exercises ?? [] });
  } catch {
    return NextResponse.json({ exercises: [] }, { status: 404 });
  }
}
