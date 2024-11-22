const API_CONFIG = {
  // Base URL for Azure DevOps REST API
  BASE_URL: 'https://dev.azure.com/',
  API_VERSION: 'api-version=7.1',
  PAGINATION_PARAM: '$top=15',

  endpoints: {
    projects: {
      list: (orgName: string, continuationToken: string | null) => {
        const nextPageToken =
          continuationToken != null
            ? `&continuationToken=${continuationToken}`
            : '';
        return `${orgName}/_apis/projects?${API_CONFIG.API_VERSION}&$top=500${nextPageToken}`;
      },
    },
    pipelines: {
      list: (
        orgName: string,
        projectID: string,
        continuationToken: string | null,
      ) => {
        const nextPageToken =
          continuationToken != null
            ? `&continuationToken=${continuationToken}`
            : '';
        return `${orgName}/${projectID}/_apis/pipelines?${API_CONFIG.API_VERSION}&${API_CONFIG.PAGINATION_PARAM}${nextPageToken}`;
      },
      runs: (
        orgName: string,
        projectID: string,
        pipeLineID: string,
        continuationToken: string | null,
      ) => {
        const nextPageToken =
          continuationToken != null
            ? `&continuationToken=${continuationToken}`
            : '';
        return `${orgName}/${projectID}/_apis/pipelines/${pipeLineID}/runs?${API_CONFIG.API_VERSION}${nextPageToken}`;
      },
    },
    builds: {
      list: (
        orgName: string,
        projectID: string,
        definitions: number,
        continuationToken: string | null,
      ) => {
        const nextPageToken =
          continuationToken != null
            ? `&continuationToken=${continuationToken}`
            : '';
        return `${orgName}/${projectID}/_apis/build/builds?${API_CONFIG.API_VERSION}&definitions=${definitions}&${API_CONFIG.PAGINATION_PARAM}${nextPageToken}`;
      },
      timeline: (orgName: string, projectID: string, buildId: number) => {
        return `${orgName}/${projectID}/_apis/build/builds/${buildId}/timeline?${API_CONFIG.API_VERSION}`;
      },
      artifacts: (orgName: string, projectID: string, buildId: number) => {
        return `${orgName}/${projectID}/_apis/build/builds/${buildId}/artifacts?${API_CONFIG.API_VERSION}`;
      },
      logs: (orgName: string, projectID: string, buildId: string) => {
        return `${orgName}/${projectID}/_apis/build/builds/${buildId}/logs?${API_CONFIG.API_VERSION}`;
      },
    },
    repositories: {
      branches: (
        orgName: string,
        projectID: string,
        repositoryId: string,
        continuationToken: string | null,
        filterBranch: string | null,
      ) => {
        const nextPageToken =
          continuationToken != null
            ? `&continuationToken=${continuationToken}`
            : '';
        const filterBranchname =
          filterBranch != null ? `&filterContains=${filterBranch}` : '';
        return `${orgName}/${projectID}/_apis/git/repositories/${repositoryId}/refs?filter=heads/&${API_CONFIG.API_VERSION}&${API_CONFIG.PAGINATION_PARAM}${nextPageToken}${filterBranchname}`;
      },
      list: (orgName: string, projectID: string) => {
        return `${orgName}/${projectID}/_apis/git/repositories?${API_CONFIG.API_VERSION}`;
      },
    },
  },

  // API Keys or other constants
  // apiKeys: {
  //   personalAccessToken: 'your-personal-access-token',
  //   // Add more keys as needed
  // },

  // getOrgname: () => {
  //   const org = await AsyncStorage.getItem('org');
  //   if (!org) {
  //       Alert.alert('organization URL is missing.');
  //       return;
  //     }
  //     API_CONFIG.baseURL = org;
  // },

  // Headers
  // headers: {
  //   contentType: 'application/json',
  //   authorization: `Basic ${Buffer.from(
  //     `:${AzureDevOpsAPIConstants.apiKeys.personalAccessToken}`,
  //   ).toString('base64')}`,
  //   // Add more headers as needed
  // },

  // Method to update base URL
  // updateBaseURL: newBaseURL => {
  //   API_CONFIG.baseURL = newBaseURL;
  // },

  // Method to update personal access token
  // updatePersonalAccessToken: newToken => {
  //   AzureDevOpsAPIConstants.apiKeys.personalAccessToken = newToken;
  //   AzureDevOpsAPIConstants.headers.authorization = `Basic ${Buffer.from(
  //     `:${newToken}`,
  //   ).toString('base64')}`;
  // },
};

export default API_CONFIG;
