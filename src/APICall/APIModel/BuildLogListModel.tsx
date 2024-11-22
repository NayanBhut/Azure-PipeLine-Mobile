export interface BuildLogListModel {
  count: number;
  value: BuildLogModel[];
}

export interface BuildLogModel {
  lineCount: number;
  createdOn: string;
  lastChangedOn: string;
  id: number;
  type: string;
  url: string;
}
