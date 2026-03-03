const PlaceholderView = ({ title }: { title: string }) => (
  <section className="bg-slate-50 p-3 sm:p-4 lg:p-6">
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-base font-semibold text-slate-900">{title}</h1>
      <p className="pt-2 text-sm text-slate-600">This view is intentionally a placeholder for upcoming feature delivery.</p>
    </div>
  </section>
);

export const ProjectSettingsPage = () => <PlaceholderView title="Project Settings" />;