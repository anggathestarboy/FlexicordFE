export interface CategoryChild {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
  children: CategoryChild[];
}

export interface CategoriesResponse {
  message: string;
  data: Category[];
}