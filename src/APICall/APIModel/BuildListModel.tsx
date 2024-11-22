export interface BuildListModel {
  count: number;
  value: Build[];
}

export interface Build {
  _links: Links;
  properties: Properties;
  tags: any[];
  validationResults: ValidationResult[];
  plans: Plan[];
  triggerInfo: TriggerInfo;
  id: number;
  buildNumber: string;
  status: string;
  result: string;
  queueTime: string;
  startTime: string;
  finishTime: string;
  url: string;
  definition: Definition;
  buildNumberRevision?: number;
  project: Project2;
  uri: string;
  sourceBranch: string;
  sourceVersion: string;
  queue: Queue;
  priority: string;
  reason: string;
  requestedFor: RequestedFor;
  requestedBy: RequestedBy;
  lastChangedDate: string;
  lastChangedBy: LastChangedBy;
  orchestrationPlan: OrchestrationPlan;
  logs: Logs;
  repository: Repository;
  retainedByRelease: boolean;
  triggeredByBuild: any;
  appendCommitMessageToRunName: boolean;
  parameters?: string;
}

export interface Links {
  self: Self;
  web: Web;
  sourceVersionDisplayUri: SourceVersionDisplayUri;
  timeline: Timeline;
  badge: Badge;
}

export interface Self {
  href: string;
}

export interface Web {
  href: string;
}

export interface SourceVersionDisplayUri {
  href: string;
}

export interface Timeline {
  href: string;
}

export interface Badge {
  href: string;
}

export interface Properties {}

export interface ValidationResult {
  result: string;
  message: string;
}

export interface Plan {
  planId: string;
}

export interface TriggerInfo {
  'ci.sourceBranch'?: string;
  'ci.sourceSha'?: string;
  'ci.message'?: string;
  'ci.triggerRepository'?: string;
}

export interface Definition {
  drafts: any[];
  id: number;
  name: string;
  url: string;
  uri: string;
  path: string;
  type: string;
  queueStatus: string;
  revision: number;
  project: Project;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  state: string;
  revision: number;
  visibility: string;
  lastUpdateTime: string;
}

export interface Project2 {
  id: string;
  name: string;
  description: string;
  url: string;
  state: string;
  revision: number;
  visibility: string;
  lastUpdateTime: string;
}

export interface Queue {
  id: number;
  name: string;
  pool: Pool;
}

export interface Pool {
  id: number;
  name: string;
  isHosted: boolean;
}

export interface RequestedFor {
  displayName: string;
  url: string;
  _links: Links2;
  id: string;
  uniqueName: string;
  imageUrl: string;
  descriptor: string;
}

export interface Links2 {
  avatar: Avatar;
}

export interface Avatar {
  href: string;
}

export interface RequestedBy {
  displayName: string;
  url: string;
  _links: Links3;
  id: string;
  uniqueName: string;
  imageUrl: string;
  descriptor: string;
}

export interface Links3 {
  avatar: Avatar2;
}

export interface Avatar2 {
  href: string;
}

export interface LastChangedBy {
  displayName: string;
  url: string;
  _links: Links4;
  id: string;
  uniqueName: string;
  imageUrl: string;
  descriptor: string;
}

export interface Links4 {
  avatar: Avatar3;
}

export interface Avatar3 {
  href: string;
}

export interface OrchestrationPlan {
  planId: string;
}

export interface Logs {
  id: number;
  type: string;
  url: string;
}

export interface Repository {
  id: string;
  type: string;
  name: string;
  url: string;
  clean: any;
  checkoutSubmodules: boolean;
}
