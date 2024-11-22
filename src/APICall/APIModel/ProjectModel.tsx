export interface ProjectModel {
  count: number;
  value: Project[];
}

export interface Project {
  description: string;
  id: string;
  lastUpdateTime: string;
  name: string;
  revision: number;
  state: string;
  url: string;
  visibility: string;
}
