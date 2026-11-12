# OpenChamber TPS Meter

An OpenChamber extension that shows the generation rate of the open session:
a rolling **last-5-seconds** tokens-per-second readout, plus characters per
second, the current chars-per-token estimate, and the session's real token
total.

It shows up in two places: a rail panel with the full detail, and a compact
section in the chat's Work Status panel. Both are thin views. A small local
service does the measuring.

## Requirements

- OpenChamber **2.0.1** or newer (OpenCode 2.0.15+). The extension reads the
  OpenCode 2 event stream, and the Work Status section needs 2.0.1. The 1.0.x
  releases were the last ones for OpenChamber 1.x, where that stream had
  different event names.
- Extensions load on OpenChamber web and desktop only. VS Code and the mobile
  app do not load them.

## What it does

- Opens as a rail panel next to the built-in panels.
- Follows the open chat. Switch sessions and it rewires to the new one.
- Shows a large `tok/s` value, a bar that tracks the recent peak, and the
  session title with its live status (`generating` / `idle`).
- After a turn finishes, shows **that turn's final average** separately, so the
  live number and the completed result do not overwrite each other.
- Shows the session's **real token total** (generated tokens, from OpenCode's
  own usage events) beside the local estimate.

### Work Status section

The chat's Work Status panel gets a **TPS** section with five lines:

| Line | Shows |
| --- | --- |
| Live | The rolling 5-second `tok/s` and a bar against the recent peak. The number turns muted between turns. |
| Last turn | The finished turn's tokens over its generation time, and its average `tok/s`. A `~` marks a character estimate; hover for the active and paused time. |
| Session | Tokens generated in the session so far (`output + reasoning`). |
| Chars/s | Streamed characters per second over the same 5-second window: text, reasoning, and tool input. This is the measured value the live number is computed from, and it turns muted between turns like the live number. |
| Tokens/char | The calibrated ratio behind the live number: model tokens per streamed character. Hover for how the live rate uses it. |

Problems that stop the measurement (the service is not approved, the surface
cannot reach the server) replace the lines with a short note. The section
follows the chat it sits in, sizes itself to its content, and can be hidden or
moved from the panel's section chooser like any other section.

The section is a frame of its own rather than a section OpenChamber draws from
a service answer (`statusSection.source`). Such an answer is requested with
only the app's locale and the project directory, while the service needs the
session and the OpenChamber origin, which only a frame can hand it.

## How it measures

```
rail panel / Work Status section (sandboxed iframes)
  │  POST /watch { origin, sessionId }   ← the origin comes from location.href
  │  GET  /rate                          ← polled every 250 ms (panel) or 500 ms (section)
  ▼
host loopback proxy  ──►  service process (127.0.0.1)
                              │  GET <origin>/api/global/event   (Server-Sent Events)
                              ▼
                         OpenChamber event stream
```

The service subscribes to `GET /api/global/event`, the same global event stream
OpenChamber's own hub reads, and counts streamed output characters for the
watched session inside a five-second window. Two details of that stream matter:

- It forwards OpenCode 2 wire events (`{ id, created, type, data }`). A proxy
  that wraps them as `{ payload, directory, eventId }` is unwrapped too.
- `/api/event` is the directory-scoped sibling: without a `directory` parameter
  it carries only the server's default directory, so an open project never sees
  its own session events there. That is why the global stream is used.

The counter itself:

- Text, reasoning, and tool input all count. Tool call arguments are generated
  by the model and billed in `tokens.output`, so leaving them out would compare
  a step's full token count with only part of its characters.
- `session.text.delta`, `session.reasoning.delta`, and
  `session.tool.input.delta` are the primary source.
- The full-value boundaries (`session.text.ended`, `session.reasoning.ended`,
  `session.tool.input.ended`) cover a part that sent no fragments. Some
  providers deliver reasoning in one piece at the end of the part, and tool
  input usually arrives only there. They are also the fallback for a service
  that attached after the deltas went by. A part is counted by exactly one of
  the two paths.
- Each settled step (`session.step.ended`, or `session.step.failed` with
  counts) reports the provider's real `tokens.output + tokens.reasoning`. Those
  recalibrate chars-per-token, smoothed with an exponential moving average and
  clamped to `0.05 .. 1`.
- `session.usage.updated` reports the session's running totals (cost and
  input/output/reasoning/cache tokens). The panel shows generated tokens
  (`output + reasoning`) from it.

The rolling tokens-per-second is `charsPerSecond × charsPerToken`. It is an
estimate of generation throughput, because the live stream only carries text
fragments; real token counts arrive per settled step, not per character. A part
that arrives in one piece enters the window at once, so the live number moves
in steps for it. The finished-turn average and the session total use the real
counts.

## Turn average

A turn spans `session.execution.started` until `session.execution.succeeded` or
`session.execution.failed`. A `session.execution.interrupted` with reason
`shutdown` keeps the turn open, because OpenCode resumes the same turn after a
restart; every other interruption ends it. Its average divides tokens by the
time the model spent streaming them:

