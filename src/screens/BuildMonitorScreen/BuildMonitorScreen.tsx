import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import ApiService from '../../APICall/APIService';
import {
  BuildLogsModel,
  BuildRecord,
} from '../../APICall/APIModel/BuildLogModel'; // Import models for build logs
import FullLogModal from '../FullLogModal/FullLogModal'; // Modal to show full logs
import {ArtifactModel, Artifacts} from '../../APICall/APIModel/ArtifactModel'; // Import artifact models
import TaskCard from './TaskCard'; // Task card component to display task details
import ArtifactsList from './ArtifactsList'; // Artifacts list component to display downloaded artifacts
import API_CONFIG from '../../APICall/APIConstants'; // API configuration constants
import FullScreenLoader from '../../Common/FullScreenLoader'; // Loader for full screen loading state

// Main Screen Component
const BuildMonitorScreen = ({route, navigation}) => {
  // States to manage various aspects of the screen
  const [filteredLogs, setFilteredTasks] = useState<BuildRecord[]>([]); // Filtered build logs
  const [, setLogModel] = useState<BuildLogsModel | null>(null); // Log model state (not used directly here)
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [showFullLogs, setShowFullLogs] = useState(false); // To toggle visibility of full logs
  const [logs, setLogs] = useState<string>(''); // Store logs for viewing in modal
  const [artifacts, setArtifacts] = useState<Artifacts[]>([]); // List of artifacts
  const [showArtifacts, setShowArtifacts] = useState<boolean>(false); // To toggle visibility of artifacts

  // Function to refresh data (called by Pull-to-Refresh)
  const onRefresh = () => {
    // fetchData(route.params.appID, route.params.buildID); // Fetch data again
  };

  // Fetch build data (logs) from the server
  const fetchData = async (projectID: string, buildId: number) => {
    setIsLoading(true); // Set loading state
    try {
      const token = await AsyncStorage.getItem('token'); // Get token from async storage
      const org = await AsyncStorage.getItem('org'); // Get organization from async storage

      if (!token || !org) {
        // If token or org is missing, show an alert and navigate to the top
        Alert.alert('Error', 'Token or organization URL is missing.', [
          {text: 'OK', onPress: () => navigation.popToTop()},
        ]);
        return;
      }

      // Construct URL for the API request to fetch build logs
      const url = API_CONFIG.endpoints.builds.timeline(org, projectID, buildId);
      const apiService = new ApiService(API_CONFIG.BASE_URL); // Initialize API service

      // Make API request to fetch logs
      apiService
        .get<BuildLogsModel>(url, {
          'content-type': 'application/json',
          Authorization: token,
        })
        .then(response => {
          const buildlogs = response.data ?? [];
          setLogModel(buildlogs); // Set log data (not used directly here)

          const records = buildlogs.records ?? [];
          // Filter logs to show only "Job" and "Task" types
          const filteredTaskLogs = records.filter(
            record => record.type === 'Job' || record.type === 'Task',
          );
          setFilteredTasks(filteredTaskLogs); // Update filtered logs state
        })
        .catch(error => {
          console.error(error); // Log error
          setIsLoading(false); // Turn off loading state on error
        });
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data. Please try again.', [
        {text: 'OK'},
      ]);
    } finally {
      setIsLoading(false); // Turn off loading state regardless of success or failure
    }
  };

  // Fetch artifacts related to the build
  const fetchArtifacts = async (projectID: string, buildId: number) => {
    setIsLoading(true); // Set loading state
    console.log('buildId : ', buildId);
    try {
      const token = await AsyncStorage.getItem('token'); // Get token from async storage
      const org = await AsyncStorage.getItem('org'); // Get organization from async storage

      if (!token || !org) {
        // If token or org is missing, show an alert and navigate to the top
        Alert.alert('Error', 'Token or organization URL is missing.', [
          {text: 'OK', onPress: () => navigation.popToTop()},
        ]);
        return;
      }

      // Construct URL for the API request to fetch artifacts
      const url = API_CONFIG.endpoints.builds.artifacts(
        org,
        projectID,
        buildId,
      );
      const apiService = new ApiService(API_CONFIG.BASE_URL); // Initialize API service

      // Make API request to fetch artifacts
      apiService
        .get<ArtifactModel>(url, {
          'content-type': 'application/json',
          Authorization: token,
        })
        .then(response => {
          const buildArtifacts = response.data.value ?? [];
          setArtifacts(buildArtifacts); // Set artifacts state
        })
        .catch(error => {
          console.error(error); // Log error
          setIsLoading(false); // Turn off loading state on error
        });
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data. Please try again.', [
        {text: 'OK'},
      ]);
    } finally {
      setIsLoading(false); // Turn off loading state regardless of success or failure
    }
  };

  // useEffect hook to fetch data and artifacts when the component mounts
  useEffect(() => {
    fetchData(route.params.appID, route.params.buildID); // Fetch build logs
    fetchArtifacts(route.params.appID, route.params.buildID); // Fetch artifacts
  }, [route]); // Dependency on route to trigger re-fetching when route changes

  return (
    <View style={styles.container}>
      {/* Full screen loader is shown when data is loading */}
      <FullScreenLoader
        isLoading={isLoading && logs.length === 0}
        backgroundColor={null}
      />

      {/* Button to toggle the visibility of artifacts */}
      <Pressable
        onPress={() => {
          setShowArtifacts(current => !current); // Toggle show/hide artifacts
        }}>
        <Text style={styles.artifactTitle}>
          {artifacts.length} Artifacts Generated{' '}
          {artifacts.length > 0 ? (showArtifacts ? 'Hide' : 'Show') : ''}
        </Text>
      </Pressable>

      {/* Conditionally render artifacts list if showArtifacts is true */}
      {showArtifacts && (
        <FlatList
          horizontal
          data={artifacts}
          renderItem={({item}) => (
            <ArtifactsList item={item} buildID={route.params.buildID} />
          )}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainerArtifact}
          showsHorizontalScrollIndicator={false}
        />
      )}

      {/* List to show the filtered logs (tasks/jobs) */}
      <FlatList
        data={filteredLogs}
        renderItem={({item}) => (
          <TaskCard
            task={item}
            logs={logs}
            showFullLog={() => {
              setShowFullLogs(true); // Show full log modal
            }}
            setFullLog={(fullLog: string) => {
              setLogs(fullLog); // Set full log text to display in modal
            }}
          />
        )}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} /> // Add pull-to-refresh functionality
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No failed tasks found</Text> // Show this if no tasks are available
        }
      />

      {/* Full log modal to show detailed logs when clicked */}
      {showFullLogs && (
        <FullLogModal
          logs={logs} // Pass the full logs to the modal
          visible={showFullLogs} // Visibility state of the modal
          onClose={() => {
            setShowFullLogs(false); // Close the modal when "close" is pressed
          }}
        />
      )}
    </View>
  );
};

// Styles for the screen layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Set background color
  },
  listContainer: {
    padding: 16, // Add padding for list container
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainerArtifact: {
    paddingLeft: 20,
    paddingVertical: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
  },
  artifactTitle: {color: 'blue', fontSize: 20, textAlign: 'center'},
});

export default BuildMonitorScreen;
