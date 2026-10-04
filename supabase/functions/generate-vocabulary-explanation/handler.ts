export type ExplanationDependencies = {
  isAdmin: (authorization: string) => Promise<boolean>;
  generate: (word: string, example?: string) => Promise<string>;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function hasRequiredExplanationFormat(explanation: string, word: string) {
  const heading = `${word}：`;
  if (!explanation.startsWith(heading)) return false;

  const explanationBody = explanation.slice(heading.length).replace(/\s/g, "");
  const hasSubstantialFollowUp = explanation
    .split(/\r?\n/)
    .slice(1)
    .some((line) => Array.from(line.replace(/\s/g, "")).length >= 10);
  return Array.from(explanationBody).length >= 20 && hasSubstantialFollowUp;
}

export function createExplanationHandler(deps: ExplanationDependencies) {
  return async (request: Request): Promise<Response> => {
    if (request.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
    if (request.method !== "POST") {
      return jsonResponse(405, { error: "Method not allowed." });
    }

    const authorization = request.headers.get("Authorization");
    if (!authorization) {
      return jsonResponse(401, {
        error: "Sign in as a vocabulary administrator.",
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonResponse(400, { error: "Invalid request." });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse(400, { error: "Invalid request." });
    }

    const payload = body as { word?: unknown; example?: unknown };
    const word = typeof payload.word === "string" ? payload.word.trim() : "";
    if (!/^[a-z][a-z'-]{0,59}$/.test(word)) {
      return jsonResponse(400, { error: "Invalid word." });
    }
    if (
      payload.example !== undefined &&
      (typeof payload.example !== "string" || payload.example.length > 2000)
    ) {
      return jsonResponse(400, { error: "Invalid source sentence." });
    }
    const example = typeof payload.example === "string"
      ? payload.example.trim()
      : undefined;

    let admin: boolean;
    try {
      admin = await deps.isAdmin(authorization);
    } catch {
      return jsonResponse(503, {
        error: "Could not verify administrator access.",
      });
    }
    if (!admin) {
      return jsonResponse(403, { error: "Administrator access required." });
    }

    try {
      const explanation = (await deps.generate(word, example)).trim();
      if (
        !explanation || explanation.length > 1000 ||
        !hasRequiredExplanationFormat(explanation, word)
      ) {
        return jsonResponse(502, { error: "Could not generate explanation." });
      }
      return jsonResponse(200, { explanation });
    } catch {
      return jsonResponse(502, { error: "Could not generate explanation." });
    }
  };
}
