export const formatDueDate = (isoDate: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(isoDate));