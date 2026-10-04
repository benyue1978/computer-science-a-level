# Vocabulary Explanation Generation

**Status:** Approved in conversation on 2026-10-04.

## Goal

Let vocabulary administrators generate a concise explanation for a word that has no explanation. The action is available in All words and for words selected in Today. Generated text is saved as the administrator's private explanation; sharing it remains a separate, explicit publish action.

## Existing behavior

Each vocabulary word has one effective `note`. The same note is edited from the All words card and from a selected word in Today. Guest notes are stored locally; signed-in notes are saved in the user's protected account snapshot. Existing shared explanations are used when there is no personal explanation. Publishing is a separate administrator-only action, enforced by Supabase row-level security and exposed through the current editor.

The app already loads administrator status through `is_vocabulary_admin()`. The current project has no application-level LLM integration. Its Supabase Studio AI setting does not configure an application function.

## User experience

- A signed-in administrator sees **Generate explanation** for a word with a blank explanation in All words and in Today after selecting that word.
- Guests and non-administrators do not see the action. If the client cannot confirm administrator status, it hides the action.
- While generation is in progress, the relevant control shows **Generating…** and is disabled to prevent duplicate requests. The word's explanation field is unavailable until that request completes.
- On success, the generated text fills the existing explanation field. It remains editable and is saved through the current private-note flow.
- On failure, the explanation is unchanged, an inline error is shown, and the administrator can retry.
- The existing **Publish for everyone** action remains separate. Generation never changes a shared explanation.

Generation is limited to the All words and Today surfaces named above. It is not added to the Known list, sent history, or bulk workflows.

## Generation function and data flow

1. The client sends the normalized word and, when available, its first source sentence to a Supabase Edge Function. It sends no account notes or other personal data.
2. The function validates the request and verifies the signed-in caller's administrator role by calling the existing `is_vocabulary_admin()` RPC. It rejects unauthorized requests before contacting the LLM provider; hiding the button is not the security boundary.
3. The function calls OpenAI using a server-side `OPENAI_API_KEY` Supabase function secret. The key is never included in the browser bundle or client request.
4. The model is instructed to follow the existing shared-glossary style: begin with the exact word and a Chinese full-width colon, then give its Chinese meaning. A following line adds a useful explanation, example, or connection so the note teaches more than a bare translation or synonyms. The source sentence disambiguates the word's sense when supplied. Computing terminology stays within IGCSE/A-Level knowledge, with no advanced material or unrelated trivia. If no sentence is available, the model gives the most relevant common meaning without claiming unsupported context.
5. The client puts a successful result into the word's existing `note`, provided that the note is still blank. The current save flow persists it privately. The administrator may edit it and use the existing publish action separately.

The button is shown only for a blank note, so existing personal or shared explanations are not regenerated or replaced. The client prevents editing that word's explanation while its request is pending, avoiding a late response overwriting an administrator's text.

## Errors and access control

- The client fails closed when administrator status is unknown or its lookup fails.
- The Edge Function independently rejects missing sessions and non-administrators before calling OpenAI.
- Invalid requests, missing provider configuration, provider failures, and malformed responses leave the note unchanged. The client shows a concise inline error and permits retry.
- Provider details and credentials are not exposed to the browser. Publishing remains subject to the existing Supabase authorization rules.

## Acceptance criteria

- A signed-in administrator can generate from an empty explanation in All words or Today.
- A guest or non-administrator cannot invoke generation, even if they call the function directly.
- A non-empty explanation never shows the Generate action and is never overwritten by a generation response.
- A successful response fills and privately saves the existing note; the administrator can edit and publish it using existing controls.
- A failed request leaves the note unchanged and offers a retry.

## Out of scope

- Generation for guests or non-administrators.
- Automatically publishing generated content, replacing shared explanations, bulk generation, or generation in other views.
- Adding a second explanation field, generation history, or a new persistence schema.
