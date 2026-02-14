import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  api, 
  buildUrl,
  type CreateCategoryRequest, 
  type CreateQuestionRequest,
  type UpdateSettingsRequest
} from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// === CATEGORIES ===
export function useCategories() {
  return useQuery({
    queryKey: [api.categories.list.path],
    queryFn: async () => {
      const res = await fetch(api.categories.list.path);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return api.categories.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: CreateCategoryRequest) => {
      const res = await fetch(api.categories.create.path, {
        method: api.categories.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create category");
      return api.categories.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path] });
      toast({ title: "تم إضافة التصنيف" });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.categories.delete.path, { id });
      const res = await fetch(url, { method: api.categories.delete.method });
      if (!res.ok) throw new Error("Failed to delete category");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path] });
      toast({ title: "تم حذف التصنيف", variant: "destructive" });
    },
  });
}

// === QUESTIONS ===
export function useQuestions(categoryId?: string) {
  return useQuery({
    queryKey: [api.questions.list.path, categoryId],
    queryFn: async () => {
      let url = api.questions.list.path;
      if (categoryId) url += `?categoryId=${categoryId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch questions");
      return api.questions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: CreateQuestionRequest) => {
      const res = await fetch(api.questions.create.path, {
        method: api.questions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create question");
      return api.questions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.questions.list.path] });
      toast({ title: "تم إضافة السؤال" });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.questions.delete.path, { id });
      const res = await fetch(url, { method: api.questions.delete.method });
      if (!res.ok) throw new Error("Failed to delete question");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.questions.list.path] });
      toast({ title: "تم حذف السؤال", variant: "destructive" });
    },
  });
}

// === SETTINGS & TIMER ===
export function useSettings() {
  return useQuery({
    queryKey: [api.settings.get.path],
    queryFn: async () => {
      const res = await fetch(api.settings.get.path);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return api.settings.get.responses[200].parse(await res.json());
    },
    refetchInterval: 1000, // Poll every second for timer updates
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateSettingsRequest) => {
      const res = await fetch(api.settings.update.path, {
        method: api.settings.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return api.settings.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path] });
    },
  });
}

// === TEAMS ===
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

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; points?: number }) => {
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
      toast({ title: "تم تحديث الفريق" });
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
