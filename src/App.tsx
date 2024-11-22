/**
 * Sample React Native App
 * This is a simple React Native application demonstrating basic navigation
 * using `react-navigation` with a stack navigator.
 *
 * @format
 */

import React from 'react';

// Import necessary modules from react-navigation
import {NavigationContainer} from '@react-navigation/native'; // Container for navigation
import {createStackNavigator} from '@react-navigation/stack'; // Stack navigator for screen transitions

// Import screen components
import LoginForm from './screens/LoginForm/LoginForm'; // Login screen
import AppList from './screens/AppsList/AppList'; // App list screen
import BuildList from './screens/BuildList/BuildList'; // Build list screen
import PipeLineList from './screens/PipeLineList/PipeLineList'; // Pipeline list screen
import BuildMonitorScreen from './screens/BuildMonitorScreen/BuildMonitorScreen'; // Build monitor screen

/**
 * Main App component
 * Wraps the NavigationContainer and calls the NavigationStack component
 * to set up the entire navigation flow of the app.
 */
function App(): React.JSX.Element {
  return (
    // The NavigationContainer is a wrapper that manages the navigation state of the app.
    <NavigationContainer>
      <NavigationStack />{' '}
      {/* Calls the NavigationStack function to define stack screens */}
    </NavigationContainer>
  );
}

/**
 * NavigationStack component
 * Defines the stack navigator with all the screens in the app.
 * Each screen is configured with a name, component, and options for customization.
 */
function NavigationStack(): React.JSX.Element {
  return (
    // Stack.Navigator is used to manage the stack of screens and handle navigation between them
    <Stack.Navigator>
      {/* Screen for Login Form */}
      <Stack.Screen
        name="Login Form" // The name of the screen (used for navigation)
        component={LoginForm} // The component rendered for this screen
        options={{
          headerTintColor: 'white', // Change the header text color
          headerStyle: {backgroundColor: 'tomato'}, // Change the header background color
        }}
      />

      {/* Screen for Apps List */}
      <Stack.Screen
        name="Apps List" // The name of the screen (used for navigation)
        component={AppList} // The component rendered for this screen
        options={{
          headerTintColor: 'white', // Change the header text color
          headerStyle: {backgroundColor: 'tomato'}, // Change the header background color
        }}
      />

      {/* Screen for Pipeline List */}
      <Stack.Screen
        name="PipeLineList" // The name of the screen (used for navigation)
        component={PipeLineList} // The component rendered for this screen
      />

      {/* Screen for Build List */}
      <Stack.Screen
        name="BuildList" // The name of the screen (used for navigation)
        component={BuildList} // The component rendered for this screen
        options={{
          headerTintColor: 'white', // Change the header text color
          headerStyle: {backgroundColor: 'tomato'}, // Change the header background color
        }}
      />

      {/* Screen for Build Monitor */}
      <Stack.Screen
        name="BuildMonitorScreen" // The name of the screen (used for navigation)
        component={BuildMonitorScreen} // The component rendered for this screen
        options={{
          headerTintColor: 'white', // Change the header text color
          headerStyle: {backgroundColor: 'tomato'}, // Change the header background color
        }}
      />
    </Stack.Navigator>
  );
}

// Create the stack navigator instance
const Stack = createStackNavigator();

// Export the main App component to be rendered in index.js or App entry file
export default App;
