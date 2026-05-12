import { api } from "~/lib/api";
import type {
  AdminCategory,
  CategoryListParams,
  CreateCategoryRequest,
  Page,
  UpdateCategoryRequest,
} from "~/types/admin";

const BASE = "/admin/categories";

export const categoriesService = {
  list(params?: CategoryListParams) {
    return api.get<Page<AdminCategory>>(BASE, { params }).then((r) => r.data);
  },

  create(body: CreateCategoryRequest) {
    return api.post<AdminCategory>(BASE, body).then((r) => r.data);
  },

  update(categoryId: string, body: UpdateCategoryRequest) {
    return api.patch<AdminCategory>(`${BASE}/${categoryId}`, body).then((r) => r.data);
  },

  delete(categoryId: string) {
    return api.delete<void>(`${BASE}/${categoryId}`).then((r) => r.data);
  },
};
