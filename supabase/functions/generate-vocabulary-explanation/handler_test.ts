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
      return "apple：苹果，一种常见的圆形水果。\n果肉可以直接食用，也常被做成果汁或果酱。";
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
    body.explanation ===
      "apple：苹果，一种常见的圆形水果。\n果肉可以直接食用，也常被做成果汁或果酱。",
    "response should contain the explanation",
  );
});

Deno.test("rejects provider output without the requested word heading", async () => {
  const handler = createExplanationHandler({
    isAdmin: async () => true,
    generate: async () => "A fruit.",
  });
  const response = await handler(request({ word: "apple" }));
  assert(response.status === 502, `expected 502, received ${response.status}`);
});

Deno.test(
  "allows house-style examples and lists after the word heading",
  async () => {
    const note =
      'string：字符串，由字符组成。\n- "cat" 是字符串。\nstring 日常还指“线、细绳”。';
    const handler = createExplanationHandler({
      isAdmin: async () => true,
      generate: async () => note,
    });
    const response = await handler(request({ word: "string" }));
    assert(
      response.status === 200,
      `expected 200, received ${response.status}`,
    );
    const body = await response.json();
    assert(
      body.explanation === note,
      "the complete house-style note should be kept",
    );
  },
);

Deno.test("rejects a note headed by a different word", async () => {
  const handler = createExplanationHandler({
    isAdmin: async () => true,
    generate: async () => "orange：橙子，一种水果。",
  });
  const response = await handler(request({ word: "apple" }));
  assert(response.status === 502, `expected 502, received ${response.status}`);
});

Deno.test("requires the exact word spelling and a full-width Chinese colon", async () => {
  for (
    const note of [
      "APPLE：苹果，一种常见的圆形水果。\n常见于水果沙拉，也可加工成果汁或果酱。",
      "apple: 苹果，一种常见的圆形水果。\n常见于水果沙拉，也可加工成果汁或果酱。",
    ]
  ) {
    const handler = createExplanationHandler({
      isAdmin: async () => true,
      generate: async () => note,
    });
    const response = await handler(request({ word: "apple" }));
    assert(response.status === 502, `expected 502 for ${note}`);
  }
});

Deno.test("rejects a bare translation without an explanation", async () => {
  const handler = createExplanationHandler({
    isAdmin: async () => true,
    generate: async () => "apple：苹果",
  });
  const response = await handler(request({ word: "apple" }));
  assert(response.status === 502, `expected 502, received ${response.status}`);
});

Deno.test("rejects a word-first note without a separate explanatory line", async () => {
  const handler = createExplanationHandler({
    isAdmin: async () => true,
    generate: async () =>
      "apple：苹果、林檎、沙果等苹果类水果的统称，也可指苹果这种植物。",
  });
  const response = await handler(request({ word: "apple" }));
  assert(response.status === 502, `expected 502, received ${response.status}`);
});

Deno.test("requires one substantial follow-up line", async () => {
  const handler = createExplanationHandler({
    isAdmin: async () => true,
    generate: async () =>
      "apple：苹果，一种常见水果，常用于烹饪或直接食用。\n常见\n水果\n可食\n用法\n广泛",
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
        content: [{
          type: "output_text",
          text: "apple：苹果，一种常见的水果。",
        }],
      },
      {
        type: "message",
        content: [{
          type: "output_text",
          text: "苹果可以直接食用，也常用于水果沙拉。",
        }],
      },
    ],
  });
  assert(
    explanation ===
      "apple：苹果，一种常见的水果。\n苹果可以直接食用，也常用于水果沙拉。",
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
