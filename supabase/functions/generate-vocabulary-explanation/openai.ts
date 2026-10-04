type ResponseContent = { type?: unknown; text?: unknown };

export function extractCompletedExplanation(payload: unknown): string {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("OpenAI returned an invalid response.");
  }
  const response = payload as { status?: unknown; output?: unknown };
  if (response.status !== "completed") {
    throw new Error("OpenAI did not complete the response.");
  }

  const chunks: string[] = [];
  const output = Array.isArray(response.output) ? response.output : [];
  for (const rawItem of output) {
    if (!rawItem || typeof rawItem !== "object" || Array.isArray(rawItem)) {
      continue;
    }
    const item = rawItem as { type?: unknown; content?: unknown };
    if (item.type !== "message" || !Array.isArray(item.content)) continue;
    for (const rawContent of item.content as ResponseContent[]) {
      if (
        rawContent?.type === "output_text" &&
        typeof rawContent.text === "string"
      ) {
        chunks.push(rawContent.text);
      }
    }
  }

  const explanation = chunks.join("\n").trim();
  if (!explanation) throw new Error("OpenAI returned no explanation text.");
  return explanation;
}
