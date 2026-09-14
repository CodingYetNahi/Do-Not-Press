# DON'T PRESS THAT

A mobile-first, one-life arcade of short, mischievous micro-games. Press the button you were explicitly warned about, read quickly, and survive as long as possible. Everything runs locally: there are no accounts, network calls, or build step.

> **Screenshot placeholder:** Add a portrait gameplay capture at `docs/screenshot.png` when publishing the repository.

## Play and controls

- **Tap / click:** buttons, targets, timing stops, and selections.
- **Press and hold:** hold, stillness, and eye challenges.
- **Drag / swipe:** key, catcher, and danger-zone challenges.
- **Keyboard:** Tab gives normal focus navigation; Enter/Space activates the focused control or the primary arena target.
- Use the **♪ / ×** control to toggle generated sound. Critical information is always visual too.

A round has one life. Every success adds one point and immediately introduces a randomly chosen challenge; the previous two challenges are excluded where possible. Difficulty grows with the current score.

## The 20 challenges

1. **Tap Seven** — tap exactly seven times.
2. **Hold** — hold, and at higher difficulty react to “LET GO”.
3. **Don't Touch** — resist animated bait.
4. **Catch Him** — catch a falling creature.
5. **Wrong Button** — use the honest label as a logical clue.
6. **Red Means Go** — tap red “GO” targets; avoid green “STOP”.
7. **Stop at 100** — freeze the counter at the target.
8. **Don't Move** — hold without moving despite visual shake.
9. **Follow the Dot** — reproduce a shown sequence.
10. **Swipe Away** — flick three objects away from danger.
11. **Lights Out** — remember illuminated tiles.
12. **Don't Blink** — hold to guide a pupil to its mark.
13. **Save the Button** — catch an evasive button four times.
14. **Which One Changed?** — identify a changed symbol.
15. **Panic** — do nothing through an alarming fake countdown.
16. **Wait for Now** — reaction timing without anticipation.
17. **Odd One** — pattern recognition under time pressure.
18. **Unlock It** — drag a key into its lock.
19. **Smallest to Biggest** — tap targets in size order.
20. **Thread the Needle** — stop a moving line inside a narrow gap.

## Local development

No dependencies or compilation are required. ES modules must be served over HTTP:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/`. Source files can be edited directly; refresh to see changes.

## Architecture

- `index.html` contains the semantic shell for intro, HUD, playfield, and game-over views.
- `styles/main.css` supplies the responsive neon visual system, safe-area spacing, interaction feedback, and reduced-motion overrides.
- `js/main.js` wires UI input, persistent preferences, and the game manager.
- `js/game.js` owns the state machine, weighted-ready non-repeating selection, scoring, transitions, keyboard input, and visibility pause/resume.
- `js/challenges/base.js` provides the shared lifecycle and tracks timers, listeners, and animation frames for deterministic cleanup.
- `js/challenges/index.js` exports all challenge factories from one auditable registry.
- `js/audio.js`, `js/effects.js`, and `js/storage.js` isolate generated audio, feedback, and failure-tolerant local persistence.

Each challenge factory exposes metadata (`id`, instruction, hint, weight) and produces a lifecycle object with `start`, `finish`, and `cleanup`. The manager injects the arena, difficulty, audio system, and success/failure callbacks. Cleanup cancels all registered timeouts, intervals, event listeners, and animation frames before the next state.

Local storage records best score, games played, total survived, longest streak, mute preference, and a per-challenge best streak. Storage errors are intentionally non-fatal. Audio is created only after the first player gesture. Leaving the tab cleans up the current challenge and starts a fresh challenge at the same score on return.

## GitHub Pages deployment

All URLs are relative and the project is plain static content, so repository subpaths work without configuration files or a build action.

1. Push the repository to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the publishing branch and the **`/ (root)`** directory, then save.
5. Open `https://USERNAME.github.io/REPOSITORY/` after GitHub reports deployment complete.

## Browser support

Designed for current iPhone Safari, Android Chrome, and desktop Chrome, Firefox, and Safari. Pointer Events, ES modules, CSS custom properties, and Web Audio are required. Vibration is optional and silently skipped on unsupported devices. The game has reduced-motion styling and safe-area-aware spacing.

## Known limitations

- Browser vibration support is inconsistent, especially on iOS.
- Mobile browsers may suspend audio after a long background period; the next gesture resumes it.
- Keyboard play is provided where a challenge maps sensibly to a primary action; spatial drag challenges are best with a pointer.
- Statistics stay on the current browser/device and may disappear when site data is cleared.

## License

Released under the [MIT License](./LICENSE).
