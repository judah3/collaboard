type PlaceholderAppPageProps = {
  title: string;
  description: string;
};

const PlaceholderAppPage = ({ title, description }: PlaceholderAppPageProps) => (
  <section className="bg-slate-50 p-3 sm:p-4 lg:p-6">
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-base font-semibold text-slate-900">{title}</h1>
      <p className="pt-2 text-sm text-slate-600">{description}</p>
    </div>
  </section>
);

export const DashboardPage = () => (
  <PlaceholderAppPage
    title="Dashboard"
    description="Dashboard widgets and summaries will be added in a follow-up delivery."
  />
);

export const WorkspacePage = () => (
  <PlaceholderAppPage
    title="Workspace"
    description="Workspace overview and controls are placeholders for the next phase."
  />
);

export const MyTasksPage = () => (
  <PlaceholderAppPage
    title="My Tasks"
    description="Personal task aggregation and filtering are placeholders for the next phase."
  />
);

export const TeamsPage = () => (
  <PlaceholderAppPage
    title="Teams"
    description="Team directory and membership management are placeholders for the next phase."
  />
);