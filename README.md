# OpenChamber TPS Meter

An OpenChamber extension that shows the generation rate of the open session:
a rolling **last-5-seconds** tokens-per-second readout, plus characters per
second and the current chars-per-token estimate.

The panel is a thin view. A small local service does the measuring.

## What it does

- Opens as a rail panel next to the built-in panels.
- Follows the open chat. Switch sessions and it rewires to the new one.
- Shows a large `tok/s` value, a bar that tracks the recent peak, and the
  session title with its live status (`generating` / `idle`).
- After a turn finishes, shows **that turn's final average** separately, so the
  live number and the completed result do not overwrite each other.

## How it measures

```
panel (sandboxed iframe)
  │  POST /watch { origin, sessionId }   ← the origin comes from location.href
  │  GET  /rate                          ← polled every 250 ms
  ▼
host loopback proxy  ──►  service process (127.0.0.1)
                              │  GET <origin>/api/global/event   (Server-Sent Events)
                              ▼
                         OpenChamber event stream
```

The service subscribes to `GET /api/global/event`, the same global event stream
OpenChamber's own hub reads, and counts streamed output characters for the
watched session inside a five-second window. Two details of that stream matter:

- It wraps each event as `{ payload, directory, eventId }`, so the service
  unwraps `payload`. A bare event is accepted too.
- `/api/event` is the directory-scoped sibling: without a `directory` parameter
  it carries only the server's default directory, so an open project never sees
  its own session events there. That is why the global stream is used.

The counter itself:

- `message.part.delta` with `field: "text"` is the primary source.
- `message.part.updated` snapshots are the fallback for a server that does not
  emit deltas. A part is counted by exactly one of the two paths.
- Completed `message.updated` turns recalibrate chars-per-token from the real
  `tokens.output + tokens.reasoning`, smoothed with an exponential moving
  average and clamped to `0.05 .. 1`.

Tokens-per-second is `charsPerSecond × charsPerToken`. It is an estimate of
generation throughput, not a server-reported token counter, because the event
stream carries characters per delta and tokens only per completed turn.

## Turn average

A turn spans the first streamed character after idle until `session.idle`, so
its average describes generation time, not the tool waits before the first
token or after the last one. When the turn ends the service reports:

- `tokens`: the sum of `output + reasoning` across the turn's completed
  assistant messages, counted once per message.
- `durationMs`: first counted character to last counted character.
- `tokensPerSecond`: `tokens / durationMs`.
- `source`: `tokens` when real counts existed, otherwise `estimate` from
  characters times the calibrated ratio. The panel labels the estimated case.

Switching the watched session clears the stored turn.

## Build

```bash
bun install
bun run build      # panel/main.js (IIFE) + service/main.js (ESM)
```

`bun run build:panel` and `bun run build:service` build one side each. Both use
`openchamber-guest-bundle` from `@openchamber/sdk`. Commit the built files:
OpenChamber never compiles an extension at install time.

## Install

Settings → Extensions → **Folder, ZIP, or URL**, paste
`https://github.com/airtaxi/openchamber-tps`, and choose **Add**. Approve the
permissions dialog: it includes **Run a local service**, which is what the meter
needs.

A Git install can update itself. Bump `version` in `package.json`, rebuild, and
push; OpenChamber offers the update the next time Settings → Extensions is
opened. Add `#v1.0.0` or `#main` to the URL to pin a tag or branch.

To work on the extension itself, add the absolute path of your checkout
instead. A folder install runs straight from that folder and never updates on
its own.

## Test

```bash
node scripts/smoke.mjs
```

The smoke test starts a mock event stream and the built service, feeds synthetic
deltas and part snapshots, and asserts the counted characters, the rate, the
calibration, the finished-turn average, and the session filtering. It covers the
delta path, the `message.part.updated` fallback path, token rejection,
`session.idle`, and the state cleared when the watched session changes.

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
- **Runtime.** Extensions load on OpenChamber web and desktop only. VS Code and
  the mobile app do not load them.
- **Reasoning counts as output.** Reasoning text is generated text, so deltas
  from reasoning parts are counted. That matches `tokens.output + reasoning`
  used for calibration, but it is not the same as visible answer characters.

## License

MIT. See [LICENSE](LICENSE).
