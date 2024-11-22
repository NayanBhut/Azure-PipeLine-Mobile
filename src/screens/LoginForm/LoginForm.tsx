import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import CustomTextInput from '../../Common/CustomTextInput'; // Custom text input field component
import AsyncStorage from '@react-native-async-storage/async-storage'; // To handle saving data locally
import ApiService from '../../APICall/APIService'; // API service to handle API requests
import CustomButton from '../../Common/CustomButton'; // Custom button component
import API_CONFIG from '../../APICall/APIConstants'; // API endpoint configuration
import FullScreenLoader from '../../Common/FullScreenLoader'; // Loader component to show loading screen
import { convertToBasicToken } from './BasicToken'; // Import the function

// Interface for LoginForm props
interface LoginFormProps {
  navigate: (route: string, {}) => void; // Function to navigate to a specific route
  goBack: () => void; // Function to go back to the previous screen
}

function LoginForm({
  navigation,
}: {
  navigation: LoginFormProps; // Destructuring the navigation prop to be used for navigation
}): React.JSX.Element {
  // State hooks for user input
  const [orgName, setOrgName] = useState(''); // Default organization name
  const [userName, setUserName] = useState(''); // Default username
  const [password, setPassword] = useState(
    // Default token (password) valuels
    '',
  );
  const [isLoading, setIsLoading] = useState(false); // Loading state to show or hide loader
  var token = ''; // Token variable for API authorization

  // useEffect hook to check if a saved token exists when the component mounts
  useEffect(() => {
    checkSavedToken(); // Check for saved token and organization on mount
  }, []);

  // Function to check if a token and organization are saved in AsyncStorage
  const checkSavedToken = async () => {
    const savedToken = await AsyncStorage.getItem('token'); // Retrieve saved token
    const savedOrg = await AsyncStorage.getItem('org'); // Retrieve saved organization

    // If either token or org is not found, return early
    if (!savedToken || !savedOrg) {
      return;
    }

    // If both token and org are found, set token and organization state
    token = savedToken; // Set token
    setOrgName(savedOrg); // Set organization name
    getAppList(savedToken, savedOrg); // Fetch the app list
  };

  // Function to fetch the app list from the API
  const getAppList = async (savedToken: string, org: string) => {
    setIsLoading(true); // Show loader while fetching app list
    getApps(savedToken, org) // Fetch apps from the API
      .then(async model => {
        setIsLoading(false); // Hide loader once response is received
        try {
          // Try fetching saved token and navigate to 'Apps List' screen
          navigation.navigate('Apps List', {
            orgName: orgName, // Pass organization name
            model: model, // Pass the fetched model (app list)
          });
        } catch (error) {
          // Error handling if something goes wrong
        }
      })
      .catch(error => {
        setIsLoading(false); // Hide loader on error
        console.log('Error response is ', error); // Log error
      });
  };

  return (
    <View>
      {/* Show loading screen while isLoading is true */}
      {isLoading && (
        <FullScreenLoader isLoading={isLoading} backgroundColor={null} />
      )}

      {/* Only render form if not loading */}
      {!isLoading && (
        <View style={styles.viewTextField}>
          {/* Custom input fields for organization name, username, and token */}
          <CustomTextInput
            label="Organization Name"
            value={orgName}
            onChangeText={setOrgName} // Update orgName state on change
            placeholder="Enter organization name"
            customError="This field is required" // Error message for empty field
          />
          <CustomTextInput
            label="Username"
            value={userName}
            onChangeText={setUserName} // Update userName state on change
            placeholder="Enter user name"
            customError="This field is required" // Error message for empty field
          />
          <CustomTextInput
            label="Personal Token"
            value={password}
            onChangeText={setPassword} // Update password state on change
            placeholder="Enter Token"
            customError="This field is required" // Error message for empty field
          />

          {/* Custom button to navigate to App List */}
          <CustomButton
            title="Navigate to App List"
            onPress={() => {
              try {
                token = getToken(); // Get the Basic Auth token
                getAppList(token, orgName); // Fetch app list and navigate
              } catch (error) {
                console.log('Error is : ', error); // Handle errors in fetching token or app list
              }
            }}
            textStyle={styles.buttonTitle}
            btnViewStyle={styles.btnViewStyle}
            buttonContainer={styles.buttonContainer}
          />
        </View>
      )}
    </View>
  );

  // Function to fetch the app list from the API
  function getApps(savedToken:string, org: string) {
    return new Promise((resolve, reject) => {
      const url = API_CONFIG.endpoints.projects.list(org, null); // Build URL for the API request
      const apiService = new ApiService(API_CONFIG.BASE_URL); // Instantiate API service

      apiService
        .get(url, {
          'content-type': 'application/json',
          Authorization: savedToken, // Use token for authorization
        })
        .then(response => {
          // Function to store user credentials and token in AsyncStorage
          const storeData = async () => {
            try {
              await AsyncStorage.setItem('uid', `${userName}:${password}`); // Save username and password
              await AsyncStorage.setItem('token', savedToken); // Save token
              await AsyncStorage.setItem('org', org); // Save organization name
              console.log('Token Saved');
            } catch (e) {
              // Error saving data
              console.log('Saving error ', e);
            }
          };

          storeData(); // Store credentials
          resolve(response); // Resolve the promise with API response
        })
        .catch(error => {
          console.error(error); // Log any errors
          reject(error); // Reject the promise on error
        });
    });
  }

  // Function to generate Basic Auth token from username and password
  function getToken(): string {
    try {
      const basicToken = convertToBasicToken(userName, password); // Convert to Basic Auth token
      return basicToken; // Return generated token
    } catch (error) {
      console.error('Error:', error); // Handle errors in generating token
      throw error; // Throw error if token generation fails
    }
  }
}

// Styles for the login form and button components
const styles = StyleSheet.create({
  viewTextField: {
    paddingHorizontal: 8,
  },
  buttonTitle: {paddingHorizontal: 20},
  btnViewStyle: {height: 40, backgroundColor: 'black'},
  buttonContainer: {paddingHorizontal: 40, paddingVertical: 10},
});

export default LoginForm;
