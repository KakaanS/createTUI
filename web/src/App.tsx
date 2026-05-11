import { useState } from "react"
import { FormProvider, useForm, type FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cvSchema, emptyCV, type CV } from "./schema"
import { ContactForm } from "./components/ContactForm"
import { AboutForm } from "./components/AboutForm"
import { SkillsForm } from "./components/SkillsForm"
import { EmployersForm } from "./components/EmployersForm"
import { ArtPicker } from "./components/ArtPicker"
import { PlatformPicker } from "./components/PlatformPicker"
import { LocalRunCommand } from "./components/LocalRunCommand"
import { buildBundle, triggerDownload } from "./bundle"
import { DEFAULT_PLATFORM, getPlatform, type PlatformId } from "./platforms"

type FlatError = { path: string; message: string }

function flattenErrors(errors: FieldErrors, prefix = ""): FlatError[] {
  const out: FlatError[] = []
  for (const key in errors) {
    const node = (errors as Record<string, unknown>)[key]
    if (!node || typeof node !== "object") continue
    const path = prefix ? `${prefix}.${key}` : key
    const maybeMessage = (node as { message?: unknown }).message
    if (typeof maybeMessage === "string" && maybeMessage.length > 0) {
      out.push({ path, message: maybeMessage })
    }
    // Recurse into nested objects/arrays. Skip the `ref`/`type` keys RHF adds at the leaf.
    if (key === "ref" || key === "type" || key === "message") continue
    out.push(...flattenErrors(node as FieldErrors, path))
  }
  return out
}

export default function App() {
  const methods = useForm<CV>({
    defaultValues: emptyCV,
    resolver: zodResolver(cvSchema),
    mode: "onSubmit",
  })

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<FlatError[]>([])
  const [platform, setPlatform] = useState<PlatformId>(DEFAULT_PLATFORM)

  async function onSubmit(data: CV) {
    setBusy(true)
    setError(null)
    setValidationErrors([])
    try {
      const { blob, filename } = await buildBundle(data, platform)
      triggerDownload(blob, filename)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  function onInvalid(errors: FieldErrors<CV>) {
    const flat = flattenErrors(errors)
    setValidationErrors(flat)
    setError(null)
    console.warn("Form invalid:", errors, "→ flattened:", flat)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const selected = getPlatform(platform)

  return (
    <FormProvider {...methods}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-hot">tui-cv-builder</h1>
          <p className="text-sm text-muted mt-1">
            Fill in the form. Then either{" "}
            <strong>copy the one-line install command</strong> at the bottom to try the TUI on
            your own machine in a few seconds (no Gatekeeper / SmartScreen prompts), or{" "}
            <strong>Generate the ZIP</strong> for SSH deployment to a Linux VPS.
          </p>
        </header>

        {validationErrors.length > 0 && (
          <div className="panel border-red-700 bg-red-950/40 text-red-200 text-sm mb-4">
            <div className="font-bold mb-2">
              Cannot generate yet — {validationErrors.length} field
              {validationErrors.length === 1 ? "" : "s"} need attention:
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs">
              {validationErrors.map((e) => (
                <li key={e.path}>
                  <code className="text-red-300">{e.path}</code> — {e.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={methods.handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-4">
          <ContactForm />
          <AboutForm />
          <SkillsForm />
          <EmployersForm />
          <ArtPicker />
          <PlatformPicker value={platform} onChange={setPlatform} />
          <LocalRunCommand platformId={platform} />

          {error && (
            <div className="panel border-red-900 text-red-300 text-sm">{error}</div>
          )}

          <div className="flex items-center justify-between sticky bottom-4 panel border-accent/30 bg-panel/95 backdrop-blur">
            <span className="text-xs text-muted">
              For VPS deploy — ZIP with <code>{selected.binaryInZip}</code>,{" "}
              <code>cv.json</code>, <code>README.md</code>.
            </span>
            <button
              type="submit"
              className="btn btn-primary font-bold"
              disabled={busy}
            >
              {busy ? "Building..." : "Generate ZIP"}
            </button>
          </div>
        </form>

        <footer className="mt-12 text-xs text-muted text-center">
          One static binary serves everyone — the TUI reads your data from{" "}
          <code>cv.json</code> at runtime.
        </footer>
      </div>
    </FormProvider>
  )
}
