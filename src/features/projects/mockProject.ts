import type { Project } from "@/features/projects/types";

export const mockProject: Project = {
  id: "mad-dogs-portal",
  name: "Project Sample",
  description: "Internal CRM and AI call platform",
  dueDate: "2026-04-10",
  progress: 64,
  members: [
    { id: "u1", name: "Jude A.", role: "Product" },
    { id: "u2", name: "Anna F.", role: "Design" },
    { id: "u3", name: "Marco T.", role: "Frontend" },
    { id: "u4", name: "Lina P.", role: "Backend" },
    { id: "u5", name: "Ravi K.", role: "QA" }
  ]
};
