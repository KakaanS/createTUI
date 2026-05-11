import { PLATFORMS, type PlatformId } from "../platforms"

type Props = {
  value: PlatformId
  onChange: (id: PlatformId) => void
}

export function PlatformPicker({ value, onChange }: Props) {
  const current = PLATFORMS.find((p) => p.id === value) ?? PLATFORMS[0]
  return (
    <section className="panel">
      <h2 className="section-title">Target platform</h2>
      <p className="text-xs text-muted mb-3">
        Pick where you'll run <code>ssh-cv</code>. Keep <strong>Linux x86_64</strong> for a VPS
        deployment; pick your own OS to test locally without installing Go.
      </p>
      <div className="field">
        <select
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value as PlatformId)}
        >
          {PLATFORMS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted mt-2">{current.hint}</p>
      </div>
    </section>
  )
}
