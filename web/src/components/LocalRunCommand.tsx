import { useMemo, useState } from "react"
import { useWatch } from "react-hook-form"
import type { CV } from "../schema"
import { getPlatform, type PlatformId } from "../platforms"

function utf8ToBase64(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function buildUnixCommand(originUrl: string, asset: string, b64Json: string): string {
  // One self-contained shell command. Curl-downloaded binaries don't get the
  // macOS quarantine flag, so Gatekeeper stays out of the way.
  return [
    `mkdir -p ~/tui-cv-test && cd ~/tui-cv-test \\`,
    `  && curl -fsSL "${originUrl}/${asset}" -o ssh-cv \\`,
    `  && chmod +x ssh-cv \\`,
    `  && echo '${b64Json}' | base64 -d > cv.json \\`,
    `  && ./ssh-cv`,
  ].join("\n")
}

function buildWindowsCommand(originUrl: string, asset: string, b64Json: string): string {
  // PowerShell. Invoke-WebRequest-downloaded files can still trigger
  // SmartScreen on some Windows builds; the user may need to right-click →
  // Properties → Unblock once.
  return [
    `$d = "$env:USERPROFILE\\tui-cv-test"`,
    `New-Item -ItemType Directory -Force -Path $d | Out-Null`,
    `Set-Location $d`,
    `Invoke-WebRequest -UseBasicParsing -Uri "${originUrl}/${asset}" -OutFile ssh-cv.exe`,
    `[IO.File]::WriteAllBytes("cv.json", [Convert]::FromBase64String("${b64Json}"))`,
    `.\\ssh-cv.exe`,
  ].join("\n")
}

type Props = {
  platformId: PlatformId
}

export function LocalRunCommand({ platformId }: Props) {
  const cv = useWatch<CV>() as CV
  const [copied, setCopied] = useState(false)

  const platform = getPlatform(platformId)
  const origin = typeof window !== "undefined" ? window.location.origin : ""

  const command = useMemo(() => {
    const json = JSON.stringify(cv ?? {}, null, 2)
    const b64 = utf8ToBase64(json)
    return platform.isWindows
      ? buildWindowsCommand(origin, platform.asset, b64)
      : buildUnixCommand(origin, platform.asset, b64)
  }, [cv, platform, origin])

  async function copy() {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API can fail on insecure origins; fall back to noop. User can
      // still triple-click + Cmd+C to select the visible code block.
    }
  }

  return (
    <section className="panel">
      <h2 className="section-title">Test it locally — no install, no Gatekeeper</h2>
      <p className="text-xs text-muted mb-3">
        Open <strong>{platform.isWindows ? "PowerShell" : "Terminal"}</strong> and paste the
        command below. It curl-downloads the <code>{platform.label}</code> binary into{" "}
        <code>~/tui-cv-test</code>, writes your <code>cv.json</code> inline, and runs the TUI.
        Because the binary comes via <code>curl</code> instead of a browser download,{" "}
        {platform.isWindows ? "Windows SmartScreen" : "macOS Gatekeeper"} doesn't tag it as
        quarantined and it launches without prompts.
      </p>
      <div className="relative">
        <pre className="bg-ink/60 border border-zinc-800 rounded p-3 text-xs overflow-x-auto whitespace-pre">
          {command}
        </pre>
        <button
          type="button"
          onClick={copy}
          className="btn absolute top-2 right-2 text-xs"
          aria-label="Copy command"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="text-xs text-muted mt-3">
        Quit with <code>q</code>. Re-run the command any time to pick up changes — every
        keystroke in this form regenerates the snippet, so the embedded <code>cv.json</code> is
        always current.
      </p>
    </section>
  )
}
