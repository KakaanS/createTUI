import { z } from "zod"

export const projectSchema = z.object({
  slug: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
  period: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  technologies: z.array(z.string().min(1)).default([]),
})

const baseEmployer = z.object({
  name: z.string().min(1, "Required"),
  location: z.string().default(""),
  period: z.string().min(1, "Required"),
})

export const techEmployerSchema = baseEmployer.extend({
  type: z.literal("tech"),
  projects: z.array(projectSchema).min(1, "Add at least one project"),
})

export const nonTechEmployerSchema = baseEmployer.extend({
  type: z.literal("non-tech"),
  role: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
})

export const employerSchema = z.discriminatedUnion("type", [
  techEmployerSchema,
  nonTechEmployerSchema,
])

export const contactSchema = z.object({
  name: z.string().min(1, "Required"),
  role: z.string().default(""),
  phone: z.string().default(""),
  email: z.string().email("Invalid email"),
})

export const cvSchema = z.object({
  contact: contactSchema,
  about: z.string().default(""),
  art: z.string().default(""),
  skills: z.array(z.string().min(1)).default([]),
  employers: z.array(employerSchema).default([]),
})

export type Project = z.infer<typeof projectSchema>
export type TechEmployer = z.infer<typeof techEmployerSchema>
export type NonTechEmployer = z.infer<typeof nonTechEmployerSchema>
export type Employer = z.infer<typeof employerSchema>
export type Contact = z.infer<typeof contactSchema>
export type CV = z.infer<typeof cvSchema>

export const emptyCV: CV = {
  contact: { name: "", role: "", phone: "", email: "" },
  about: "",
  art: "",
  skills: [],
  employers: [],
}