- Each step (one model call) counts from its first output to
  `session.step.streamed`, the end of its model stream. The first output is a
  part start (`session.text.started`, `session.reasoning.started`,
  `session.tool.input.started`) or the first fragment, whichever comes first.
  Without `session.step.streamed`, the step ends at its last output.
- Everything between the spans is left out: time to the first token of each
  step, tool execution, retries, and waits for the user. Tools run after
  `session.step.streamed`, and `session.step.ended` follows them, so the step's
  settlement is never used as the end of its stream.
- Gaps between characters are not used. Reasoning can arrive in one piece or in
  bursts seconds apart, and tool input often arrives with no fragments at all,
  while the model is generating the whole time.
- OpenCode keeps the session `busy` while an agent waits for the user, so
  `waiting-permission` and `waiting-question` are detected from `permission.*`
  and `form.*` events (`form.*` is the OpenCode 2 shape of the question tool),
  and the panel shows `waiting for permission` / `waiting for answer` instead of
  `generating`. Those waits happen while a tool runs, outside every span.

When the turn ends the service reports:

- `tokens`: the sum of `output + reasoning` across the turn's settled steps,
  adjusted per assistant message id so a retried step counts once.
- `activeMs`: the sum of the steps' streaming spans, one per assistant message
  id, so a retried step counts once here too.
- `wallMs`: the turn's first output to the end of its last step's stream.
- `pausedMs`: `wallMs - activeMs`, what the average left out.
- `tokensPerSecond`: `tokens / activeMs`.
- `source`: `tokens` when real counts existed, otherwise `estimate` from
  characters times the calibrated ratio. The panel labels the estimated case.

A turn whose output spans less than 100 ms reports no average: a service that
attached late sees only finished parts and has no timing for them.

The panel shows the active time, and adds `paused` once a turn has excluded at
least a second. Switching the watched session clears the stored turn and the
session totals.

## Build

```bash
bun install
bun run build      # panel/main.js + status/main.js (IIFE), service/main.js (ESM)
```

`bun run build:panel`, `bun run build:status`, and `bun run build:service`
build one part each. All use `openchamber-guest-bundle` from
`@openchamber/sdk`. Code both frames use (the `/rate` answer shape, the origin
lookup, host error messages) lives in `shared/` and is bundled into each frame.
Commit the built files: OpenChamber never compiles an extension at install
time.

## Install

Settings → Extensions → **Folder, ZIP, or URL**, paste
`https://github.com/airtaxi/openchamber-tps`, and choose **Add**. Approve the
permissions dialog: it includes **Run a local service**, which is what the meter
needs. The rail icon and the Work Status section appear once it is approved.

A Git install can update itself. Bump `version` in `package.json`, rebuild, and
push; OpenChamber offers the update the next time Settings → Extensions is
opened. Add `#v1.0.0` or `#main` to the URL to pin a tag or branch. On
OpenChamber 1.x the install is refused: pin `#v1.0.1`, the last release for that
line.

To work on the extension itself, add the absolute path of your checkout
instead. A folder install runs straight from that folder and never updates on
its own.

## Test

```bash
node scripts/smoke.mjs
```

The smoke test starts a mock OpenChamber event stream and the built service,
feeds synthetic OpenCode 2 events in the order a real stream sends them, and
asserts the counted characters, the rolling rate, the calibration, the real
token counts (per step and per session), the finished-turn average, the wait
accounting, and the session filtering. It covers reasoning that arrives in one
piece, tool input with no fragments, the delta path, the full-value `*ended`
fallback path, `session.execution.*` status, the `shutdown` interruption, and
the state cleared when the watched session changes.

## Limitations

- **OpenChamber UI password.** The service subscribes to `/api/global/event`
  without a session. If the instance is protected with a UI password, the stream
  answers `401` and the panel shows a reconnect notice instead of a rate.
- **Relay frames.** Under the private relay the panel runs from `srcDoc` with no
  usable origin, so the meter cannot discover the event stream and says so.
- **Managed OpenCode auth.** OpenChamber starts its managed OpenCode server with
  a generated password the service process never receives, which is why the
  service reads OpenChamber's own `/api/global/event` proxy rather than OpenCode
  directly. This is also why an instance-level UI password blocks it.
- **No per-token streaming.** Deltas carry characters only. The rolling number
  stays a calibrated character estimate; real counts arrive per settled step
  (`session.step.ended`) and per session (`session.usage.updated`).
- **Reasoning counts as output.** Reasoning text is generated text, so deltas
  from reasoning parts are counted. That matches `tokens.output + reasoning`
  used for calibration, but it is not the same as visible answer characters.
- **One watched session.** The service measures one session at a time. The rail
  panel and the Work Status section follow the same chat, so they agree; two
  windows on different chats move the service to whichever switched last.

## License

MIT. See [LICENSE](LICENSE).
