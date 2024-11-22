export interface BranchDataModel {
  value: BranchModel[];
  count: number;
}

export interface BranchModel {
  name: string;
  objectId: string;
  creator: Creator;
  url: string;
}

export interface Creator {
  displayName: string;
  url: string;
  id: string;
  imageUrl: string;
}
