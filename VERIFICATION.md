# Verification

Verified 2026-10-19 in the local browser preview:
- Created QA Acorn; opened the introduction and SUN challenge.
- Submitted empty and partial words; added repeated letters and removed a middle block.
- Submitted SUT, requested a hint, disconnected/reconnected, then completed SUN, MAP and BOAT.
- Reloaded before BOAT and resumed the correct challenge; reached the chapter ending.
- Adult records showed 3 completions, 2 first assessed successes, 1 hint, and 2 independent completions, with the individual submissions listed.
- Created QA Fern with zero progress; switched back to QA Acorn and reloaded with all three discoveries retained.
- Checked the ending at 390px width and restored the regular viewport. No captured browser warnings or errors.
- Production TypeScript/Vite build succeeded; all 7 automated tests passed.

QA profiles exist only in the local test browser. They are not seeded into the application.

Not verified: real ESP32 hardware, real AI audio/eyes, an external relay, browser speech audibility, or cross-browser compatibility. Simulator behavior and protocol validation are tested; hardware remains proposed integration.
