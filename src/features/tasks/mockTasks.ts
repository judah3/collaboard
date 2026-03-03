import type { Task, User } from "@/features/tasks/types";

export const mockUsers: User[] = [
  { id: "u1", name: "Jude A." },
  { id: "u2", name: "Anna F." },
  { id: "u3", name: "Marco T." },
  { id: "u4", name: "Lina P." },
  { id: "u5", name: "Ravi K." }
];

export const mockTasks: Task[] = [
  {
    id: "t1",
    title: "Design new dashboard UI",
    description: "Create polished board and analytics layouts aligned with the MVP style system.",
    priority: "High",
    status: "Backlog",
    assigneeId: "u2",
    dueDate: "2026-03-12",
    tags: ["Design", "Frontend"],
    commentsCount: 4,
    attachmentsCount: 1,
    comments: [
      { id: "c1", authorId: "u1", message: "Keep cards concise and scan-friendly.", createdAt: "2026-03-01" }
    ]
  },
  {
    id: "t2",
    title: "Write onboarding scripts",
    description: "Draft support scripts for new workspace members and project owners.",
    priority: "High",
    status: "Backlog",
    assigneeId: "u1",
    dueDate: "2026-03-12",
    tags: ["Documentation"],
    commentsCount: 2,
    attachmentsCount: 0,
    comments: [
      { id: "c2", authorId: "u3", message: "Add quick-start examples.", createdAt: "2026-03-02" }
    ]
  },
  {
    id: "t3",
    title: "Research chatbot platforms",
    description: "Evaluate providers and summarize integration tradeoffs for support automation.",
    priority: "Medium",
    status: "Backlog",
    assigneeId: "u4",
    dueDate: "2026-03-13",
    tags: ["Research"],
    commentsCount: 3,
    attachmentsCount: 2,
    comments: [
      { id: "c3", authorId: "u4", message: "Shortlist to two vendors by Friday.", createdAt: "2026-03-03" }
    ]
  },
  {
    id: "t4",
    title: "Create FAQ section",
    description: "Compile top customer questions into concise support answers.",
    priority: "Low",
    status: "Backlog",
    assigneeId: "u5",
    dueDate: "2026-03-14",
    tags: ["Documentation"],
    commentsCount: 1,
    attachmentsCount: 0,
    comments: [
      { id: "c4", authorId: "u5", message: "Need input from support leads.", createdAt: "2026-03-02" }
    ]
  },
  {
    id: "t5",
    title: "Scope error state patterns",
    description: "Define empty, loading, and error states for list and drawer surfaces.",
    priority: "Medium",
    status: "Backlog",
    assigneeId: "u2",
    dueDate: "2026-03-15",
    tags: ["Design", "UX"],
    commentsCount: 2,
    attachmentsCount: 1,
    comments: [
      { id: "c5", authorId: "u2", message: "Will share component specs today.", createdAt: "2026-03-03" }
    ]
  },
  {
    id: "t6",
    title: "Revamp login page",
    description: "Improve validation, accessibility labels, and visual hierarchy on login.",
    priority: "High",
    status: "In Progress",
    assigneeId: "u3",
    dueDate: "2026-03-12",
    tags: ["Frontend", "Auth"],
    commentsCount: 6,
    attachmentsCount: 1,
    comments: [
      { id: "c6", authorId: "u3", message: "Validation flows are now in QA.", createdAt: "2026-03-03" }
    ]
  },
  {
    id: "t7",
    title: "Update README and docs",
    description: "Refresh local setup and architecture notes for the board MVP.",
    priority: "Medium",
    status: "In Progress",
    assigneeId: "u1",
    dueDate: "2026-03-16",
    tags: ["Documentation", "Backend"],
    commentsCount: 2,
    attachmentsCount: 0,
    comments: [
      { id: "c7", authorId: "u1", message: "Added state management notes.", createdAt: "2026-03-03" }
    ]
  },
  {
    id: "t8",
    title: "Implement board filters",
    description: "Connect assignee and tag filtering with performant client-side selectors.",
    priority: "High",
    status: "In Progress",
    assigneeId: "u3",
    dueDate: "2026-03-11",
    tags: ["Frontend", "State"],
    commentsCount: 5,
    attachmentsCount: 0,
    comments: [
      { id: "c8", authorId: "u3", message: "Filtering now supports combined criteria.", createdAt: "2026-03-04" }
    ]
  },
  {
    id: "t9",
    title: "Set up QA checklist",
    description: "Write board regression checklist for task card and drawer interactions.",
    priority: "Low",
    status: "In Progress",
    assigneeId: "u5",
    dueDate: "2026-03-17",
    tags: ["QA"],
    commentsCount: 1,
    attachmentsCount: 1,
    comments: [
      { id: "c9", authorId: "u5", message: "Need final acceptance criteria.", createdAt: "2026-03-03" }
    ]
  },
  {
    id: "t10",
    title: "Fix payment processing bug",
    description: "Resolve stale token retries causing occasional checkout failures.",
    priority: "High",
    status: "Completed",
    assigneeId: "u4",
    dueDate: "2026-03-10",
    tags: ["Bug"],
    commentsCount: 19,
    attachmentsCount: 1,
    comments: [
      { id: "c10", authorId: "u4", message: "Patched and verified in staging.", createdAt: "2026-03-02" }
    ]
  },
  {
    id: "t11",
    title: "User feedback analysis",
    description: "Summarize top recurring product pain points from support tickets.",
    priority: "Medium",
    status: "Completed",
    assigneeId: "u1",
    dueDate: "2026-03-11",
    tags: ["Research"],
    commentsCount: 16,
    attachmentsCount: 0,
    comments: [
      { id: "c11", authorId: "u1", message: "Shared insights with roadmap owners.", createdAt: "2026-03-03" }
    ]
  },
  {
    id: "t12",
    title: "Set up Kubernetes cluster",
    description: "Provision base cluster resources and deploy internal service manifests.",
    priority: "Low",
    status: "Completed",
    assigneeId: "u4",
    dueDate: "2026-03-09",
    tags: ["Backend", "Infra"],
    commentsCount: 12,
    attachmentsCount: 0,
    comments: [
      { id: "c12", authorId: "u4", message: "Cluster health checks are passing.", createdAt: "2026-03-01" }
    ]
  },
  {
    id: "t13",
    title: "Close sprint retrospective",
    description: "Finalize actions and owners from the previous sprint retrospective.",
    priority: "Medium",
    status: "Completed",
    assigneeId: "u2",
    dueDate: "2026-03-08",
    tags: ["Process"],
    commentsCount: 3,
    attachmentsCount: 0,
    comments: [
      { id: "c13", authorId: "u2", message: "All follow-up tasks assigned.", createdAt: "2026-03-01" }
    ]
  },
  {
    id: "t14",
    title: "Improve card keyboard navigation",
    description: "Refine tab order and focus rings across board interactions.",
    priority: "High",
    status: "In Progress",
    assigneeId: "u5",
    dueDate: "2026-03-18",
    tags: ["Accessibility", "Frontend"],
    commentsCount: 2,
    attachmentsCount: 0,
    comments: [
      { id: "c14", authorId: "u5", message: "ESC and tab sequence tested.", createdAt: "2026-03-04" }
    ]
  }
];