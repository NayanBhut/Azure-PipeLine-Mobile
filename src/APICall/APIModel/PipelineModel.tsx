export interface PipelineModel {
  count: number;
  value: PipeLine[];
}

export interface PipeLine {
  url: string;
  id: number;
  revision: number;
  name: string;
  folder: string;
}
