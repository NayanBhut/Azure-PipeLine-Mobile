export interface BuildLogsModel {
  records: BuildRecord[];
  lastChangedBy: string;
  lastChangedOn: Date;
  id: string;
  changeId: number;
  url: string;
}

export interface BuildRecord {
  previousAttempts: any[];
  id: string;
  parentId: null | string;
  type: RecordType;
  name: string;
  startTime: string | null;
  finishTime: string | null;
  currentOperation: null;
  percentComplete: null;
  state: State;
  result: Result;
  resultCode: null | string;
  changeId: number;
  lastModified: Date;
  workerName: WorkerName | null;
  details: null;
  errorCount: number;
  warningCount: number;
  url: null;
  log: Log | null;
  task: Task | null;
  attempt: number;
  identifier: null | string;
  order?: number;
  queueId?: number;
  issues?: Issue[];
}

export interface Issue {
  type: string;
  category: null;
  message: string;
  data?: Data;
}

export interface Data {
  logFileLineNumber: string;
  source?: string;
}

export interface Log {
  id: number;
  type: LogType;
  url: string;
}

export enum LogType {
  Container = 'Container',
}

export enum Result {
  Canceled = 'canceled',
  Failed = 'failed',
  Skipped = 'skipped',
  Succeeded = 'succeeded',
}

export enum State {
  Completed = 'completed',
}

export interface Task {
  id: string;
  name: string;
  version: string;
}

export enum RecordType {
  Checkpoint = 'Checkpoint',
  Job = 'Job',
  Phase = 'Phase',
  Stage = 'Stage',
  Task = 'Task',
}

export enum WorkerName {
  HostedAgent = 'Hosted Agent',
}
