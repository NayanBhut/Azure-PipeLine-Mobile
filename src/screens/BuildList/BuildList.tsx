import React, {useState, useEffect} from 'react'; // Import React and necessary hooks
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Button,
  SafeAreaView,
  RefreshControl,
} from 'react-native'; // Import necessary components from React Native
import AsyncStorage from '@react-native-async-storage/async-storage'; // To store and retrieve data locally
import ApiService from '../../APICall/APIService'; // API service for making API calls
import {Build, BuildListModel} from '../../APICall/APIModel/BuildListModel'; // Types for Build and Build List models
import ListEmptyComponent from '../../Common/ListEmptyComponent'; // A component to display when no builds are available
import ListFooterComponent from '../../Common/ListFooterComponent'; // Footer component to show loading spinner for pagination
import BuildTriggerModal from '../BuildTriggrModal/BuildTriggerModal'; // Modal component to trigger a new build
import API_CONFIG from '../../APICall/APIConstants'; // API configuration constants
import FullScreenLoader from '../../Common/FullScreenLoader'; // Full-screen loader component to indicate loading state

// Main functional component for the Build List screen
const BuildList = ({route, navigation}) => {
  // State variables to manage builds list, loading, modal visibility, and pagination
  const [builds, setBuilds] = useState<Build[]>([]); // Stores list of builds
  const [isLoading, setIsLoading] = useState(false); // Controls loading state
  const [continuationToken, setContinuationToken] = useState<string | null>(
    null,
  ); // Token to handle paginated API responses
  const [isModalVisible, setModalVisible] = useState<boolean>(false); // Controls the visibility of the build trigger modal
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false); // Controls the refresh state
  const [isReload, setIsReloadList] = useState<boolean>(false); // Controls whether to reload the build list from scratch

  // Fetch builds from the Azure DevOps API
  const fetchBuilds = async (projectID: string, definitions: number) => {
    const token = await AsyncStorage.getItem('token'); // Retrieve auth token from AsyncStorage
    const org = await AsyncStorage.getItem('org'); // Retrieve organization from AsyncStorage

    if (!token || !org) {
      return; // If token or org info is missing, stop the API request
    }

    setIsLoading(true); // Set loading state to true while fetching data
    const url = API_CONFIG.endpoints.builds.list(
      org,
      projectID,
      definitions,
      isReload ? null : continuationToken,
    ); // API URL for fetching builds
    const apiService = new ApiService(API_CONFIG.BASE_URL); // Initialize the API service

    apiService
      .get(url, {
        'content-type': 'application/json',
        Authorization: token, // Pass token in request headers for authorization
      })
      .then(response => {
        const continuationtoken = response.headers['x-ms-continuationtoken']; // Get continuation token for pagination
        setContinuationToken(continuationtoken); // Update continuation token for future requests
        const buildListModel: BuildListModel = JSON.parse(
          JSON.stringify(response.data),
        ); // Parse the response data
        setIsLoading(false); // Set loading state to false after data is fetched
        setIsReloadList(false); // Reset reload flag after fetching data
        // If `isReload` is true, overwrite existing builds with the new list, else append new builds to the current list
        if (isReload) {
          setBuilds(buildListModel.value);
        } else {
          setBuilds(prevBuilds => [...prevBuilds, ...buildListModel.value]);
        }
      })
      .catch(error => {
        console.error(error); // Log any error encountered during the API call
        setIsLoading(false); // Set loading state to false if an error occurs
      });
  };

  // Set up the navigation header button to trigger a new build
  useEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <Button
          onPress={() => {
            setModalVisible(true); // Show the modal to trigger a build when the button is pressed
          }}
          title="Trigger Build" // Button title
        />
      ),
    });
  }, [builds]); // Only re-run this effect when `builds` changes

  // Fetch builds when the component mounts or when route parameters change
  useEffect(() => {
    fetchBuilds(route.params.appID, route.params.pipelineID);
  }, [route.params]); // Re-run this effect whenever `appID` or `pipelineID` in route changes

  // Fetch builds when `isReload` state is set to true (manual refresh)
  useEffect(() => {
    if (isReload) {
      fetchBuilds(route.params.appID, route.params.pipelineID);
    }
  }, [isReload]);

  // Function to get appropriate styles for build result based on its status
  const getResultStyle = (result: string) => {
    switch (result) {
      case 'canceled':
        return styles.canceled; // Canceled builds
      case 'failed':
        return styles.failed; // Failed builds
      case 'none':
        return styles.none; // Builds with no result
      case 'partiallySucceeded':
        return styles.partiallySucceeded; // Partially successful builds
      case 'succeeded':
        return styles.succeeded; // Succeeded builds
      default:
        return styles.default; // Default style for undefined statuses
    }
  };

  // Function to render individual build items in the FlatList
  const renderBuildItem = ({item}: {item: Build}) => (
    <Pressable
      onPress={() => {
        // Navigate to the Build Monitor screen with relevant details when a build is pressed
        navigation.navigate('BuildMonitorScreen', {
          appID: route.params.appID,
          buildID: item.id,
          projectID: route.params.pipelineID,
        });
      }}>
      <View style={styles.buildItem}>
        <View style={styles.buildData}>
          <Text style={styles.buildName}>Build ID: {item.id}</Text>
          {item.status === 'completed' && (
            <Text style={[styles.buildstatus, getResultStyle(item.result)]}>
              {item.result}
            </Text>
          )}
        </View>
        <Text>Branch: {item.sourceBranch.toString()}</Text>
        <Text>Build Status: {item.status.toString()}</Text>
        <Text>Requested For: {item.requestedFor?.displayName.toString()}</Text>
        <Text>Queue Time: {new Date(item.queueTime).toLocaleString()}</Text>
        <Text>Pipeline Name: {item.definition.name.toString()}</Text>
      </View>
    </Pressable>
  );

  // Function to handle loading more builds when the end of the list is reached
  const handleLoadMore = async () => {
    if (isLoading || !continuationToken) {
      return; // Prevent loading more if already loading or there's no continuation token
    }
    await fetchBuilds(route.params.appID, route.params.pipelineID); // Fetch additional builds using the continuation token
  };

  // Handle the pull-to-refresh action
  const handleRefresh = async () => {
    try {
      setIsReloadList(true); // Set `isReloadList` to true to reload the build list
    } finally {
      setIsRefreshing(false); // Set refreshing state to false after the refresh operation is complete
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Full-screen loader that appears when data is being fetched */}
      <FullScreenLoader
        isLoading={isLoading && builds.length === 0}
        backgroundColor={null}
      />

      {/* FlatList component to display builds */}
      <FlatList<Build>
        showsVerticalScrollIndicator={false} // Hide the vertical scroll indicator
        data={builds} // Provide the list of builds to display
        renderItem={renderBuildItem} // Render each build item using the `renderBuildItem` function
        keyExtractor={(item: Build) => `${item.id}-${item.buildNumber}`} // Unique key for each item based on build ID and number
        onEndReached={handleLoadMore} // Trigger loading more builds when the end is reached
        onEndReachedThreshold={0.1} // Trigger the `onEndReached` when the user has scrolled 90% down
        ListFooterComponent={<ListFooterComponent isLoading={isLoading} />} // Footer component to show loading spinner during pagination
        ListEmptyComponent={<ListEmptyComponent isLoading={isLoading} />} // Show a "no data" component if the list is empty
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} /> // Allow pull-to-refresh functionality
        }
      />

      {/* Build trigger modal */}
      {isModalVisible && (
        <BuildTriggerModal
          visible={isModalVisible} // Pass modal visibility status
          projectID={route.params.appID} // Pass appID to the modal
          pipeLineID={route.params.pipelineID} // Pass pipelineID to the modal
          cancel={(isReloadList: boolean | null) => {
            if (isReloadList) {
              setIsReloadList(true); // Trigger reload if specified
            }
            setModalVisible(false); // Close the modal
          }}
          wrongAuth={() => {
            setModalVisible(false); // Close the modal if auth fails
            setTimeout(() => {
              navigation.popToTop(); // Navigate to the top screen after a delay
            }, 500);
          }}
        />
      )}
    </SafeAreaView>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Background color for the container
    padding: 16, // Padding for the container
  },
  buildItem: {
    padding: 15,
    backgroundColor: '#ffffff', // White background for each build item
    borderRadius: 8, // Rounded corners
    marginBottom: 10, // Space between build items
    shadowColor: '#000', // Shadow color for the card
    shadowOpacity: 0.1, // Light shadow opacity
    shadowRadius: 4, // Shadow radius for soft shadows
    elevation: 2, // Elevation for Android shadow
  },
  buildName: {
    fontSize: 16,
    fontWeight: 'bold', // Bold text for build ID
    flexGrow: 1,
  },
  buildData: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  buildstatus: {
    padding: 5,
    borderRadius: 4,
    color: 'white',
    textTransform: 'capitalize',
  },
  canceled: {
    backgroundColor: '#9E9E9E', // Gray for canceled builds
  },
  failed: {
    backgroundColor: '#D32F2F', // Red for failed builds
  },
  none: {
    backgroundColor: '#BDBDBD', // Light gray for no result
  },
  partiallySucceeded: {
    backgroundColor: '#FFA500', // Orange for partially succeeded builds
  },
  succeeded: {
    backgroundColor: '#4CAF50', // Green for successful builds
  },
  default: {
    backgroundColor: '#E0E0E0', // Default gray for undefined status
  },
});

export default BuildList;
