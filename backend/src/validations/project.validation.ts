import { z } from 'zod';

const projectShape = z.object({
  title: z.string().min(5).max(255),
  description: z.string().min(20),
  category: z.string().min(1).max(100),
  budgetMin: z.number().positive(),
  budgetMax: z.number().positive(),
  deadline: z.string().datetime().or(z.string().refine((v) => !isNaN(Date.parse(v)))),
  skillIds: z.array(z.string().uuid()).optional(),
});

export const createProjectSchema = projectShape.refine(
  (d) => d.budgetMax >= d.budgetMin,
  { message: 'budgetMax must be >= budgetMin' }
);

export const updateProjectSchema = projectShape.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
