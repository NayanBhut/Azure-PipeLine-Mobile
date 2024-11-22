import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack'; // For typing navigation props
import {RouteProp} from '@react-navigation/native'; // For typing route props
import {ProjectModel, Project} from '../../APICall/APIModel/ProjectModel'; // Models for project data
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing/retrieving data locally
import ApiService, {ApiResponse} from '../../APICall/APIService'; // API service for making API calls
import CustomButton from '../../Common/CustomButton'; // Custom button component for UI
import ListFooterComponent from '../../Common/ListFooterComponent'; // Footer component for loading indicator
import ListEmptyComponent from '../../Common/ListEmptyComponent'; // Empty list component to display when no data
import API_CONFIG from '../../APICall/APIConstants'; // API configuration (base URL and endpoints)
import CustomTextInput from '../../Common/CustomTextInput';

// Define navigation types for type safety
type RootStackParamList = {
  AppList: {
    model: ApiResponse<ProjectModel>;
    orgName: string;
  };
};

type AppListProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AppList'>; // Type for navigation prop
  route: RouteProp<RootStackParamList, 'AppList'>; // Type for route prop
};

// Main functional component for AppList screen
const AppList = ({navigation, route}: AppListProps) => {
  // State variables for managing UI and API interaction
  const [isRefreshing, setIsRefreshing] = useState(false); // State for refresh control
  const [isLoading, setIsLoading] = useState(false); // State for managing loading status
  const [continuationToken, setContinuationToken] = useState<string | null>(
    null,
  ); // Continuation token for paginated API calls
  const [projectList, setProjectsList] = useState<Project[]>([]); // State for storing list of projects
  const [projectName, setProjectName] = useState(''); // Search Project Name
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]); // State for storing list of projects

  const flatListRef = useRef<FlatList<Project>>(null);

  // Function to fetch the list of apps (projects)
  const getApps = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // Get the saved token from AsyncStorage
      const org = await AsyncStorage.getItem('org'); // Get the saved organization name

      // Show error if either token or org is missing
      if (!token || !org) {
        Alert.alert('Error', 'Token or organization URL is missing.', [
          {text: 'OK', onPress: () => navigation.popToTop()}, // Navigate to the top screen if data is missing
        ]);
        return;
      }

      const url = API_CONFIG.endpoints.projects.list(org, continuationToken); // Build the API URL with continuation token
      const apiService = new ApiService(API_CONFIG.BASE_URL); // Initialize API service
      setIsLoading(true); // Set loading state to true while fetching data

      apiService
        .get<ProjectModel>(url, {
          'content-type': 'application/json',
          Authorization: token, // Pass token for authorization in the request header
        })
        .then(response => {
          const continuationtoken = response.headers['x-ms-continuationtoken']; // Retrieve continuation token for pagination
          setContinuationToken(continuationtoken); // Update the continuation token for subsequent API calls

          const buildListModel: ProjectModel = JSON.parse(
            JSON.stringify(response.data), // Parse response data (deep copy for safe manipulation)
          );
          setProjectsList(prevProjects => [
            ...prevProjects,
            ...buildListModel.value, // Append new projects to the existing list
          ]);
          setProjectName('');
          setTimeout(() => {
            filterProjectData('');
          }, 500);
          filterProjectData('');
          setIsLoading(false); // Set loading state to false once data is fetched
        })
        .catch(error => {
          console.error(error); // Log any errors
          setIsLoading(false); // Set loading state to false on error
        });
    } catch (error) {
      // Show alert if fetching data fails
      Alert.alert('Error', 'Failed to fetch data. Please try again.', [
        {text: 'OK'},
      ]);
    }
  };

  // Function to handle infinite scroll (load more projects when reaching the end of the list)
  const handleLoadMore = () => {
    if (isLoading || !continuationToken) {
      return; // Prevent fetching if already loading or no continuation token is available
    }
    getApps(); // Fetch more projects
  };

  // Function to handle pull-to-refresh functionality
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true); // Set refreshing state to true while refreshing data
    } finally {
      setIsRefreshing(false); // Set refreshing state to false after the operation
    }
  };

  // useEffect hook to initialize the project list from route params
  useEffect(() => {
    setProjectsList(route.params.model.data.value); // Initialize project list from passed params
    setProjectName(''); // Update search
    setFilteredProjects(route.params.model.data.value); // Initialize project list from passed params
    const continuationtoken =
      route.params.model.headers['x-ms-continuationtoken']; // Get continuation token from the response headers
    setContinuationToken(continuationtoken); // Set the continuation token
  }, [route.params]); // Run this effect when route params change

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.forceUpdate();
    }
  }, [filteredProjects]); // Run this effect when filtered projects change

  // useEffect hook to set navigation options for the screen
  useEffect(() => {
    navigation.setOptions({
      // Hide the back button on the header
      headerLeft: () => null,
      headerRight: () => (
        <CustomButton
          title="Logout"
          onPress={async () => {
            try {
              await AsyncStorage.clear(); // Clear all data from AsyncStorage (logout action)
              console.log('All keys have been removed from AsyncStorage');
            } catch (error) {
              console.error('Error clearing AsyncStorage:', error); // Log any errors while clearing AsyncStorage
            }
            navigation.goBack(); // Go back to the previous screen after logout
          }}
          textStyle={styles.logoutButtonTitle}
          btnViewStyle={styles.logoutBtnViewStyle}
          buttonContainer={styles.logoutButtonContainer}
        />
      ),
    });
  }, [navigation, route.params]); // Run this effect when navigation or route params change

  // Function to render individual project items in the FlatList
  const projectrenderItem = ({item}: {item: Project}) => (
    <View style={styles.projectItem}>
      <Pressable
        onPress={() => {
          navigation.navigate('PipeLineList', {
            appID: item.name, // Pass the project name to navigate to the PipeLineList screen
          });
        }}>
        <View style={styles.projectInfo}>
          <Text style={styles.label}>Project Name:</Text>
          <Text style={styles.value}>{item.name}</Text>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value}>{item.description}</Text>
        </View>
      </Pressable>
    </View>
  );

  function filterProjectData(searchText: string) {
    const filterProject = projectList.filter(project => {
      // Convert both project name and search string to lowercase for case-insensitive comparison
      return project.name.toLowerCase().includes(searchText.toLowerCase());
    });
    setFilteredProjects(filterProject); // Filter Project List
  }

  return (
    <View style={styles.container}>
      <CustomTextInput
        label="Search Project"
        value={projectName}
        onChangeText={value => {
          setProjectName(value);
          filterProjectData(value);
        }} // Update orgName state on change
        placeholder="Search project name"
        isRequired={false}
        customError="" // Error message for empty field
      />
      <FlatList<Project>
        data={filteredProjects} // List of projects to display
        renderItem={projectrenderItem} // Render each project item using the projectrenderItem function
        ref={flatListRef}
        keyExtractor={item => {
          return item.id; // Unique key for each item based on the project ID
        }}
        onEndReached={handleLoadMore} // Trigger loading more projects when the end is reached
        onEndReachedThreshold={0.1} // Trigger load more when 90% of the list is visible
        ListFooterComponent={<ListFooterComponent isLoading={isLoading} />} // Footer component for loading state
        ListEmptyComponent={<ListEmptyComponent isLoading={isLoading} />} // Empty component to show when no data is available
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} /> // Refresh control for pull-to-refresh
        }
      />
    </View>
  );
};

// StyleSheet for the component's layout and design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10, // Add padding around the main container
  },
  itemText: {
    fontSize: 16, // Text style for item
  },
  footerContainer: {
    padding: 16,
    alignItems: 'center', // Center-align footer content
  },
  footerText: {
    fontSize: 14,
    color: '#666', // Grey text color for footer
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center', // Center the empty state message
    alignItems: 'center', // Center the empty state message
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666', // Grey text color for empty state message
  },
  label: {
    fontSize: 17,
    fontWeight: '600', // Bold text for labels
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#666', // Grey text for values
    marginBottom: 4,
  },
  projectItem: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0', // Border color for items
  },
  projectInfo: {
    padding: 10,
    backgroundColor: 'white', // White background for each project item
    borderRadius: 8, // Rounded corners for the project item
    marginBottom: 8, // Bottom margin between items
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4, // Shadow effect for project item
    elevation: 5, // Elevation for Android shadow
  },
  logoutButtonTitle: {paddingHorizontal: 10}, // Padding for logout button title
  logoutBtnViewStyle: {height: 30, backgroundColor: 'black'}, // Style for logout button container
  logoutButtonContainer: {paddingHorizontal: 15, paddingVertical: 5}, // Padding for logout button container
});

export default AppList;
