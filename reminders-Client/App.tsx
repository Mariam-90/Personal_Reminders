import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Index from './app/(tabs)/index';
import Login from './app/(tabs)/Login';
import Signup from './app/(tabs)/Signup';

const Stack = createStackNavigator();

export default function App() {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={Login} options={{ title: 'Login' }} />
          <Stack.Screen name="Signup" component={Signup} options={{ title: 'Sign Up' }} />
          <Stack.Screen name="Index" component={Index} options={{ title: 'Reminders' }} />
        </Stack.Navigator>
      </NavigationContainer>
    );
}
