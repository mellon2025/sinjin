import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateTeamRequest, type UpdateTeamRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useTeams() {
  return useQuery({
    queryKey: [api.teams.list.path],
    queryFn: async () => {
      const res = await fetch(api.teams.list.path);
      if (!res.ok) throw new Error("Failed to fetch teams");
      return api.teams.list.responses[200].parse(await res.json());
    },
  });
}

export function useTeam(id: number) {
  return useQuery({
    queryKey: [api.teams.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.teams.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch team");
      return api.teams.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTeamRequest) => {
      const res = await fetch(api.teams.create.path, {
        method: api.teams.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create team");
      }
      return api.teams.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.teams.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] }); // User's team info changes
      toast({ title: "تم إنشاء الفريق بنجاح", className: "bg-primary text-primary-foreground" });
    },
    onError: (err: Error) => {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    },
  });
}

export function useJoinTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ teamId, inviteCode }: { teamId: number, inviteCode?: string }) => {
      const url = buildUrl(api.teams.join.path, { id: teamId });
      const res = await fetch(url, {
        method: api.teams.join.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to join team");
      }
      return api.teams.join.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.teams.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      toast({ title: "تم الانضمام للفريق بنجاح", className: "bg-primary text-primary-foreground" });
    },
    onError: (err: Error) => {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateTeamRequest) => {
      const url = buildUrl(api.teams.update.path, { id });
      const res = await fetch(url, {
        method: api.teams.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update team");
      return api.teams.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.teams.list.path] });
      toast({ title: "تم تحديث الفريق", className: "bg-green-500 text-white" });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.teams.delete.path, { id });
      const res = await fetch(url, { method: api.teams.delete.method });
      if (!res.ok) throw new Error("Failed to delete team");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.teams.list.path] });
      toast({ title: "تم حذف الفريق", variant: "destructive" });
    },
  });
}
