# SpellSnap — The Lost Islands of Words

A playable, browser-local companion prototype for ages 5–8. Chapter one: **Help Pip Get Home** (SUN → MAP → BOAT). Original vector scenery and a replaceable `Eyes`/`Pip` character live in `src/Scene.tsx`.

## Run

Use Node.js 20.19+ or 22.12+ with npm:

```sh
npm ci
npm run dev
```

Open the printed localhost address. Production: `npm run build`, then `npm run preview`. `dist/` is static hosting output. Tests: `npm test`. The project has no runtime backend and no API-key configuration.

## Try the whole adventure

1. Create a nickname and avatar, then Begin adventure → Let’s help Pip.
2. Expand **Toy simulator & developer tools** below the game. Add S, U, U; remove either U from its position. Add T and Try word for gentle incorrect feedback.
3. Ask for a hint (up to three progressively more explicit authored hints). Replace T with N; submit SUN. Click Find the way.
4. Build MAP and submit; continue to BOAT. Submit BOAT and Bring Pip home.
5. Open Grown-up corner (prototype gate: 7 + 5). Inspect words, attempts, hints, independent/assisted completions and sessions.
6. Reload: the active profile and completed challenges resume. Switch profiles to verify isolated progress.
7. In the simulator, disconnect mid-word. Submission and block changes stop. Reconnect restores the full current sequence. Repeated letters and removal at any position are supported.

## Working now

- Complete intro, three deterministic challenges, scene outcomes and ending.
- Local nickname/avatar profiles, separate saved progress, configurable first-letter support.
- Explicit submission, unfinished-word handling, progressive hints, optional browser speech (user-enabled), reduced-motion support and keyboard controls.
- Adult activity records and an honest, non-secure entry gate. No reading-ability scoring or sample records.
- Simulated connection, indexed block removal, repeated letters, clear/disconnect/reconnect.
- Proposed WebSocket adapter with challenge/session/sequence validation, full-state resynchronization and stale-hint cancellation.

## Storage and privacy

Profile data stays in this browser's localStorage and does not sync. Private browsing, browser clearing and storage restrictions can remove or prevent saves. An on-screen warning reports storage failures. Hosting locally and hosting privately online use different browser origins, so progress is separate. Sound preference is also local. No child email, real name, analytics or AI key is collected. Optional Google Fonts requests retrieve fonts only; system fonts work if unavailable. Browser speech availability/voice quality depends on the device; a platform voice may use its own speech service. Simulator hints remain readable without sound.

Partial and empty submissions are recorded as work in progress, not mistakes. First assessed success means no earlier full incorrect submission. A completion is assisted if any hint was requested or Gentle mode was enabled at completion. Sessions record profile selection and the latest submitted answer/hint, not time-on-task or attention. Records are descriptive and are not a literacy assessment.

## Architecture

- `content.ts`: chapter authoring, target words, hints and outcomes.
- `game.ts`: pure validation and progress/record rules.
- `storage.ts`: versioned storage interface; replace with authenticated storage later.
- `device.ts`: replaceable simulated and WebSocket adapters plus incoming message gate.
- `Scene.tsx`: original scenery and character components.
- `App.tsx`: screen orchestration, device events, profiles, play, adult report and dialogs.
- `style.css`: responsive tablet/laptop/mobile presentation and reduced motion.

## Still required for real hardware

Read **PROTOCOL.md** for the exact proposed message contract and examples. The current firmware is not integrated or tested. It needs a WebSocket/relay bridge and an app-orchestrated mode preserving its AI speech/eyes while disabling conflicting autonomous progression. Production use needs authenticated pairing, command acknowledgements/idempotency, and secure WSS transport; a published HTTPS page cannot be assumed to reach insecure local WS. No relay, cloud accounts, shared storage or multiplayer is included.
