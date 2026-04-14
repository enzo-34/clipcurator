# ClipCurator

A lightweight desktop app for quickly reviewing, trimming, and organising game clips.  
Built with Tauri (Rust + HTML/JS). No re-encoding — cuts are lossless via ffmpeg stream copy.

---

## How it works

1. **Review** — open your clips folder, scrub through each clip, set In/Out points.
2. **Queue** — assign a game folder and label (e.g. *Valorant / Funny*), add to queue. Nothing is touched on disk yet.
3. **Process** — when you're ready, hit *Process Queue*. ffmpeg cuts each clip and drops it into `<clips folder>/ClipCurator Output/<Game>/<Label>/`. Progress is saved after every clip so you can cancel and resume later.

---

## Prerequisites

| Tool | Install |
|------|---------|
| **Rust** | https://rustup.rs |
| **Node.js** (for Tauri CLI) | https://nodejs.org |
| **ffmpeg** | https://ffmpeg.org/download.html — must be on your `PATH` |

### Quick ffmpeg check
```bash
ffmpeg -version
```
If that errors, add ffmpeg to your PATH or drop `ffmpeg.exe` next to the app.

---

## Running in development

```bash
# 1. Install the Tauri CLI
npm install

# 2. Start the app (compiles Rust, opens a window)
npm run tauri dev
```

First compile takes a few minutes while Cargo downloads dependencies. Subsequent runs are fast.

---

## Building a release binary

```bash
npm run tauri build
```

Output is in `src-tauri/target/release/` (and a portable installer in `src-tauri/target/release/bundle/`).

---

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `I` | Set In point |
| `O` | Set Out point |
| `← →` | Seek ±5 seconds |
| `A` / `D` | Seek ±1 second |
| `Enter` | Add current clip to queue |
| `N` | Next clip |
| `P` | Previous clip |
| `?` | Toggle shortcuts panel |

---

## Queue file

The queue is stored as `clipcurator_queue.json` inside your clips folder. It's plain JSON — you can inspect or edit it manually. Each job looks like:

```json
{
  "id": "abc123",
  "source": "/path/to/clip.mp4",
  "start": 12.4,
  "end": 23.1,
  "destFolder": "Valorant",
  "label": "Funny",
  "done": false
}
```

Jobs with `"done": true` are skipped on the next processing run.

---

## Notes

- **Lossless cutting**: ffmpeg uses `-c copy` (stream copy) — no re-encode, so processing is near-instant and quality is untouched. Start accuracy depends on keyframe placement; typically within ~1 second.
- **Codec support**: video playback uses the OS webview (Edge WebView2 on Windows). Most H.264/H.265 MP4 files play fine. MKV/VP9 may not — this is a playback-only limitation; ffmpeg will still process them correctly.
- **Resume after cancel**: closing mid-process or hitting Cancel is safe. Completed jobs are marked `done` on disk immediately after each clip finishes.

---

## Roadmap ideas

- [ ] Batch-apply a folder/label to multiple clips
- [ ] Preview the trimmed range before queuing (loop In→Out)
- [ ] Custom output folder picker
- [ ] Bundled ffmpeg sidecar (so users don't need to install it)
- [ ] OBS replay-buffer integration (Project 1)
