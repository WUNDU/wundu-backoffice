import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesService } from "~/services/admin/categories.service";
import { queryKeys } from "~/lib/query-keys";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "~/types/admin";

const STALE = 30 * 60 * 1000;
const PAGE_SIZE = 20;

export function useCategoriesList(page: number) {
  return useQuery({
    queryKey: queryKeys.categories.list(page),
    queryFn: () => categoriesService.list({ page, size: PAGE_SIZE }),
    staleTime: STALE,
    placeholderData: (prev) => prev,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCategoryRequest) => categoriesService.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCategoryRequest }) =>
      categoriesService.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}
