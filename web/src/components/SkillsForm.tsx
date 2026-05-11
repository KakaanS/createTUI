import { useState, type KeyboardEvent } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import type { CV } from "../schema"

export function SkillsForm() {
  const { setValue } = useFormContext<CV>()
  const skills = useWatch<CV, "skills">({ name: "skills" }) ?? []
  const [draft, setDraft] = useState("")

  function setSkills(next: string[]) {
    setValue("skills", next, { shouldDirty: true, shouldValidate: true })
  }

  function add() {
    const v = draft.trim()
    if (!v) return
    if (skills.includes(v)) {
      setDraft("")
      return
    }
    setSkills([...skills, v])
    setDraft("")
  }

  function remove(i: number) {
    setSkills(skills.filter((_, idx) => idx !== i))
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      add()
    } else if (e.key === "Backspace" && draft === "" && skills.length > 0) {
      remove(skills.length - 1)
    }
  }

  return (
    <section className="panel">
      <h2 className="section-title">Skills</h2>
      <div className="flex flex-wrap gap-2 mb-3 min-h-[2rem]">
        {skills.length === 0 && (
          <span className="text-xs text-muted italic">No skills yet — add some below.</span>
        )}
        {skills.map((s, i) => (
          <span
            key={`${s}-${i}`}
            className="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs"
          >
            {s}
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-muted hover:text-red-400"
              aria-label={`Remove ${s}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Add a skill, press Enter or comma"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button type="button" className="btn" onClick={add}>
          Add
        </button>
      </div>
    </section>
  )
}
