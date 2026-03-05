import { FormEvent, useEffect, useMemo, useState } from "react";
import { UserRound, Tags } from "lucide-react";
import { useAuth } from "@/features/auth";
import { addProjectMember } from "@/features/projects/api";
import { useProjectLayoutContext } from "@/features/projects/context/ProjectLayoutContext";
import type { ProjectMember } from "@/features/projects/types";
import { listAllUsersForWorkspaceMembers, listWorkspaceMembers, type WorkspaceMemberItem, type WorkspaceUserOption } from "@/features/workspaces/api";
import { useTasks, useUpdateTask } from "@/features/tasks/hooks/useTasks";
import { Avatar } from "@/shared/ui/Avatar";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";

const SAMPLE_PROJECT_ID = "mad-dogs-portal";
const TAG_STORAGE_KEY_PREFIX = "pm_project_tags_";
const normalizeTag = (tag: string) => tag.trim();
const normalizeTagKey = (tag: string) => normalizeTag(tag).toLowerCase();

export const ProjectSettingsPage = () => {
  const { project, projectId } = useProjectLayoutContext();
  const { accessToken } = useAuth();
  const { data: tasks = [], isLoading } = useTasks(projectId, {
    searchQuery: "",
    assigneeFilter: "all",
    tagFilter: "all"
  });
  const updateTaskMutation = useUpdateTask(projectId);
  const [members, setMembers] = useState<ProjectMember[]>(project.members);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMemberItem[]>([]);
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUserOption[]>([]);
  const [selectedWorkspaceUserId, setSelectedWorkspaceUserId] = useState("");
  const [isImportingMember, setIsImportingMember] = useState(false);
  const [isImportingAll, setIsImportingAll] = useState(false);
  const [isLoadingWorkspaceMembers, setIsLoadingWorkspaceMembers] = useState(false);
  const [workspaceMemberError, setWorkspaceMemberError] = useState<string | null>(null);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [tagRenameDraft, setTagRenameDraft] = useState("");
  const [isRenamingTag, setIsRenamingTag] = useState(false);

  useEffect(() => {
    setMembers(project.members);
  }, [project.members]);

  useEffect(() => {
    const key = `${TAG_STORAGE_KEY_PREFIX}${projectId}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      setCustomTags([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        setCustomTags([]);
        localStorage.removeItem(key);
        return;
      }

      const tags = parsed
        .filter((item): item is string => typeof item === "string")
        .map((tag) => normalizeTag(tag))
        .filter((tag) => !!tag);

      setCustomTags(Array.from(new Set(tags)));
    } catch {
      setCustomTags([]);
      localStorage.removeItem(key);
    }
  }, [projectId]);

  useEffect(() => {
    const key = `${TAG_STORAGE_KEY_PREFIX}${projectId}`;
    localStorage.setItem(key, JSON.stringify(customTags));
  }, [customTags, projectId]);

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

  const taskTagStats = useMemo(() => {
    const usage = new Map<string, number>();

    for (const task of tasks) {
      for (const tag of task.tags) {
        usage.set(tag, (usage.get(tag) ?? 0) + 1);
      }
    }

    return Array.from(usage.entries()).sort((a, b) => b[1] - a[1]);
  }, [tasks]);

  const tagStats = useMemo(() => {
    const usage = new Map<string, number>(taskTagStats);
    for (const tag of customTags) {
      if (!usage.has(tag)) {
        usage.set(tag, 0);
      }
    }

    return Array.from(usage.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [customTags, taskTagStats]);

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

  const onCreateTag = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTagError(null);

    const candidate = normalizeTag(newTag);
    if (!candidate) {
      setTagError("Tag name is required.");
      return;
    }

    if (candidate.length > 24) {
      setTagError("Tag name must be 24 characters or fewer.");
      return;
    }

    const exists = tagStats.some(([tag]) => normalizeTagKey(tag) === normalizeTagKey(candidate));
    if (exists) {
      setTagError("Tag already exists.");
      return;
    }

    setCustomTags((current) => [...current, candidate]);
    setNewTag("");
  };

  const startRenameTag = (tag: string) => {
    setTagError(null);
    setEditingTag(tag);
    setTagRenameDraft(tag);
  };

  const cancelRenameTag = () => {
    setEditingTag(null);
    setTagRenameDraft("");
  };

  const saveRenameTag = async (oldTag: string) => {
    setTagError(null);
    const nextTag = normalizeTag(tagRenameDraft);

    if (!nextTag) {
      setTagError("Tag name is required.");
      return;
    }

    if (nextTag.length > 24) {
      setTagError("Tag name must be 24 characters or fewer.");
      return;
    }

    const isSame = normalizeTagKey(nextTag) === normalizeTagKey(oldTag);
    const duplicate = tagStats.some(([tag]) => normalizeTagKey(tag) === normalizeTagKey(nextTag));
    if (!isSame && duplicate) {
      setTagError("Another tag with this name already exists.");
      return;
    }

    setIsRenamingTag(true);
    try {
      const affectedTasks = tasks.filter((task) => task.tags.some((tag) => normalizeTagKey(tag) === normalizeTagKey(oldTag)));
      for (const task of affectedTasks) {
        const nextTags = task.tags.map((tag) => (normalizeTagKey(tag) === normalizeTagKey(oldTag) ? nextTag : tag));
        await updateTaskMutation.mutateAsync({
          taskId: task.id,
          patch: { tags: nextTags }
        });
      }

      setCustomTags((current) => {
        const mapped = current.map((tag) => (normalizeTagKey(tag) === normalizeTagKey(oldTag) ? nextTag : tag));
        return Array.from(new Set(mapped));
      });

      setEditingTag(null);
      setTagRenameDraft("");
    } catch (error) {
      setTagError(error instanceof Error ? error.message : "Failed to rename tag");
    } finally {
      setIsRenamingTag(false);
    }
  };

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
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none"
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
          {!isLoading ? (
            <form className="mt-4 flex items-end gap-2" onSubmit={onCreateTag}>
              <label className="block flex-1">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Create tag</span>
                <input
                  value={newTag}
                  onChange={(event) => setNewTag(event.target.value)}
                  placeholder="backend"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none"
                />
              </label>
              <Button type="submit" variant="primary" className="h-9">
                Add Tag
              </Button>
            </form>
          ) : null}

          {tagError ? <p className="mt-3 text-sm text-red-600">{tagError}</p> : null}

          {!isLoading && tagStats.length === 0 ? <p className="mt-4 text-sm text-slate-600">No tags yet.</p> : null}

          {!isLoading && tagStats.length > 0 ? (
            <div className="mt-4 space-y-2">
              {tagStats.map(([tag, count]) => (
                <div key={tag} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center gap-2">
                    {editingTag === tag ? (
                      <input
                        value={tagRenameDraft}
                        onChange={(event) => setTagRenameDraft(event.target.value)}
                        className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 focus:outline-none"
                        disabled={isRenamingTag}
                      />
                    ) : (
                      <Badge label={tag} tone="slate" />
                    )}
                    <span className="text-xs text-slate-500">{count} task(s)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {editingTag === tag ? (
                      <>
                        <Button
                          variant="secondary"
                          className="h-8"
                          onClick={() => void saveRenameTag(tag)}
                          disabled={isRenamingTag}
                        >
                          {isRenamingTag ? "Saving..." : "Save"}
                        </Button>
                        <Button variant="ghost" className="h-8" onClick={cancelRenameTag} disabled={isRenamingTag}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button variant="secondary" className="h-8" onClick={() => startRenameTag(tag)}>
                        Rename
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
};


