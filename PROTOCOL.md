# Proposed SpellSnap device protocol v1

This is a proposal implemented by the browser adapter, not firmware already installed on the toy. Physical integration has not been tested. The simulator does not call an AI service.

## Transport and security

The adapter uses JSON over WebSocket. Local development serves the app over HTTP on localhost; a future ESP32 WS server may be reachable on the same network, subject to browser local-network permissions. Production HTTPS should use a trusted `wss://` endpoint. The app explicitly rejects `ws://` from HTTPS, rather than encouraging users to disable browser security. Browsers, certificates, local-network permissions and hosting CSP can still prevent a WSS connection. See [MDN WebSocket client security](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications) and [Chrome local network access](https://developer.chrome.com/blog/local-network-access).

No relay is included. A deployed real-device system needs either (a) ESP32 TLS with a browser-trusted certificate and suitable network access or (b) an authenticated WSS relay with the ESP32 establishing an outbound authenticated connection. The relay must pair a toy to its adult owner, validate origins and message sizes, rate-limit commands, and prevent unauthorized control. The endpoint field is configuration, not authentication. Do not put tokens or AI keys in a URL or browser bundle. Preserve the existing AI helper and TTS credentials on the ESP32 or a future trusted service.

## Ownership

The app owns target selection, story progression, explicit Try-word validation, records, and whether a challenge is complete. The ESP32 owns physical detection, generated speech and eye animation. In `app-orchestrated` mode the ESP32 must **disable autonomous success detection/celebration and autonomous hint triggers** from its standalone mode, while retaining the existing AI/TTS generation functions. The app sends `hint.request` and `challenge.complete` to invoke them. Do not run two independent helpers. Robot connection effects may still be driven locally by physical block changes. Browser speech is used only for simulator hints/feedback, after the user enables sound.

## Envelope

Every frame has `v:1`, `type`, `sessionId`, `challengeId`, `seq`, and `payload`. `seq` is a strictly increasing safe integer per direction within a connection session. Browser outgoing and device outgoing counters are independent. A new reconnect creates a new sessionId and resets counters. The device echoes that sessionId. `challengeId` is a fresh activation UUID (not just the word), changed on profile/challenge changes and returning to play. `contentId` is the stable authoring ID such as `forest-sun`.

Device messages with a different session/challenge or non-increasing sequence are discarded. Full snapshots must contain an array of 0–10 single uppercase A–Z letters, including duplicates in physical order. Never send only add/remove deltas: snapshots avoid drift.

## Connection and challenge start

On socket open the app sends `session.hello`, then `challenge.start`, then `state.request`. It remains Connecting and disables submission until a valid snapshot arrives. An eight-second snapshot timeout shows an understandable error. Reconnect is explicit; use Connection settings to reconnect a real device. The simulator reconnect button requests its preserved full state immediately.

```json
{"v":1,"type":"session.hello","sessionId":"session-abc","challengeId":"activation-123","seq":1,"payload":{"role":"story-controller"}}
{"v":1,"type":"challenge.start","sessionId":"session-abc","challengeId":"activation-123","seq":2,"payload":{"contentId":"forest-boat","target":"BOAT","helperMode":"app-orchestrated"}}
{"v":1,"type":"state.request","sessionId":"session-abc","challengeId":"activation-123","seq":3,"payload":{}}
{"v":1,"type":"device.status","sessionId":"session-abc","challengeId":"activation-123","seq":1,"payload":{"connected":true}}
{"v":1,"type":"letters.snapshot","sessionId":"session-abc","challengeId":"activation-123","seq":2,"payload":{"letters":["B","O","O"]}}
```

Start tells the ESP32 to cancel obsolete generation/playback and prepare the target's success sentence in the background, as the existing firmware does. It must report the actual attached blocks, not manufacture or erase the physical state. The simulator clears on each challenge because its virtual blocks are part of the test harness. A `device.status` with `connected:false` invalidates the current snapshot. It does not make a connected status alone sufficient to submit.

## Hints

```json
{"v":1,"type":"hint.request","sessionId":"session-abc","challengeId":"activation-123","seq":4,"payload":{"requestId":"hint-456","level":1,"letters":["B","O","O"]}}
{"v":1,"type":"hint.ready","sessionId":"session-abc","challengeId":"activation-123","seq":3,"payload":{"requestId":"hint-456","text":"Try the letter A in the third spot."}}
{"v":1,"type":"hint.cancel","sessionId":"session-abc","challengeId":"activation-123","seq":5,"payload":{"requestId":"hint-456"}}
```

The ESP32 generates and speaks the hint, sending `hint.ready` for a caption. It must check session/challenge/request validity before speaking. `hint.cancel` cancels the specified request; if requestId is omitted, cancel all hints for that activation. A letter change, disconnect, profile/navigation change, success, new hint, or 30-second timeout cancels pending hints. Late captions must match the active requestId; older ones are ignored. Count requested hints in the adult report even if the network fails (the label is Hints requested, not hints heard). Do not interpret network failure as a child error.

## Completion and celebration

```json
{"v":1,"type":"challenge.complete","sessionId":"session-abc","challengeId":"activation-123","seq":6,"payload":{"completionId":"profile-789:forest-boat","word":"BOAT","celebrate":true}}
```

Only the app's exact deterministic comparison triggers completion. The device cancels hints, plays its eyes/celebration once, then the prepared success sentence. Persistently deduplicate completionId for the lifetime of this saved chapter. The app persists completion before showing success and does not re-send completion on reload. This prototype has no acknowledged command queue: a lost completion frame may mean the toy misses its celebration, while the saved app progression remains correct. Production firmware/relay work should add `command.ack`, a durable completion ledger and idempotent retries. A replay feature would require a new runId in completionId; it is deliberately not present yet.

## Limits

No authentication, relay, firmware bridge, background retries, verified hardware pairing, cloud storage, or multiplayer is implemented. Browser connection failures are not proof of firmware defects. AI keys from the earlier prototype are never copied into this app.
