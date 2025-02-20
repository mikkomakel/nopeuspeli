import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import GameScreen from './screens/GameScreen';
import HighScoreScreen from './screens/HighsScoreScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Game" component={GameScreen} />
        <Tab.Screen name="High Scores" component={HighScoreScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
