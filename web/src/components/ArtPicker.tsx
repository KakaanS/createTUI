import { useFormContext, useWatch } from "react-hook-form"
import type { CV } from "../schema"
import { gallery } from "../art/gallery"

export function ArtPicker() {
  const { setValue, register } = useFormContext<CV>()
  const current = useWatch<CV, "art">({ name: "art" }) ?? ""

  function pick(art: string) {
    setValue("art", art, { shouldDirty: true })
  }

  return (
    <section className="panel">
      <h2 className="section-title">ASCII art (menu screen)</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
        {gallery.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => pick(g.art)}
            className={`text-left border rounded p-2 transition ${
              current === g.art
                ? "border-accent bg-accent/10"
                : "border-zinc-800 bg-ink/40 hover:border-zinc-700"
            }`}
          >
            <div className="text-xs text-muted mb-1">{g.name}</div>
            <pre className="text-[10px] leading-tight whitespace-pre overflow-hidden max-h-32">
              {g.art}
            </pre>
          </button>
        ))}
      </div>
      <div className="field">
        <label className="label">Or paste your own</label>
        <textarea
          className="input font-mono text-xs min-h-[140px]"
          placeholder="Paste any ASCII / Unicode art here..."
          {...register("art")}
        />
      </div>
    </section>
  )
}
