import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";
import { parseHomePracticeTsv } from "@/lib/homePracticeBank";

export async function GET() {
  try {
    const dataDir = join(process.cwd(), "data");
    const files = (await readdir(dataDir))
      .filter((f) => f.startsWith("home-practice-chunk-") && f.endsWith(".tsv"))
      .sort();

    if (files.length === 0) {
      return NextResponse.json({ words: [] }, { status: 404 });
    }

    const raw = (
      await Promise.all(files.map((f) => readFile(join(dataDir, f), "utf8")))
    ).join("\n");

    const words = parseHomePracticeTsv(raw);
    return NextResponse.json({ words });
  } catch {
    return NextResponse.json({ words: [] }, { status: 404 });
  }
}
