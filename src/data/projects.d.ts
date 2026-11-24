export interface ProjectGalleryMedia {
  type: 'video' | 'image';
  src: string;
  caption?: string;
  fit?: 'cover' | 'contain';
}

export interface ProjectCatalogItem {
  id: string;
  featuredInCategory?: boolean;
  highlightInAll?: boolean;
  filterGroup: 'frontend' | 'grafico' | 'motion' | '3d' | string;
  year: string;
  yearShort?: string;
  client: string;
  category: string;
  flankLeft?: [string, string];
  flankRight?: [string, string];
  accentColor?: string;
  title: string;
  subtitle: string;
  description: string;
  role: string;
  stack: string[];
  coverType: 'video' | 'image';
  coverSrc: string;
  coverFit?: 'cover' | 'contain';
  poster?: string;
  gallery?: ProjectGalleryMedia[];
  externalUrl?: string;
  externalLabel?: string;
}

export interface ProjectFilterOption {
  id: string;
  label: string;
}

export const PROJECT_FILTERS: ProjectFilterOption[];
export const PROJECTS_CATALOG: ProjectCatalogItem[];
