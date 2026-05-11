export type PlatformId =
  | "linux-amd64"
  | "linux-arm64"
  | "macos-amd64"
  | "macos-arm64"
  | "windows-amd64"

export type Platform = {
  id: PlatformId
  label: string
  asset: string
  binaryInZip: string
  isWindows: boolean
  isUnix: boolean
  hint: string
}

export const PLATFORMS: Platform[] = [
  {
    id: "linux-amd64",
    label: "Linux x86_64 (VPS / typical server)",
    asset: "ssh-cv-linux-amd64",
    binaryInZip: "ssh-cv",
    isWindows: false,
    isUnix: true,
    hint: "Default. Pick this if you're deploying to a VPS.",
  },
  {
    id: "linux-arm64",
    label: "Linux ARM64",
    asset: "ssh-cv-linux-arm64",
    binaryInZip: "ssh-cv",
    isWindows: false,
    isUnix: true,
    hint: "ARM-based servers (Hetzner CAX, Oracle Ampere, Raspberry Pi, ...).",
  },
  {
    id: "macos-arm64",
    label: "macOS (Apple Silicon)",
    asset: "ssh-cv-macos-arm64",
    binaryInZip: "ssh-cv",
    isWindows: false,
    isUnix: true,
    hint: "M1/M2/M3/M4 Macs — local testing only.",
  },
  {
    id: "macos-amd64",
    label: "macOS (Intel)",
    asset: "ssh-cv-macos-amd64",
    binaryInZip: "ssh-cv",
    isWindows: false,
    isUnix: true,
    hint: "Pre-Apple-Silicon Macs — local testing only.",
  },
  {
    id: "windows-amd64",
    label: "Windows x86_64",
    asset: "ssh-cv-windows-amd64.exe",
    binaryInZip: "ssh-cv.exe",
    isWindows: true,
    isUnix: false,
    hint: "Local testing only — run from a terminal that supports ANSI (Windows Terminal, PowerShell 7).",
  },
]

export function getPlatform(id: PlatformId): Platform {
  const p = PLATFORMS.find((p) => p.id === id)
  if (!p) throw new Error(`Unknown platform: ${id}`)
  return p
}

export const DEFAULT_PLATFORM: PlatformId = "linux-amd64"
