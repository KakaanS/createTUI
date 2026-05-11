# tui-cv-builder

Generate a personalised terminal CV that anyone can view over SSH.

Fill in a form, pick a target platform, click Generate, and you get a ZIP with:

- `ssh-cv` (or `ssh-cv.exe` on Windows) — a small (~3 MB) statically-linked binary, no runtime dependencies
- `cv.json` — your data, read by the binary at startup
- `README.md` — step-by-step instructions for either running it locally or wiring up `sshd_config` so that `ssh guest@your-ip` lands visitors directly in your CV

One binary serves everyone — your CV content lives entirely in `cv.json`, so iterating is just re-scp'ing a JSON file.

## Just want to try it locally?

You **don't need Go installed**, and you don't need to fight Gatekeeper or SmartScreen. In the web form, fill in your details, scroll to **Test it locally**, pick your platform, and copy the one-line shell command. Paste it into Terminal (PowerShell on Windows) and the TUI launches in seconds.

The trick: the command uses `curl` to download the binary, which — unlike a browser download — doesn't tag the file with `com.apple.quarantine` on macOS, so Gatekeeper never gets involved. Your `cv.json` is inlined into the command as base64, so the whole experience is "paste one line, see your CV." No unzip, no chmod-dance, no xattr.

If you'd rather inspect the snippet before running it, the form shows you the full command — it's just `mkdir + curl + base64 -d + ./ssh-cv`.

For VPS deployment, pick **Linux x86_64** (or ARM64) — that ZIP's bundled README walks through the `sshd` configuration.

## Layout

```
template/        Go source for the TUI (Bubble Tea). Cross-compiles to a single binary per OS/arch.
web/             React + Vite + Tailwind static site. The form → ZIP generator.
.github/         CI workflow that rebuilds all ssh-cv targets on every change to template/.
```

## Local development

### Run the TUI directly

```sh
cd template
go run .              # uses template/cv.json
```

### Run the web app

```sh
cd web
pnpm install
pnpm dev
```

For the **Generate** button to work locally, drop a built binary for *each platform you want to offer* into `web/public/`. The web app fetches them by name:

| Target | Build command | Output path |
|---|---|---|
| Linux x86_64 | `GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -trimpath -o ../web/public/ssh-cv-linux-amd64 .` | `web/public/ssh-cv-linux-amd64` |
| Linux ARM64 | `GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -ldflags="-s -w" -trimpath -o ../web/public/ssh-cv-linux-arm64 .` | `web/public/ssh-cv-linux-arm64` |
| macOS Apple Silicon | `GOOS=darwin GOARCH=arm64 CGO_ENABLED=0 go build -ldflags="-s -w" -trimpath -o ../web/public/ssh-cv-macos-arm64 .` | `web/public/ssh-cv-macos-arm64` |
| macOS Intel | `GOOS=darwin GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -trimpath -o ../web/public/ssh-cv-macos-amd64 .` | `web/public/ssh-cv-macos-amd64` |
| Windows x86_64 | `GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -trimpath -o ../web/public/ssh-cv-windows-amd64.exe .` | `web/public/ssh-cv-windows-amd64.exe` |

Run all five from `template/`:

```sh
cd template
for target in linux/amd64 linux/arm64 darwin/amd64 darwin/arm64 windows/amd64; do
  GOOS="${target%/*}" GOARCH="${target#*/}" CGO_ENABLED=0 \
    go build -ldflags="-s -w" -trimpath \
    -o "../web/public/ssh-cv-${target%/*}-${target#*/}$([ "${target%/*}" = windows ] && echo .exe)" .
done
# macOS targets use "macos" rather than "darwin" in the filename; rename them after the loop:
mv ../web/public/ssh-cv-darwin-amd64 ../web/public/ssh-cv-macos-amd64
mv ../web/public/ssh-cv-darwin-arm64 ../web/public/ssh-cv-macos-arm64
```

(Production deploys fetch each binary from the GitHub Releases tag `latest` — see the workflow.)

## Inspiration

Spun out of [oscarwendt's personal CV TUI](https://github.com/oscarwendt) — the original repo stays as a reference deployment.
