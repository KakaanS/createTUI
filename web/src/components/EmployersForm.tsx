import { useState, type KeyboardEvent } from "react"
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
  type FieldErrors,
} from "react-hook-form"
import type { CV, Employer } from "../schema"
import { PeriodField } from "./PeriodField"

export function EmployersForm() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CV>()
  const { fields, append, remove, move } = useFieldArray<CV, "employers">({
    control,
    name: "employers",
  })

  function addTech() {
    append({
      type: "tech",
      name: "",
      location: "",
      period: "",
      projects: [],
    } as Employer)
  }
  function addNonTech() {
    append({
      type: "non-tech",
      name: "",
      location: "",
      period: "",
      role: "",
      description: "",
    } as Employer)
  }

  function setEmployerType(i: number, type: "tech" | "non-tech") {
    const current = fields[i] as unknown as Employer
    if (type === "tech") {
      setValue(`employers.${i}`, {
        type: "tech",
        name: current.name,
        location: current.location,
        period: current.period,
        projects: [],
      } as Employer)
    } else {
      setValue(`employers.${i}`, {
        type: "non-tech",
        name: current.name,
        location: current.location,
        period: current.period,
        role: "",
        description: "",
      } as Employer)
    }
  }

  return (
    <section className="panel">
      <h2 className="section-title">Employers</h2>
      {fields.length === 0 && (
        <p className="text-xs text-muted italic mb-3">No employers yet.</p>
      )}
      <div className="flex flex-col gap-3">
        {fields.map((f, i) => (
          <EmployerCard
            key={f.id}
            index={i}
            onRemove={() => remove(i)}
            onMoveUp={i > 0 ? () => move(i, i - 1) : undefined}
            onMoveDown={i < fields.length - 1 ? () => move(i, i + 1) : undefined}
            onTypeChange={(t) => setEmployerType(i, t)}
            errors={errors.employers?.[i] as FieldErrors<Employer> | undefined}
          />
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <button type="button" className="btn" onClick={addTech}>
          + Tech employer
        </button>
        <button type="button" className="btn" onClick={addNonTech}>
          + Non-tech employer
        </button>
      </div>
    </section>
  )
}

function EmployerCard({
  index,
  onRemove,
  onMoveUp,
  onMoveDown,
  onTypeChange,
  errors,
}: {
  index: number
  onRemove: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  onTypeChange: (t: "tech" | "non-tech") => void
  errors?: FieldErrors<Employer>
}) {
  const { register } = useFormContext<CV>()
  const type = useWatch<CV>({ name: `employers.${index}.type` }) as "tech" | "non-tech"

  return (
    <div className="border border-zinc-800 rounded p-3 bg-ink/40">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">#{index + 1}</span>
          <select
            className="input py-1"
            value={type}
            onChange={(e) => onTypeChange(e.target.value as "tech" | "non-tech")}
          >
            <option value="tech">Tech</option>
            <option value="non-tech">Non-tech</option>
          </select>
        </div>
        <div className="flex gap-1">
          {onMoveUp && (
            <button type="button" className="btn" onClick={onMoveUp} aria-label="Move up">
              ↑
            </button>
          )}
          {onMoveDown && (
            <button type="button" className="btn" onClick={onMoveDown} aria-label="Move down">
              ↓
            </button>
          )}
          <button type="button" className="btn btn-danger" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div className="field">
          <label className="label">Employer name</label>
          <input className="input" {...register(`employers.${index}.name`)} />
          {errors?.name && <span className="err">{errors.name.message as string}</span>}
        </div>
        <div className="field">
          <label className="label">Location</label>
          <input className="input" {...register(`employers.${index}.location`)} />
        </div>
        <div className="field">
          <label className="label">Period</label>
          <PeriodField name={`employers.${index}.period`} />
          {errors?.period && <span className="err">{errors.period.message as string}</span>}
        </div>
      </div>
      {type === "non-tech" ? (
        <NonTechFields index={index} errors={errors as FieldErrors<Employer> | undefined} />
      ) : (
        <ProjectsForm index={index} />
      )}
    </div>
  )
}

function NonTechFields({
  index,
  errors,
}: {
  index: number
  errors?: FieldErrors<Employer>
}) {
  const { register } = useFormContext<CV>()
  // type-narrow at runtime via cast (Zod handles validation)
  const e = errors as
    | { role?: { message?: string }; description?: { message?: string } }
    | undefined
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="field">
        <label className="label">Role</label>
        <input
          className="input"
          {...register(`employers.${index}.role` as `employers.${number}.role`)}
        />
        {e?.role?.message && <span className="err">{e.role.message}</span>}
      </div>
      <div className="field md:col-span-2">
        <label className="label">Description</label>
        <textarea
          className="input min-h-[80px]"
          {...register(`employers.${index}.description` as `employers.${number}.description`)}
        />
        {e?.description?.message && <span className="err">{e.description.message}</span>}
      </div>
    </div>
  )
}

function ProjectsForm({ index: empIdx }: { index: number }) {
  const { control } = useFormContext<CV>()
  const { fields, append, remove } = useFieldArray<CV>({
    control,
    name: `employers.${empIdx}.projects` as `employers.${number}.projects`,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="label">Projects</span>
        <button
          type="button"
          className="btn"
          onClick={() =>
            append({
              slug: "",
              name: "",
              period: "",
              description: "",
              technologies: [],
            } as never)
          }
        >
          + Project
        </button>
      </div>
      {fields.length === 0 && (
        <p className="text-xs text-muted italic">Add at least one project under this employer.</p>
      )}
      <div className="flex flex-col gap-2">
        {fields.map((f, i) => (
          <ProjectCard key={f.id} empIdx={empIdx} projIdx={i} onRemove={() => remove(i)} />
        ))}
      </div>
    </div>
  )
}

function ProjectCard({
  empIdx,
  projIdx,
  onRemove,
}: {
  empIdx: number
  projIdx: number
  onRemove: () => void
}) {
  const { register, control } = useFormContext<CV>()
  return (
    <div className="border border-zinc-800/70 rounded p-3 bg-panel">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted">project #{projIdx + 1}</span>
        <button type="button" className="btn btn-danger" onClick={onRemove}>
          Remove
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="field">
          <label className="label">Project name</label>
          <input
            className="input"
            {...register(`employers.${empIdx}.projects.${projIdx}.name`)}
          />
        </div>
        <div className="field">
          <label className="label">Slug</label>
          <input
            className="input"
            placeholder="kebab-case"
            {...register(`employers.${empIdx}.projects.${projIdx}.slug`)}
          />
        </div>
        <div className="field md:col-span-2">
          <label className="label">Period</label>
          <PeriodField name={`employers.${empIdx}.projects.${projIdx}.period`} />
        </div>
        <div className="field md:col-span-2">
          <label className="label">Description</label>
          <textarea
            className="input min-h-[80px]"
            {...register(`employers.${empIdx}.projects.${projIdx}.description`)}
          />
        </div>
        <div className="field md:col-span-2">
          <label className="label">Technologies</label>
          <Controller
            control={control}
            name={`employers.${empIdx}.projects.${projIdx}.technologies`}
            render={({ field }) => (
              <TechChips
                value={(field.value as string[]) ?? []}
                onChange={(next) => field.onChange(next)}
              />
            )}
          />
        </div>
      </div>
    </div>
  )
}

function TechChips({
  value,
  onChange,
}: {
  value: string[]
  onChange: (next: string[]) => void
}) {
  const [draft, setDraft] = useState("")

  function add() {
    const v = draft.trim()
    if (!v || value.includes(v)) {
      setDraft("")
      return
    }
    onChange([...value, v])
    setDraft("")
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i))
  }
  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      add()
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      remove(value.length - 1)
    }
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
        {value.map((s, i) => (
          <span
            key={`${s}-${i}`}
            className="inline-flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs"
          >
            {s}
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-muted hover:text-red-400"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        className="input w-full"
        placeholder="React, TypeScript, ... press Enter or comma"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}
