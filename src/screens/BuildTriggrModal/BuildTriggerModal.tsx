import React, {useEffect, useState, useCallback} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native';
import ApiService from '../../APICall/APIService'; // API service for making requests
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing/retrieving data locally
import {
  RepositoryDetail,
  RepositoryModel,
} from '../../APICall/APIModel/RepositoryModel'; // Models for repositories
import {
  BranchDataModel,
  BranchModel,
} from '../../APICall/APIModel/BranchDataModel'; // Models for branch data
import SwitchWithLabels from '../../Common/SwitchWithLabel'; // Custom switch component
import BuildTriggerButton from './BuidTriggerComponents/BuildTriggerButtons'; // Component for triggering build
import CustomKeyForm from './BuidTriggerComponents/CustomKeyForm'; // Custom key input form
import BranchListAndSearch from './BuidTriggerComponents/BranchListSearch'; // Branch selection & search component
import ReposistoryList from './BuidTriggerComponents/RepositioryList'; // Repository list component
import {TextInput} from 'react-native-gesture-handler'; // Text input component for branch name
import API_CONFIG from '../../APICall/APIConstants'; // Configuration for API endpoints
import FullScreenLoader from '../../Common/FullScreenLoader'; // Full-screen loading spinner

// Helper component for displaying the repository/branch title and edit button
const BranchRepoViewTitle = ({
  item,
  callback,
  hide,
}: {
  item: string;
  callback: () => void;
  hide: boolean;
}) => (
  <View style={styles.repoView}>
    <Text style={[styles.sectionTitle, styles.flexone]}>{item}</Text>
    {!hide && (
      <Pressable
        onPress={() => {
          callback();
        }}>
        <Text style={styles.editBranchRepoButton}>Edit</Text>
      </Pressable>
    )}
  </View>
);

export interface CustomKeyModel {
  id: string;
  keyName: string;
  keyValue: string;
}

type BuildTriggerModalProps = {
  projectID: string; // Project ID for the pipeline
  visible: boolean; // Controls modal visibility
  pipeLineID: string; // Pipeline ID for the build trigger
  cancel: (status: boolean) => void; // Callback to cancel and close the modal
  wrongAuth: () => void; // Callback for authentication errors
};

