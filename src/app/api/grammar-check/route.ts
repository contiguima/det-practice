import { NextResponse } from "next/server";

type LtMatch = {
  offset: number;
  length: number;
  message: string;
  replacements: Array<{ value: string }>;
  rule?: { id?: string; description?: string };
};

export async function POST(req: Request) {
  let text = "";
  try {
    const body = (await req.json()) as { text?: unknown };
    text = typeof body.text === "string" ? body.text : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const trimmed = text.slice(0, 20000);
  if (trimmed.length < 3) {
    return NextResponse.json({ matches: [] satisfies LtMatch[] });
  }

  const params = new URLSearchParams();
  params.set("text", trimmed);
  params.set("language", "en-US");
  params.set("enabledOnly", "false");

  try {
    const res = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      return NextResponse.json({ matches: [] }, { status: 200 });
    }
    const json = (await res.json()) as { matches?: LtMatch[] };
    const matches = Array.isArray(json.matches) ? json.matches : [];
    const slim = matches.slice(0, 12).map((m) => ({
      offset: m.offset,
      length: m.length,
      message: m.message,
      replacements: (m.replacements ?? []).slice(0, 3).map((r) => ({ value: r.value })),
      ruleId: m.rule?.id,
    }));
    return NextResponse.json({ matches: slim });
  } catch {
    return NextResponse.json({ matches: [] });
  }
}
