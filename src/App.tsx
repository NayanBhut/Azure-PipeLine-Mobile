/**
 * Azure Pipeline mobile client.
 *
 * Navigation uses the native stack navigator, which relies on
 * react-native-screens directly. This removes the need for the JS-based stack,
 * gesture-handler and reanimated while giving each screen native transitions.
 *
 * @format
 */

import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import LoginForm from './screens/LoginForm/LoginForm';
import AppList from './screens/AppsList/AppList';
import BuildList from './screens/BuildList/BuildList';
import PipeLineList from './screens/PipeLineList/PipeLineList';
import BuildMonitorScreen from './screens/BuildMonitorScreen/BuildMonitorScreen';
import type {RootStackParamList} from './navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <NavigationStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function NavigationStack(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: 'white',
        headerStyle: {backgroundColor: 'tomato'},
      }}>
      <Stack.Screen
        name="Login Form"
        component={LoginForm}
        options={{title: 'Sign in'}}
      />
      <Stack.Screen name="Apps List" component={AppList} />
      <Stack.Screen name="PipeLineList" component={PipeLineList} />
      <Stack.Screen name="BuildList" component={BuildList} />
      <Stack.Screen
        name="BuildMonitorScreen"
        component={BuildMonitorScreen}
      />
    </Stack.Navigator>
  );
}

export default App;
