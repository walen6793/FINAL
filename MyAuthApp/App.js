// App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import CarList from './screens/CarList';
import CarForm from './screens/CarForm';
import CarStats from './screens/CarStats';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CarList">
        <Stack.Screen name="CarList" component={CarList} options={{ title: 'Sports Cars' }} />
        <Stack.Screen name="CarForm" component={CarForm} options={{ title: 'Car Form' }} />
        <Stack.Screen name="CarStats" component={CarStats} options={{ title: 'Stats' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
