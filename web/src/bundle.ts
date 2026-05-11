import JSZip from "jszip"
import type { CV } from "./schema"
import { getPlatform, type PlatformId } from "./platforms"

const README_URL = "/README.template.md"

function fileSafe(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "cv"
}

// Vite's dev server falls back to index.html for unknown paths, so a missing
// binary can silently return HTML. Verify the bytes look like an executable.
function assertBinary(buf: ArrayBuffer, assetName: string): void {
  if (buf.byteLength < 4) {
    throw new Error(`Fetched ${assetName} is too small (${buf.byteLength} bytes) — likely missing.`)
  }
  const head = new Uint8Array(buf, 0, 4)
  const isELF = head[0] === 0x7f && head[1] === 0x45 && head[2] === 0x4c && head[3] === 0x46
  const isMachO64 =
    (head[0] === 0xcf && head[1] === 0xfa && head[2] === 0xed && head[3] === 0xfe) ||
    (head[0] === 0xfe && head[1] === 0xed && head[2] === 0xfa && head[3] === 0xcf)
  const isMachOFat = head[0] === 0xca && head[1] === 0xfe && head[2] === 0xba && head[3] === 0xbe
  const isPE = head[0] === 0x4d && head[1] === 0x5a // "MZ"
  if (!isELF && !isMachO64 && !isMachOFat && !isPE) {
    const preview = new TextDecoder("utf-8", { fatal: false }).decode(head).replace(/\s+/g, " ")
    throw new Error(
      `Fetched /${assetName} but it isn't a binary (first bytes: "${preview}"). ` +
        `If you're running the dev server, build the binary into web/public/${assetName} first.`,
    )
  }
}

function renderLocalRunBlock(platformId: PlatformId): string {
  const p = getPlatform(platformId)
  if (p.isWindows) {
    return [
      "Open a terminal in this folder (Windows Terminal or PowerShell 7 recommended for full Unicode) and run:",
      "",
      "```powershell",
      ".\\ssh-cv.exe",
      "```",
      "",
      "First-launch SmartScreen prompt: click *More info → Run anyway*. The binary is unsigned because it's built fresh by CI on every change.",
    ].join("\n")
  }
  if (p.id.startsWith("macos")) {
    return [
      "Open a terminal in this folder and run:",
      "",
      "```sh",
      "xattr -d com.apple.quarantine ssh-cv   # strip the macOS quarantine flag",
      "chmod +x ssh-cv",
      "./ssh-cv",
      "```",
      "",
      "**Why the xattr step?** The binary is unsigned (rebuilt by CI on every change), so macOS Gatekeeper would otherwise refuse to launch it with *“Apple could not verify that ssh-cv is free of malware...”* The `xattr` line strips the download-quarantine attribute so the kernel will execute it. It's safe — same binary, just without the quarantine tag.",
    ].join("\n")
  }
  return [
    "Open a terminal in this folder and run:",
    "",
    "```sh",
    "chmod +x ssh-cv",
    "./ssh-cv",
    "```",
  ].join("\n")
}

export async function buildBundle(
  cv: CV,
  platformId: PlatformId,
): Promise<{ blob: Blob; filename: string }> {
  const platform = getPlatform(platformId)
  const zip = new JSZip()

  zip.file("cv.json", JSON.stringify(cv, null, 2))

  const [binResp, readmeResp] = await Promise.all([
    fetch(`/${platform.asset}`),
    fetch(README_URL),
  ])
  if (!binResp.ok) {
    throw new Error(
      `Could not fetch ${platform.asset} (${binResp.status}). Make sure web/public/${platform.asset} is in place.`,
    )
  }
  if (!readmeResp.ok) {
    throw new Error(`Could not fetch README template (${readmeResp.status}).`)
  }

  const bin = await binResp.arrayBuffer()
  assertBinary(bin, platform.asset)
  zip.file(platform.binaryInZip, bin, {
    unixPermissions: platform.isUnix ? parseInt("755", 8) : undefined,
    binary: true,
  })

  const readmeTmpl = await readmeResp.text()
  const readme = readmeTmpl
    .replaceAll("{{NAME}}", cv.contact.name)
    .replaceAll("{{EMAIL}}", cv.contact.email)
    .replaceAll("{{PLATFORM_LABEL}}", platform.label)
    .replaceAll("{{BINARY_NAME}}", platform.binaryInZip)
    .replaceAll("{{LOCAL_RUN_BLOCK}}", renderLocalRunBlock(platformId))
  zip.file("README.md", readme)

  const blob = await zip.generateAsync({
    type: "blob",
    platform: platform.isWindows ? "DOS" : "UNIX",
    compression: "DEFLATE",
  })

  return { blob, filename: `tui-cv-${fileSafe(cv.contact.name)}-${platform.id}.zip` }
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