const BuildTriggerModal = (props: BuildTriggerModalProps) => {
  // State hooks for managing repository, branch, and custom key data
  const [customKeys, setCustomKeys] = useState<CustomKeyModel[]>([]);
  const [repositories, setRepositories] = useState<RepositoryDetail[]>([]);
  const [branches, setBranches] = useState<BranchModel[]>([]);

  // State for form inputs related to custom keys
  const [keyName, setKeyName] = useState('');
  const [keyValue, setKeyValue] = useState('');
  const [editingKey, setEditingKey] = useState<CustomKeyModel | null>(null);

  // State for selected repository and branch
  const [selectedRepository, setSelectedRepository] =
    useState<RepositoryDetail | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchModel | null>(
    null,
  );

  const [continuationToken, setContinuationToken] = useState<string | null>(
    null,
  );
  const [filterBranch, setFilterBranch] = useState<string | null>(null);

  const [editSelectedRepo, seteditSelectedRepo] = useState<boolean>(true);
  const [editSelectedBranch, seteditSelectedBranch] = useState<boolean>(false);

  const [isAzureRepo, setIsAzureRepo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch repositories from the API
  const fetchRepositories = useCallback(async () => {
    const token = await AsyncStorage.getItem('token'); // Retrieve the token
    const org = await AsyncStorage.getItem('org'); // Retrieve the organization URL

    if (!token || !org) {
      Alert.alert('Error', 'Token or organization URL is missing.', [
        {text: 'OK', onPress: () => props.wrongAuth()}, // Handle missing credentials
      ]);
      return;
    }

    const url = API_CONFIG.endpoints.repositories.list(org, props.projectID); // Construct API URL
    const apiService = new ApiService(API_CONFIG.BASE_URL); // Initialize API service

    try {
      // Make the API call to fetch repositories
      const response = await apiService.get<RepositoryModel>(url, {
        'content-type': 'application/json',
        Authorization: token, // Pass authentication token in the request
      });
      setRepositories(response.data.value); // Store repositories data in state
    } catch (error) {
      console.error('Failed to fetch repositories', error);
      Alert.alert('Error', 'Failed to fetch repositories'); // Show error message if fetching fails
    }
  }, [props.projectID]); // Dependency array, re-fetch if projectID changes

  // Fetch branches for a selected repository
  const fetchBranches = async (repositoryId: string) => {
    const token = await AsyncStorage.getItem('token');
    const org = await AsyncStorage.getItem('org');

    if (!token || !org) {
      Alert.alert('Error', 'Token or organization URL is missing.', [
        {text: 'OK', onPress: () => props.wrongAuth()},
      ]);
      return;
    }

    const url = API_CONFIG.endpoints.repositories.branches(
      org,
      props.projectID,
      repositoryId,
      continuationToken,
      filterBranch,
    );
    const apiService = new ApiService(API_CONFIG.BASE_URL);

    try {
      const response = await apiService.get<BranchDataModel>(url, {
        'content-type': 'application/json',
        Authorization: token,
      });
      // Filter branches to include only valid branches
      const branchList = response.data.value.filter((ref: any) =>
        ref.name.startsWith('refs/heads/'),
      );

      setBranches(prevBuilds => [...prevBuilds, ...branchList]); // Append new branches
      const continuationtoken = response.headers['x-ms-continuationtoken']; // Get continuation token for pagination
      setContinuationToken(continuationtoken); // Update continuation token for next fetch
    } catch (error) {
      console.error('Failed to fetch branches', error);
      Alert.alert('Error', 'Failed to fetch branches');
    }
  };

  // Add a new custom key to the list
  const addCustomKey = () => {
    if (!keyName || !keyValue) {
      Alert.alert('Error', 'Please provide both Key Name and Key Value');
      return;
    }

    const newKey: CustomKeyModel = {
      id: Math.random().toString(),
      keyName: keyName,
      keyValue: keyValue,
    };

    // Check if key already exists
    const isKeyadded = customKeys.find(customData => {
      return customData.keyName === newKey.keyName;
    });

    if (isKeyadded) {
      Alert.alert('Error', 'Key is already added. Please update existing key.');
      return;
    }

    // Add the new key and reset the form
    setCustomKeys(prev => [...prev, newKey]);
    resetKeyForm();
  };

  // Edit an existing custom key
  const editCustomKey = (key: CustomKeyModel) => {
    setEditingKey(key);
    setKeyName(key.keyName);
    setKeyValue(key.keyValue);
  };

  // Save edited custom key
  const saveEditedKey = () => {
    if (!keyName || !keyValue) {
      Alert.alert('Error', 'Please provide both Key Name and Key Value');
      return;
    }

    const updatedKeys = customKeys.map(key =>
      key.id === editingKey?.id ? {...key, keyName, keyValue} : key,
    );

    setCustomKeys(updatedKeys); // Update the custom keys list with the edited key
    resetKeyForm(); // Reset the form after saving
  };

  // Delete a custom key
  const deleteCustomKey = (keyId: string) => {
    setCustomKeys(prev => prev.filter(key => key.id !== keyId)); // Filter out the deleted key
  };

  // Reset the custom key form
  const resetKeyForm = () => {
    setKeyName('');
    setKeyValue('');
    setEditingKey(null); // Reset form fields
  };

  // Build the payload for the build trigger API call
  const getBuildPayload = (templateParameters: {}) => {
    return {
      resources: {
        repositories: {
          self: isAzureRepo
            ? {
                repository: {
                  id: selectedRepository?.id ?? '',
                  fullName: selectedRepository?.name ?? '',
                  type: 'azureReposGit',
                },
                refName: `${selectedBranch?.name ?? ''}`,
              }
            : {
                refName: `refs/heads/${filterBranch}`,
              },
        },
      },
      templateParameters: templateParameters,
    };
  };

  // Validate required parameters before triggering the build
  function validateBuildTriggerParams(): boolean {
    if (isAzureRepo) {
      return checkParamsForAzureRepo();
    } else {
      return checkParamsForNonAzureRepo();
    }
  }

  // Azure-specific parameter validation
  function checkParamsForAzureRepo(): boolean {
    if (selectedRepository === null || selectedBranch === null) {
      Alert.alert('Error', 'Please select a repository and branch');
      return false;
    } else {
      return true;
    }
  }

  // Non-Azure-specific parameter validation
  function checkParamsForNonAzureRepo(): boolean {
    if (filterBranch?.trim().length === 0) {
      Alert.alert('Error', 'Please add your branch name');
      return false;
    } else {
      return true;
    }
  }

  // Trigger the build process
  const triggerBuild = async () => {
    if (validateBuildTriggerParams() === false) {
      return;
    }

    const token = await AsyncStorage.getItem('token');
    const org = await AsyncStorage.getItem('org');

    if (!token || !org) {
      Alert.alert('Error', 'Token or organization URL is missing.', [
        {text: 'OK', onPress: () => props.wrongAuth()},
      ]);
      return;
    }

    // Prepare template parameters (custom keys)
    var templateParameters: {[key: string]: any} = {};
    customKeys.forEach(dict => {
      templateParameters[dict.keyName] = dict.keyValue;
    });

    const buildTriggerPayload = getBuildPayload(templateParameters); // Prepare payload
    const url = API_CONFIG.endpoints.pipelines.runs(
      org,
      props.projectID,
      props.pipeLineID,
      continuationToken,
    );
    const apiService = new ApiService(API_CONFIG.BASE_URL);

    setIsLoading(true); // Set loading state

    apiService
      .post(url, buildTriggerPayload, {
        'content-type': 'application/json',
        Authorization: token, // Pass auth token
      })
      .then(response => {
        const continuationtoken = response.headers['x-ms-continuationtoken'];
        setContinuationToken(continuationtoken); // Update continuation token
        Alert.alert('Build Triggered', JSON.stringify(response.data), [
          {
            text: 'OK',
            onPress: () => {
              props.cancel(true); // Close modal on success
            },
          },
        ]);
        setIsLoading(false); // Hide loading spinner
      })
      .catch(error => {
        console.error(error);
        setIsLoading(false); // Hide loading spinner
        Alert.alert('Build Trigger Error', (error as Error).message, [
          {text: 'OK', onPress: () => console.log('Error pressed')},
        ]);
      });
  };

  // Fetch repositories when the modal is opened
  useEffect(() => {
    if (props.visible) {
      fetchRepositories(); // Fetch repositories when the modal becomes visible
    }
  }, [fetchRepositories, props.visible]);

  // Handle loading more branches when scrolling
  const handleLoadMore = async () => {
    if (continuationToken != null) {
      fetchBranches(selectedRepository?.id ?? '');
    }
  };

  // Toggle the Azure repo switch
  const toggleSwitch = () => setIsAzureRepo(previousState => !previousState);

  return (
    <Modal visible={props.visible} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        {!isLoading && (
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Build Configuration Divide UI</Text>
            <SwitchWithLabels
              label="Is Azure Repo?"
              isEnabled={isAzureRepo}
              onToggleSwitch={toggleSwitch}
            />
            {isAzureRepo && (
              <View style={styles.width100}>
                {/* Repositories List */}
                <BranchRepoViewTitle
                  item={
                    selectedRepository == null
                      ? 'Select Repository'
                      : `Selected Repository : ${selectedRepository?.name} `
                  }
                  callback={() => {
                    seteditSelectedRepo(true);
                    setSelectedRepository(null);
                    seteditSelectedBranch(true);
                    setFilterBranch('');
                    setSelectedBranch(null);
                  }}
                  hide={selectedRepository === null}
                />
                {/* Repo List */}
                <ReposistoryList
                  repositories={repositories}
                  selectedRepository={selectedRepository}
                  onSelectRepo={selectedRepo => {
                    setSelectedRepository(selectedRepo);
                    setBranches([]);
                    fetchBranches(selectedRepo.id);
                    seteditSelectedRepo(false);
                    seteditSelectedBranch(true);
                  }}
                  editSelectedRepo={editSelectedRepo}
                />
                {/* Branches List */}
                {selectedRepository != null && (
                  <BranchRepoViewTitle
                    item={
                      selectedBranch === null
                        ? 'Search or Select Branch'
                        : `Selected Branch : ${selectedBranch?.name.replace(
                            'refs/heads/',
                            '',
                          )} `
                    }
                    callback={() => {
                      seteditSelectedBranch(true);
                      setFilterBranch('');
                      setSelectedBranch(null);
                    }}
                    hide={selectedBranch === null}
                  />
                )}
                {/*Branch and Search Branch */}
                <BranchListAndSearch
                  selectedBranch={selectedBranch}
                  selectedRepository={selectedRepository}
                  branches={branches}
                  filterBranch={filterBranch}
                  onchangeText={(text: string) => {
                    setFilterBranch(text);
                    setBranches([]);
                    fetchBranches(selectedRepository?.id ?? '');
                  }}
                  loadMoreBranches={handleLoadMore}
                  onSelectBranch={branch => {
                    setSelectedBranch(branch);
                    seteditSelectedBranch(false);
                  }}
                />
              </View>
            )}

            {!isAzureRepo && (
              <TextInput
                style={styles.input}
                placeholder="Please enter your branch name"
                value={filterBranch ?? ''}
                autoCapitalize="none"
                onChangeText={value => {
                  setFilterBranch(value);
                }}
              />
            )}

            {/* Custom Keys Section */}
            <CustomKeyForm
              keyName={keyName}
              keyValue={keyValue}
              setKeyName={setKeyName}
              setKeyValue={setKeyValue}
              saveKey={editingKey ? saveEditedKey : addCustomKey}
              editingKey={editingKey != null}
              customKeys={customKeys}
              editCustomKey={item => {
                editCustomKey(item);
              }}
              deleteCustomKey={itemId => {
                deleteCustomKey(itemId);
              }}
            />
            {/* Action Buttons */}
            <BuildTriggerButton
              triggerBuild={triggerBuild}
              cancel={(status: boolean) => {
                props.cancel(status);
              }}
            />
          </View>
        )}
        <FullScreenLoader
          isLoading={isLoading}
          backgroundColor={styles.loaderViewBGColor}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
    color: 'black',
  },
  listContainer: {
    width: '100%',
    maxHeight: 100,
    minHeight: 0,
    flexGrow: 0,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedItem: {
    backgroundColor: '#e0e0e0',
  },
  itemText: {
    fontSize: 16,
    color: 'black',
  },
  listItemActions: {
    flexDirection: 'row',
  },
  editButton: {
    marginLeft: 10,
    padding: 5,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
  },
  flexone: {
    flex: 1,
  },
  zeroHeight: {
    height: 0,
  },
  repoView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editBranchRepoButton: {color: 'blue', paddingLeft: 10},
  redBgColor: {backgroundColor: 'red'},
  width100: {width: '100%'},
  loaderViewBGColor: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default BuildTriggerModal;
