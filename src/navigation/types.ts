import type {ApiResponse} from '../APICall/APIService';
import type {ProjectModel} from '../APICall/APIModel/ProjectModel';

/**
 * Central navigation contract. Every screen uses these route names and params
 * so TypeScript can verify navigation calls across the app.
 */
export type RootStackParamList = {
  'Login Form': undefined;
  'Apps List': {orgName: string; model: ApiResponse<ProjectModel>};
  PipeLineList: {appID: string};
  BuildList: {appID: string; pipelineID: string};
  BuildMonitorScreen: {
    appID: string;
    buildID: number;
    pipelineID?: string;
    projectID?: string;
  };
};
