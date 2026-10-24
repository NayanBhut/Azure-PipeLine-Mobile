import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import CustomTextInput from '../../Common/CustomTextInput'; // Custom text input field component
import AsyncStorage from '@react-native-async-storage/async-storage'; // Only non-sensitive data is stored here
import ApiService, {ApiError, ApiResponse} from '../../APICall/APIService'; // API service to handle API requests
import CustomButton from '../../Common/CustomButton'; // Custom button component
import API_CONFIG from '../../APICall/APIConstants'; // API endpoint configuration
import FullScreenLoader from '../../Common/FullScreenLoader'; // Loader component to show loading screen
import {ProjectModel} from '../../APICall/APIModel/ProjectModel';
import {
  clearPersonalAccessToken,
  getAuthorizationHeader,
  savePersonalAccessToken,
} from '../../Common/SecureStorage';
import {
  normalizeOrganizationName,
  normalizePersonalAccessToken,
  validateOrganizationName,
  validatePersonalAccessToken,
} from '../../Common/Validation';
import {convertToBasicToken} from './BasicToken'; // Import the function
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';

const ORG_STORAGE_KEY = 'org';
const USERNAME_STORAGE_KEY = 'username';

type LoginFormProps = NativeStackScreenProps<RootStackParamList, 'Login Form'>;

function LoginForm({navigation}: LoginFormProps): React.JSX.Element {
  // State hooks for user input
  const [orgName, setOrgName] = useState(''); // Default organization name
  const [userName, setUserName] = useState(''); // Default username
  const [password, setPassword] = useState(''); // Personal access token
  const [isLoading, setIsLoading] = useState(false); // Loading state to show or hide loader

  // useEffect hook to check if a saved session exists when the component mounts
  useEffect(() => {
    checkSavedToken(); // Check for saved token and organization on mount
    // Runs once on mount; the helper only reads local/secure storage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear any token still held in component state when the screen is
  // re-focused (for example after logging out on the app list).
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setPassword('');
    });

    return unsubscribe;
  }, [navigation]);

  // Removes credentials written by older app versions, which stored the
  // Authorization header and `username:token` in plain-text AsyncStorage.
  const removeLegacyPlaintextCredentials = async () => {
    try {
      await AsyncStorage.removeMany(['token', 'uid']);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to remove legacy credentials', error);
      }
    }
  };

  // Function to check if a token and organization are saved in secure storage
  const checkSavedToken = async () => {
    await removeLegacyPlaintextCredentials();

    const savedToken = await getAuthorizationHeader(); // Read token from Keychain/Keystore
    const savedOrg = await AsyncStorage.getItem(ORG_STORAGE_KEY); // Non-sensitive setting

    // If either token or org is not found, return early
    if (!savedToken || !savedOrg) {
      return;
    }

    setOrgName(savedOrg);
    setUserName((await AsyncStorage.getItem(USERNAME_STORAGE_KEY)) ?? '');
    getAppList(savedToken, savedOrg); // Fetch the app list
  };

  // Function to fetch the app list from the API
  const getAppList = async (
    authHeader: string,
    org: string,
    tokenToPersist: string | null = null,
    usernameToPersist: string = userName,
  ) => {
    setIsLoading(true); // Show loader while fetching app list
    getApps(authHeader, org) // Fetch apps from the API
      .then(async (model: ApiResponse<ProjectModel>) => {
        // Save only after the token has been proven valid by the API.
        try {
          if (tokenToPersist) {
            await savePersonalAccessToken(tokenToPersist);
            await AsyncStorage.setItem(ORG_STORAGE_KEY, org);
            await AsyncStorage.setItem(
              USERNAME_STORAGE_KEY,
              usernameToPersist,
            );
            setPassword(''); // Do not keep the token in component state
          }
        } catch (error) {
          if (__DEV__) {
            console.error('Failed to save session', error);
          }
        }

        setIsLoading(false);
        navigation.navigate('Apps List', {
          orgName: org, // Pass organization name
          model: model, // Pass the fetched model (app list)
        });
      })
      .catch(async error => {
        setIsLoading(false); // Hide loader on error

        // A rejected token should not be kept around. The user is asked to
        // sign in again, and the next launch will not retry the stale token.
        if ((error as ApiError)?.isUnauthorized) {
          await clearPersonalAccessToken();
        }

        Alert.alert(
          'Login failed',
          (error as Error)?.message ??
            'Could not connect to Azure DevOps. Check the organization name and token.',
        );
      });
  };

  // Validates the form and starts the login flow.
  const handleLogin = async () => {
    const org = normalizeOrganizationName(orgName);
    const orgError = validateOrganizationName(org);
    if (orgError) {
      Alert.alert('Invalid organization', orgError);
      return;
    }

    const token = normalizePersonalAccessToken(password);
    const tokenError = validatePersonalAccessToken(token);
    if (tokenError) {
      Alert.alert('Invalid token', tokenError);
      return;
    }

    let authHeader: string;
    try {
      authHeader = convertToBasicToken(userName.trim(), token);
    } catch (error) {
      Alert.alert('Invalid token', (error as Error).message);
      return;
    }

    setIsLoading(true);
    await getAppList(authHeader, org, token, userName.trim());
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
            autoCapitalize="none"
            autoCorrect={false}
          />
          <CustomTextInput
            label="Username (optional)"
            value={userName}
            onChangeText={setUserName} // Update userName state on change
            placeholder="Any username (optional)"
            isRequired={false}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <CustomTextInput
            label="Personal Token"
            value={password}
            onChangeText={setPassword} // Update password state on change
            placeholder="Enter personal access token"
            customError="This field is required" // Error message for empty field
            secureTextEntry={true}
            autoComplete="off"
            textContentType="none"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Custom button to authenticate and open the app list */}
          <CustomButton
            title="Sign in"
            onPress={handleLogin}
            textStyle={styles.buttonTitle}
            btnViewStyle={styles.btnViewStyle}
            buttonContainer={styles.buttonContainer}
          />
        </View>
      )}
    </View>
  );

  // Function to fetch the app list from the API
  function getApps(
    authHeader: string,
    org: string,
  ): Promise<ApiResponse<ProjectModel>> {
    const url = API_CONFIG.endpoints.projects.list(org, null); // Build URL for the API request
    const apiService = new ApiService(API_CONFIG.BASE_URL); // Instantiate API service

    return apiService.get<ProjectModel>(url, {
      'content-type': 'application/json',
      Authorization: authHeader, // Use token for authorization
    });
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
