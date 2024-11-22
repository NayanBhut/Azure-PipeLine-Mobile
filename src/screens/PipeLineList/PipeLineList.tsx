import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage to handle local storage
import React, {useEffect, useState, useCallback} from 'react'; // React and hooks for component state and lifecycle
import {
  FlatList, // FlatList for rendering list of pipelines
  Pressable, // Pressable component for handling user interactions
  StyleSheet, // Styling for components
  Text, // Text component to display pipeline information
  View, // View component for container layout
} from 'react-native';
import ApiService from '../../APICall/APIService'; // API service to handle API calls
import {PipeLine, PipelineModel} from '../../APICall/APIModel/PipelineModel'; // Data models for pipeline information
import ListEmptyComponent from '../../Common/ListEmptyComponent'; // Empty list component for when no pipelines are available
import ListFooterComponent from '../../Common/ListFooterComponent'; // Footer component for loading indication during pagination
import API_CONFIG from '../../APICall/APIConstants'; // API endpoint configurations
import FullScreenLoader from '../../Common/FullScreenLoader'; // Full-screen loader component to show loading state

// Main functional component for displaying list of pipelines for a given app
function PipeLineList({route, navigation}): React.JSX.Element {
  // State variables for managing the list of pipelines and loading states
  const [pipelines, setPipelines] = useState<PipeLine[]>([]); // Stores list of pipeline objects
  const [isLoading, setIsLoading] = useState(false); // Loading state to show loading spinner when fetching data
  const [continuationToken, setContinuationToken] = useState<string | null>(
    null,
  ); // Continuation token for paginated API calls

  // Callback function to fetch pipelines for a specific project (appID)
  const callGetPipelineAPI = useCallback(
    async (projectID: string) => {
      // Retrieve stored token and organization info from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      const org = await AsyncStorage.getItem('org');

      if (!token || !org) {
        return; // Return early if token or org info is missing
      }

      setIsLoading(true); // Set loading state to true while fetching data
      const url = API_CONFIG.endpoints.pipelines.list(
        org,
        projectID,
        continuationToken,
      ); // Construct the API URL with continuation token
      const apiService = new ApiService(API_CONFIG.BASE_URL); // Create an instance of the API service

      // Make API call to get pipelines for the given project (appID)
      apiService
        .get(url, {
          'content-type': 'application/json',
          Authorization: token, // Add the authorization token to the request header
        })
        .then(response => {
          const continuationtoken = response.headers['x-ms-continuationtoken']; // Get continuation token from the response headers
          setContinuationToken(continuationtoken); // Save the continuation token for subsequent API calls
          const result: PipelineModel = JSON.parse(
            JSON.stringify(response.data),
          ); // Parse the API response data
          setPipelines(prevPipelines => [...prevPipelines, ...result.value]); // Add new pipelines to the existing list
          setIsLoading(false); // Set loading state to false once data is fetched
        })
        .catch(error => {
          console.error(error); // Log any error that occurs during the API call
          setIsLoading(false); // Set loading state to false on error
        });
    },
    [continuationToken], // Dependency array ensures the callback is recreated when continuationToken changes
  );

  // useEffect hook to fetch pipelines when the appID is passed in the route params
  useEffect(() => {
    if (route.params?.appID) {
      callGetPipelineAPI(route.params.appID); // Fetch pipelines for the given appID
    }
  }, [route.params.appID]); // This effect runs whenever appID changes in the route params

  // Function to handle loading more pipelines when the user scrolls to the bottom of the list
  const loadMorePipelines = () => {
    if (continuationToken) {
      callGetPipelineAPI(route.params.appID); // Call API again with continuation token to load more pipelines
    }
  };

  // Function to render each pipeline item in the FlatList
  const renderPipeline = ({item}: {item: PipeLine}) => (
    <Pressable
      onPress={() => {
        console.log(`Pressed ${item.name}`); // Log when a pipeline is pressed
        navigation.navigate('BuildList', {
          appID: route.params.appID, // Pass appID to the BuildList screen
          pipelineID: item.id, // Pass pipeline ID to navigate to build details
        });
      }}>
      <View style={styles.pipelineItem}>
        <Text style={styles.pipelineName}>Pipeline Name: {item.name}</Text>{' '}
        {/* Display pipeline name */}
        <Text style={styles.pipelineID}>Pipeline ID: {item.id}</Text>{' '}
        {/* Display pipeline ID */}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Show full-screen loader if data is still being loaded and there are no pipelines */}
      <FullScreenLoader
        isLoading={isLoading && pipelines.length === 0}
        backgroundColor={null}
      />

      {/* Show FlatList when not loading */}
      {!isLoading && (
        <FlatList
          data={pipelines} // Data to be displayed in the list
          renderItem={renderPipeline} // Render each pipeline item using the renderPipeline function
          keyExtractor={item => item.id.toString()} // Use pipeline ID as the unique key for each list item
          onEndReached={loadMorePipelines} // Trigger loading more data when the end of the list is reached
          onEndReachedThreshold={0.1} // Set threshold to trigger onEndReached when the user scrolls 90% of the way down
          ListFooterComponent={<ListFooterComponent isLoading={isLoading} />} // Show loading indicator at the bottom of the list when more items are being fetched
          ListEmptyComponent={<ListEmptyComponent isLoading={isLoading} />} // Show empty component if no pipelines are available
        />
      )}
    </View>
  );
}

// Styles for the components
const styles = StyleSheet.create({
  container: {
    flex: 1, // Make the container take full height of the screen
    backgroundColor: '#f9f9f9', // Set the background color for the container
    padding: 20, // Add padding around the container
  },
  pipelineItem: {
    padding: 15, // Add padding inside each pipeline item
    backgroundColor: '#fff', // White background for each pipeline item
    borderRadius: 8, // Rounded corners for the pipeline items
    marginBottom: 10, // Space between pipeline items
    shadowColor: '#000', // Shadow for iOS
    shadowOpacity: 0.1, // Slight shadow opacity for iOS
    shadowRadius: 4, // Shadow radius for iOS
    elevation: 3, // Shadow effect for Android
  },
  pipelineName: {
    fontSize: 18, // Set font size for the pipeline name
    fontWeight: '600', // Make the pipeline name bold
    marginBottom: 5, // Add space between the name and the ID
  },
  pipelineID: {
    fontSize: 14, // Set font size for the pipeline ID
    color: '#555', // Set text color to a gray tone
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center', // Center the empty state message horizontally
    justifyContent: 'center', // Center the empty state message vertically
    marginTop: 20, // Add margin from top
  },
  emptyText: {
    fontSize: 18, // Set font size for the empty state message
    color: '#888', // Set color for the empty state message
  },
});

export default PipeLineList;
