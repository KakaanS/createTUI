import { Controller, useFormContext, type FieldPath } from "react-hook-form"
import type { CV } from "../schema"

type Parsed = { start: string; end: string; ongoing: boolean }

function parsePeriod(value: string): Parsed {
  const v = (value ?? "").trim()
  if (!v) return { start: "", end: "", ongoing: false }

  const ongoingMatch = v.match(/^(.*?)\s+[-–]\s+(ongoing|present)$/i)
  if (ongoingMatch) return { start: ongoingMatch[1].trim(), end: "", ongoing: true }

  const rangeMatch = v.match(/^(.*?)\s+[-–]\s+(.*)$/)
  if (rangeMatch) {
    return { start: rangeMatch[1].trim(), end: rangeMatch[2].trim(), ongoing: false }
  }

  return { start: v, end: "", ongoing: false }
}

function serializePeriod({ start, end, ongoing }: Parsed): string {
  if (!start) return ""
  if (ongoing) return `${start} - ongoing`
  if (end) return `${start} - ${end}`
  return start
}

type Props = {
  name: FieldPath<CV>
}

export function PeriodField({ name }: Props) {
  const { control } = useFormContext<CV>()
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const parsed = parsePeriod((field.value as string) ?? "")
        function update(patch: Partial<Parsed>) {
          const next: Parsed = { ...parsed, ...patch }
          if (next.ongoing) next.end = ""
          field.onChange(serializePeriod(next))
        }
        return (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{4}-\d{2}"
              placeholder="2025-06"
              className="input py-1 w-28"
              value={parsed.start}
              onChange={(e) => update({ start: e.target.value })}
              aria-label="Start month (YYYY-MM)"
            />
            <span className="text-muted text-xs">–</span>
            {parsed.ongoing ? (
              <span className="text-xs text-muted italic px-2">ongoing</span>
            ) : (
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{4}-\d{2}"
                placeholder="2025-06"
                className="input py-1 w-28"
                value={parsed.end}
                onChange={(e) => update({ end: e.target.value })}
                aria-label="End month (YYYY-MM)"
              />
            )}
            <label className="inline-flex items-center gap-1 text-xs text-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={parsed.ongoing}
                onChange={(e) => update({ ongoing: e.target.checked })}
              />
              Ongoing
            </label>
          </div>
        )
      }}
    />
  )
}
