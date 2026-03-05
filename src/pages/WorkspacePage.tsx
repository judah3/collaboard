import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderPlus, Plus, Users, X } from "lucide-react";
import { useAuth } from "@/features/auth";
import {
  addWorkspaceMember,
  createProject,
  createWorkspace,
  listAllUsersForWorkspaceMembers,
  listProjectsByWorkspace,
  listWorkspaceMembers,
  listWorkspaces,
  updateWorkspaceMemberRole,
  type WorkspaceMemberItem,
  type ProjectItem,
  type WorkspaceUserOption,
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
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMemberItem[]>([]);
  const [availableUsers, setAvailableUsers] = useState<WorkspaceUserOption[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectDueDate, setProjectDueDate] = useState(defaultDueDate);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [workspaceMemberRole, setWorkspaceMemberRole] = useState("MEMBER");
  const [isManageWorkspaceOpen, setIsManageWorkspaceOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isAddingWorkspaceMember, setIsAddingWorkspaceMember] = useState(false);
  const [isSavingWorkspaceRoles, setIsSavingWorkspaceRoles] = useState(false);
  const [memberRoleDrafts, setMemberRoleDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const usersById = new Map(availableUsers.map((user) => [user.id, user]));
  const roleOptions = ["OWNER", "ADMIN", "MEMBER"];
  const changedWorkspaceMemberRoles = useMemo(
    () =>
      workspaceMembers
        .map((member) => ({ member, nextRole: memberRoleDrafts[member.userId] ?? member.role }))
        .filter(({ member, nextRole }) => nextRole !== member.role),
    [memberRoleDrafts, workspaceMembers]
  );

  const refreshProjects = async (workspaceId: string) => {
    if (!accessToken || !workspaceId) {
      setProjects([]);
      return;
    }

    const items = await listProjectsByWorkspace(accessToken, workspaceId);
    setProjects(items);
  };

  const refreshWorkspaceMembers = async (workspaceId: string) => {
    if (!accessToken || !workspaceId) {
      setWorkspaceMembers([]);
      return;
    }

    setIsLoadingMembers(true);
    try {
      const members = await listWorkspaceMembers(accessToken, workspaceId);
      setWorkspaceMembers(members);
      setMemberRoleDrafts(
        members.reduce<Record<string, string>>((acc, member) => {
          acc[member.userId] = member.role;
          return acc;
        }, {})
      );
    } finally {
      setIsLoadingMembers(false);
    }
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
        const users = await listAllUsersForWorkspaceMembers(accessToken);
        setAvailableUsers(users);

        const firstWorkspaceId = workspaceItems[0]?.id ?? "";
        setSelectedWorkspaceId(firstWorkspaceId);
        await refreshProjects(firstWorkspaceId);
        await refreshWorkspaceMembers(firstWorkspaceId);
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
      await refreshWorkspaceMembers(workspace.id);
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
      await refreshWorkspaceMembers(workspaceId);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load workspace data");
    }
  };

  const openManageWorkspace = () => {
    setError(null);
    setSuccess(null);
    setIsManageWorkspaceOpen(true);
  };

  const onAddWorkspaceMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accessToken || !selectedWorkspaceId) {
      setError("Select a workspace first.");
      return;
    }

    if (!selectedUserEmail) {
      setError("Select a user to add.");
      return;
    }

    const selectedUser = availableUsers.find((user) => user.email === selectedUserEmail);
    const existing = workspaceMembers.some(
      (member) =>
        member.email?.toLowerCase() === selectedUserEmail.toLowerCase() ||
        (!!selectedUser && member.userId === selectedUser.id)
    );
    if (existing) {
      setError("Selected user is already a workspace member.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsAddingWorkspaceMember(true);

    try {
      await addWorkspaceMember(accessToken, selectedWorkspaceId, {
        email: selectedUserEmail,
        role: workspaceMemberRole
      });
      await refreshWorkspaceMembers(selectedWorkspaceId);
      setSuccess(`Member "${selectedUserEmail}" added to workspace.`);
      setSelectedUserEmail("");
      setWorkspaceMemberRole("MEMBER");
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : "Failed to add workspace member");
    } finally {
      setIsAddingWorkspaceMember(false);
    }
  };

  const onWorkspaceMemberRoleChange = (userId: string, role: string) => {
    setMemberRoleDrafts((previous) => ({ ...previous, [userId]: role }));
  };

  const onSaveWorkspaceMemberRoles = async () => {
    if (!accessToken || !selectedWorkspaceId) {
      setError("Select a workspace first.");
      return;
    }

    if (changedWorkspaceMemberRoles.length === 0) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSavingWorkspaceRoles(true);

    try {
      await Promise.all(
        changedWorkspaceMemberRoles.map(({ member, nextRole }) =>
          updateWorkspaceMemberRole(accessToken, selectedWorkspaceId, member.userId, { role: nextRole })
        )
      );
      await refreshWorkspaceMembers(selectedWorkspaceId);
      setSuccess(`Updated ${changedWorkspaceMemberRoles.length} member role(s).`);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update workspace member role");
    } finally {
      setIsSavingWorkspaceRoles(false);
    }
  };

  return (
    <section className="bg-slate-50 p-3 sm:p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Workspace Management</h1>
          <p className="pt-1 text-sm text-slate-600">Create workspaces and projects, then manage workspace members.</p>
        </div>
        <Button variant="primary" className="h-10" onClick={openManageWorkspace} disabled={workspaces.length === 0}>
          <Users className="h-4 w-4" />
          Manage Workspace
        </Button>
      </div>

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
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none"
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

      {isManageWorkspaceOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 sm:p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Manage Workspace</h2>
                <p className="pt-2 text-sm text-slate-600">Choose a workspace and add users from global users list.</p>
              </div>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none"
                onClick={() => setIsManageWorkspaceOpen(false)}
                aria-label="Close manage workspace"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Workspace</span>
                  <select
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none"
                    value={selectedWorkspaceId}
                    onChange={(event) => void onWorkspaceChange(event.target.value)}
                    disabled={isLoading || isAddingWorkspaceMember}
                  >
                    <option value="">Select workspace</option>
                    {workspaces.map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </option>
                    ))}
                  </select>
                </label>

                <form className="mt-4 space-y-4" onSubmit={onAddWorkspaceMember}>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">User</span>
                    <select
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none"
                      value={selectedUserEmail}
                      onChange={(event) => setSelectedUserEmail(event.target.value)}
                      disabled={!selectedWorkspaceId || isAddingWorkspaceMember || availableUsers.length === 0}
                    >
                      <option value="">Select user</option>
                      {availableUsers.map((user) => (
                        <option key={`${user.id}-${user.email}`} value={user.email}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">Role</span>
                    <select
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none"
                      value={workspaceMemberRole}
                      onChange={(event) => setWorkspaceMemberRole(event.target.value)}
                      disabled={!selectedWorkspaceId || isAddingWorkspaceMember}
                    >
                      <option value="MEMBER">MEMBER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </label>

                  <Button
                    type="submit"
                    variant="primary"
                    className="h-9 w-full"
                    disabled={!selectedWorkspaceId || isAddingWorkspaceMember || !selectedUserEmail}
                  >
                    {isAddingWorkspaceMember ? "Adding..." : "Add Member"}
                  </Button>
                </form>

                {availableUsers.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-600">No users found from global users endpoint.</p>
                ) : null}
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Members in selected workspace</p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-8 px-3 text-xs"
                    disabled={isSavingWorkspaceRoles || changedWorkspaceMemberRoles.length === 0}
                    onClick={() => void onSaveWorkspaceMemberRoles()}
                  >
                    {isSavingWorkspaceRoles ? "Saving..." : "Save"}
                  </Button>
                </div>
                {isLoadingMembers ? <p className="pt-2 text-sm text-slate-600">Loading members...</p> : null}
                {!isLoadingMembers && workspaceMembers.length === 0 ? (
                  <p className="pt-2 text-sm text-slate-600">No members yet.</p>
                ) : null}
                {!isLoadingMembers && workspaceMembers.length > 0 ? (
                  <ul className="pt-2 space-y-2">
                    {workspaceMembers.map((member) => {
                      const selectedRole = memberRoleDrafts[member.userId] ?? member.role;
                      const roleValues = roleOptions.includes(member.role) ? roleOptions : [member.role, ...roleOptions];

                      return (
                        <li key={member.id} className="flex items-center justify-between gap-3 text-sm text-slate-700">
                          <span>
                            {(member.name ?? usersById.get(member.userId)?.name ?? member.userId)} (
                            {member.email ?? usersById.get(member.userId)?.email ?? "no-email"})
                          </span>
                          <div className="flex items-center gap-2">
                            <select
                              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 focus:outline-none"
                              value={selectedRole}
                              onChange={(event) => onWorkspaceMemberRoleChange(member.userId, event.target.value)}
                              disabled={isSavingWorkspaceRoles}
                            >
                              {roleValues.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </section>
            </div>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="mt-4 text-sm text-green-700">{success}</p> : null}
    </section>
  );
};


