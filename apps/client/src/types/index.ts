export interface FileItem {
  id: string;
  filename: string;
  tags: string[];
  size: number;
  createdAt: Date;
  updatedAt: Date;
  type: string;
  url?: string;
  accessLevel?: 'private' | 'shared' | 'public';
  sharedUsers?: AccessUser[];
}

export interface AccessUser {
  id: string;
  email: string;
  name: string;
  permission: 'view' | 'edit' | 'admin';
  avatar?: string;
}

export interface SearchFilters {
  query: string;
  searchType: 'normal' | 'semantic' | 'tags';
  selectedTags: string[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}