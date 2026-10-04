import { createExplanationHandler } from "./handler.ts";
import { extractCompletedExplanation } from "./openai.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function request(body: unknown) {
  return new Request(
    "http://localhost/functions/v1/generate-vocabulary-explanation",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer test-user-jwt",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
}

Deno.test("rejects a non-admin before calling the generator", async () => {
  let generated = false;
  const handler = createExplanationHandler({
    isAdmin: async () => false,
    generate: async () => {
      generated = true;
      return "unused";
    },
  });
  const response = await handler(
    request({ word: "apple", example: "An apple is red." }),
  );
  assert(response.status === 403, `expected 403, received ${response.status}`);
  assert(!generated, "the provider must not be called for a non-admin");
});

Deno.test("rejects invalid words before checking admin or calling the provider", async () => {
  let checkedAdmin = false;
  const handler = createExplanationHandler({
    isAdmin: async () => {
      checkedAdmin = true;
      return true;
    },
    generate: async () => "unused",
  });
  const response = await handler(request({ word: "not a word" }));
  assert(response.status === 400, `expected 400, received ${response.status}`);
  assert(
    !checkedAdmin,
    "invalid input should be rejected before the role lookup",
  );
});

Deno.test("returns a generated explanation to an admin", async () => {
  let received = "";
  const handler = createExplanationHandler({
    isAdmin: async (authorization) => authorization === "Bearer test-user-jwt",
    generate: async (word, example) => {
      received = `${word}|${example}`;
      return "English: a fruit.\n中文: 一种水果。";
    },
  });
  const response = await handler(
    request({ word: "apple", example: "An apple is red." }),
  );
  const body = await response.json();
  assert(response.status === 200, `expected 200, received ${response.status}`);
  assert(
    received === "apple|An apple is red.",
    `unexpected provider input: ${received}`,
  );
  assert(
    body.explanation === "English: a fruit.\n中文: 一种水果。",
    "response should contain the explanation",
  );
});

Deno.test("rejects provider output without the required English and Chinese lines", async () => {
  const handler = createExplanationHandler({
    isAdmin: async () => true,
    generate: async () => "A fruit.",
  });
  const response = await handler(request({ word: "apple" }));
  assert(response.status === 502, `expected 502, received ${response.status}`);
});

Deno.test("rejects provider output with extra lines", async () => {
  const handler = createExplanationHandler({
    isAdmin: async () => true,
    generate: async () =>
      "English: a fruit.\n中文: 一种水果。\nExample: red apple.",
  });
  const response = await handler(request({ word: "apple" }));
  assert(response.status === 502, `expected 502, received ${response.status}`);
});

Deno.test("extracts text across all output messages in a completed response", () => {
  const explanation = extractCompletedExplanation({
    status: "completed",
    output: [
      { type: "reasoning", content: [] },
      {
        type: "message",
        content: [{ type: "output_text", text: "English: a fruit." }],
      },
      {
        type: "message",
        content: [{ type: "output_text", text: "中文: 一种水果。" }],
      },
    ],
  });
  assert(
    explanation === "English: a fruit.\n中文: 一种水果。",
    "should collect generated text from messages",
  );
});

Deno.test("rejects an incomplete OpenAI response", () => {
  let rejected = false;
  try {
    extractCompletedExplanation({ status: "incomplete", output: [] });
  } catch {
    rejected = true;
  }
  assert(rejected, "incomplete provider responses must not be used");
});

Deno.test("returns a retryable error when generation fails", async () => {
  const handler = createExplanationHandler({
    isAdmin: async () => true,
    generate: async () => {
      throw new Error("provider details stay server-side");
    },
  });
  const response = await handler(request({ word: "apple" }));
  const body = await response.json();
  assert(response.status === 502, `expected 502, received ${response.status}`);
  assert(
    body.error === "Could not generate explanation.",
    "response should be concise and generic",
  );
});
