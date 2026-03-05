import { FormEvent, useEffect, useMemo, useState } from "react";
import { UserRound, Tags } from "lucide-react";
import { useAuth } from "@/features/auth";
import { addProjectMember } from "@/features/projects/api";
import { useProjectLayoutContext } from "@/features/projects/context/ProjectLayoutContext";
import type { ProjectMember } from "@/features/projects/types";
import { listAllUsersForWorkspaceMembers, listWorkspaceMembers, type WorkspaceMemberItem, type WorkspaceUserOption } from "@/features/workspaces/api";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { Avatar } from "@/shared/ui/Avatar";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";

const SAMPLE_PROJECT_ID = "mad-dogs-portal";

export const ProjectSettingsPage = () => {
  const { project, projectId } = useProjectLayoutContext();
  const { accessToken } = useAuth();
  const { data: tasks = [], isLoading } = useTasks(projectId, {
    searchQuery: "",
    assigneeFilter: "all",
    tagFilter: "all"
  });
  const [members, setMembers] = useState<ProjectMember[]>(project.members);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMemberItem[]>([]);
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUserOption[]>([]);
  const [selectedWorkspaceUserId, setSelectedWorkspaceUserId] = useState("");
  const [isImportingMember, setIsImportingMember] = useState(false);
  const [isImportingAll, setIsImportingAll] = useState(false);
  const [isLoadingWorkspaceMembers, setIsLoadingWorkspaceMembers] = useState(false);
  const [workspaceMemberError, setWorkspaceMemberError] = useState<string | null>(null);

  useEffect(() => {
    setMembers(project.members);
  }, [project.members]);

  useEffect(() => {
    const loadWorkspaceMembers = async () => {
      if (!accessToken || !project.workspaceId) {
        setWorkspaceMembers([]);
        setWorkspaceUsers([]);
        return;
      }

      setIsLoadingWorkspaceMembers(true);
      setWorkspaceMemberError(null);
      try {
        const [membersResult, usersResult] = await Promise.all([
          listWorkspaceMembers(accessToken, project.workspaceId),
          listAllUsersForWorkspaceMembers(accessToken)
        ]);
        setWorkspaceMembers(membersResult);
        setWorkspaceUsers(usersResult);
      } catch (error) {
        setWorkspaceMemberError(error instanceof Error ? error.message : "Failed to load workspace members");
      } finally {
        setIsLoadingWorkspaceMembers(false);
      }
    };

    void loadWorkspaceMembers();
  }, [accessToken, project.workspaceId]);

  const tagStats = useMemo(() => {
    const usage = new Map<string, number>();

    for (const task of tasks) {
      for (const tag of task.tags) {
        usage.set(tag, (usage.get(tag) ?? 0) + 1);
      }
    }

    return Array.from(usage.entries()).sort((a, b) => b[1] - a[1]);
  }, [tasks]);

  const workspaceUsersById = useMemo(() => new Map(workspaceUsers.map((user) => [user.id, user])), [workspaceUsers]);

  const toWorkspaceMemberEmail = (member: WorkspaceMemberItem) =>
    member.email ?? workspaceUsersById.get(member.userId)?.email ?? null;

  const toWorkspaceMemberName = (member: WorkspaceMemberItem) =>
    member.name ?? workspaceUsersById.get(member.userId)?.name ?? `User ${member.userId.slice(0, 8)}`;

  const isAlreadyProjectMember = (workspaceMember: WorkspaceMemberItem) => {
    const email = toWorkspaceMemberEmail(workspaceMember)?.toLowerCase();
    return members.some((member) => {
      if (member.userId && member.userId === workspaceMember.userId) {
        return true;
      }

      if (email && member.email?.toLowerCase() === email) {
        return true;
      }

      return false;
    });
  };

  const importableWorkspaceMembers = useMemo(
    () => workspaceMembers.filter((member) => !isAlreadyProjectMember(member)),
    [members, workspaceMembers, workspaceUsersById]
  );

  const onImportWorkspaceMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWorkspaceMemberError(null);

    if (!selectedWorkspaceUserId) {
      setWorkspaceMemberError("Select a workspace member to import.");
      return;
    }

    const workspaceMember = workspaceMembers.find((member) => member.userId === selectedWorkspaceUserId);
    if (!workspaceMember) {
      setWorkspaceMemberError("Selected member was not found in workspace.");
      return;
    }

    const email = toWorkspaceMemberEmail(workspaceMember);
    const name = toWorkspaceMemberName(workspaceMember);
    if (!email) {
      setWorkspaceMemberError(`Cannot import ${name}: email is missing.`);
      return;
    }

    setIsImportingMember(true);
    try {
      if (projectId === SAMPLE_PROJECT_ID) {
        const localMember: ProjectMember = {
          id: `member_${Date.now()}`,
          userId: workspaceMember.userId,
          email,
          name,
          role: workspaceMember.role
        };
        setMembers((current) => [localMember, ...current]);
      } else {
        if (!accessToken) {
          throw new Error("Missing auth access token");
        }

        const created = await addProjectMember(accessToken, projectId, {
          email,
          role: workspaceMember.role
        });
        setMembers((current) => [created, ...current]);
      }

      setSelectedWorkspaceUserId("");
    } catch (error) {
      setWorkspaceMemberError(error instanceof Error ? error.message : "Failed to import workspace member");
    } finally {
      setIsImportingMember(false);
    }
  };

  const onImportAllWorkspaceTeam = async () => {
    setWorkspaceMemberError(null);
    const candidates = importableWorkspaceMembers
      .map((member) => ({
        member,
        email: toWorkspaceMemberEmail(member),
        name: toWorkspaceMemberName(member)
      }))
      .filter((item): item is { member: WorkspaceMemberItem; email: string; name: string } => !!item.email);

    if (candidates.length === 0) {
      setWorkspaceMemberError("No importable workspace members found.");
      return;
    }

    setIsImportingAll(true);
    try {
      if (projectId === SAMPLE_PROJECT_ID) {
        const localMembers: ProjectMember[] = candidates.map((item) => ({
          id: `member_${item.member.userId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          userId: item.member.userId,
          email: item.email,
          name: item.name,
          role: item.member.role
        }));
        setMembers((current) => [...localMembers, ...current]);
      } else {
        if (!accessToken) {
          throw new Error("Missing auth access token");
        }

        const created = await Promise.all(
          candidates.map((item) =>
            addProjectMember(accessToken, projectId, {
              email: item.email,
              role: item.member.role
            })
          )
        );
        setMembers((current) => [...created, ...current]);
      }
    } catch (error) {
      setWorkspaceMemberError(error instanceof Error ? error.message : "Failed to import all workspace members");
    } finally {
      setIsImportingAll(false);
    }
  };

  return (
    <section className="bg-slate-50 p-3 sm:p-4 lg:p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-base font-semibold text-slate-900">Project Settings</h1>
        <p className="pt-2 text-sm text-slate-600">Manage members and tags for {project.name}.</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-900">Members</h2>
          </div>

          <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-white p-3">
            <h3 className="text-sm font-semibold text-slate-900">Import from Workspace</h3>
            <p className="text-xs text-slate-500">Import members from workspace team into this project.</p>

            {!project.workspaceId ? (
              <p className="text-sm text-slate-600">This project has no workspace reference, so import is unavailable.</p>
            ) : null}

            {project.workspaceId && isLoadingWorkspaceMembers ? (
              <p className="text-sm text-slate-600">Loading workspace members...</p>
            ) : null}

            {project.workspaceId && !isLoadingWorkspaceMembers ? (
              <form className="space-y-3" onSubmit={onImportWorkspaceMember}>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Workspace member</span>
                  <select
                    value={selectedWorkspaceUserId}
                    onChange={(event) => setSelectedWorkspaceUserId(event.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    disabled={isImportingMember || isImportingAll || importableWorkspaceMembers.length === 0}
                  >
                    <option value="">Select workspace member</option>
                    {importableWorkspaceMembers.map((member) => {
                      const name = toWorkspaceMemberName(member);
                      const email = toWorkspaceMemberEmail(member) ?? "no-email";
                      return (
                        <option key={member.id} value={member.userId}>
                          {name} ({email}) - {member.role}
                        </option>
                      );
                    })}
                  </select>
                </label>

                {workspaceMemberError ? <p className="text-sm text-red-600">{workspaceMemberError}</p> : null}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    variant="secondary"
                    className="h-9"
                    disabled={isImportingMember || isImportingAll || !selectedWorkspaceUserId}
                  >
                    {isImportingMember ? "Importing..." : "Import Selected Member"}
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    className="h-9"
                    onClick={() => void onImportAllWorkspaceTeam()}
                    disabled={isImportingMember || isImportingAll || importableWorkspaceMembers.length === 0}
                  >
                    {isImportingAll ? "Importing all..." : "Add all workspace team"}
                  </Button>
                </div>

                {importableWorkspaceMembers.length === 0 ? (
                  <p className="text-sm text-slate-600">All workspace members are already in this project, or no workspace members found.</p>
                ) : null}
              </form>
            ) : null}
          </div>

          <div className="mt-4 space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-3">
                  <Avatar name={member.name} src={member.avatarUrl ?? undefined} size="md" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.email ?? member.userId ?? member.id}</p>
                  </div>
                </div>
                <Badge label={member.role} tone="blue" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-900">Tags</h2>
          </div>

          {isLoading ? <p className="mt-4 text-sm text-slate-600">Loading tags...</p> : null}

          {!isLoading && tagStats.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">No tags found in tasks yet.</p>
          ) : null}

          {!isLoading && tagStats.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {tagStats.map(([tag, count]) => (
                <Badge key={tag} label={`${tag} (${count})`} tone="slate" />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
};
