import { useFormContext, useWatch } from "react-hook-form"
import type { CV } from "../schema"

export function AboutForm() {
  const { register } = useFormContext<CV>()
  const value = useWatch<CV, "about">({ name: "about" }) ?? ""

  return (
    <section className="panel">
      <h2 className="section-title">About</h2>
      <div className="field">
        <label className="label">Bio (renders in the TUI About tab)</label>
        <textarea
          className="input min-h-[140px]"
          placeholder="A paragraph or two about who you are..."
          {...register("about")}
        />
        <span className="text-xs text-muted self-end">{value.length} chars</span>
      </div>
    </section>
  )
}
