import { useFormContext } from "react-hook-form"
import type { CV } from "../schema"

export function ContactForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CV>()
  return (
    <section className="panel">
      <h2 className="section-title">Contact</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="field">
          <label className="label">Name</label>
          <input className="input" {...register("contact.name")} />
          {errors.contact?.name && <span className="err">{errors.contact.name.message}</span>}
        </div>
        <div className="field">
          <label className="label">Role / title</label>
          <input className="input" {...register("contact.role")} placeholder="Frontend Developer" />
        </div>
        <div className="field">
          <label className="label">Phone</label>
          <input className="input" {...register("contact.phone")} placeholder="+46 70 ..." />
        </div>
        <div className="field">
          <label className="label">Email</label>
          <input className="input" {...register("contact.email")} />
          {errors.contact?.email && <span className="err">{errors.contact.email.message}</span>}
        </div>
      </div>
    </section>
  )
}
