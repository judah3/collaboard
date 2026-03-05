import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderPlus, Plus } from "lucide-react";
import { useAuth } from "@/features/auth";
import {
  createProject,
  createWorkspace,
  listProjectsByWorkspace,
  listWorkspaces,
  type ProjectItem,
  type WorkspaceItem
} from "@/features/workspaces/api";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const defaultDueDate = () => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  return dueDate.toISOString().slice(0, 10);
};

export const WorkspacePage = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectDueDate, setProjectDueDate] = useState(defaultDueDate);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refreshProjects = async (workspaceId: string) => {
    if (!accessToken || !workspaceId) {
      setProjects([]);
      return;
    }

    const items = await listProjectsByWorkspace(accessToken, workspaceId);
    setProjects(items);
  };

  useEffect(() => {
    const load = async () => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const workspaceItems = await listWorkspaces(accessToken);
        setWorkspaces(workspaceItems);

        const firstWorkspaceId = workspaceItems[0]?.id ?? "";
        setSelectedWorkspaceId(firstWorkspaceId);
        await refreshProjects(firstWorkspaceId);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load workspace data");
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [accessToken]);

  useEffect(() => {
    if (!workspaceName.trim()) {
      setWorkspaceSlug("");
      return;
    }

    setWorkspaceSlug(slugify(workspaceName));
  }, [workspaceName]);

  const onCreateWorkspace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accessToken) {
      setError("Missing access token");
      return;
    }

    const name = workspaceName.trim();
    const slug = workspaceSlug.trim();

    if (!name || !slug) {
      setError("Workspace name is required.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsCreatingWorkspace(true);

    try {
      const workspace = await createWorkspace(accessToken, { name, slug });
      const nextWorkspaces = [workspace, ...workspaces.filter((item) => item.id !== workspace.id)];
      setWorkspaces(nextWorkspaces);
      setSelectedWorkspaceId(workspace.id);
      setWorkspaceName("");
      setWorkspaceSlug("");
      await refreshProjects(workspace.id);
      setSuccess(`Workspace "${workspace.name}" created.`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create workspace");
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  const onCreateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accessToken || !selectedWorkspaceId) {
      setError("Select a workspace first.");
      return;
    }

    const name = projectName.trim();
    if (!name) {
      setError("Project name is required.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsCreatingProject(true);

    try {
      const created = await createProject(accessToken, selectedWorkspaceId, {
        name,
        description: projectDescription.trim(),
        due_date: projectDueDate,
        progress: 0,
        archived: false
      });
      await refreshProjects(selectedWorkspaceId);
      setProjectName("");
      setProjectDescription("");
      setProjectDueDate(defaultDueDate());
      setSuccess(`Project "${created.name}" created.`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create project");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const onWorkspaceChange = async (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    setError(null);
    setSuccess(null);

    try {
      await refreshProjects(workspaceId);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load projects");
    }
  };

  return (
    <section className="bg-slate-50 p-3 sm:p-4 lg:p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h1 className="text-base font-semibold text-slate-900">Create Workspace</h1>
          <p className="pt-2 text-sm text-slate-600">Create a workspace from backend API.</p>

          <form className="mt-6 space-y-4" onSubmit={onCreateWorkspace}>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Workspace name</span>
              <Input
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                placeholder="Workspace Alpha"
                disabled={isCreatingWorkspace}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Slug</span>
              <Input
                value={workspaceSlug}
                onChange={(event) => setWorkspaceSlug(slugify(event.target.value))}
                placeholder="workspace-alpha"
                disabled={isCreatingWorkspace}
              />
            </label>

            <Button type="submit" variant="primary" className="h-10 w-full" disabled={isCreatingWorkspace}>
              <Plus className="h-4 w-4" />
              {isCreatingWorkspace ? "Creating workspace..." : "Create Workspace"}
            </Button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-semibold text-slate-900">Create Project</h2>
          <p className="pt-2 text-sm text-slate-600">Projects are loaded from the backend API.</p>

          <label className="mt-6 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Workspace</span>
            <select
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              value={selectedWorkspaceId}
              onChange={(event) => void onWorkspaceChange(event.target.value)}
              disabled={isLoading || isCreatingProject}
            >
              <option value="">Select workspace</option>
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </label>

          <form className="mt-4 space-y-4" onSubmit={onCreateProject}>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Project name</span>
              <Input
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="Project A"
                disabled={isCreatingProject || !selectedWorkspaceId}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Description</span>
              <Input
                value={projectDescription}
                onChange={(event) => setProjectDescription(event.target.value)}
                placeholder="Internal project"
                disabled={isCreatingProject || !selectedWorkspaceId}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Due date</span>
              <Input
                type="date"
                value={projectDueDate}
                onChange={(event) => setProjectDueDate(event.target.value)}
                disabled={isCreatingProject || !selectedWorkspaceId}
              />
            </label>

            <Button type="submit" variant="primary" className="h-10 w-full" disabled={isCreatingProject || !selectedWorkspaceId}>
              <FolderPlus className="h-4 w-4" />
              {isCreatingProject ? "Creating project..." : "Create Project"}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Projects in workspace</p>
            {projects.length === 0 ? (
              <p className="pt-2 text-sm text-slate-600">No projects yet.</p>
            ) : (
              <ul className="pt-2 space-y-2">
                {projects.map((project) => (
                  <li key={project.id} className="flex items-center justify-between text-sm text-slate-700">
                    <span>{project.name}</span>
                    <Button variant="secondary" className="h-8" onClick={() => navigate(`/projects/${project.id}/board`)}>
                      Open
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="mt-4 text-sm text-green-700">{success}</p> : null}
    </section>
  );
};
