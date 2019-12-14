import React, { Component } from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator, createAppContainer } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import UserScreen from '../screens/UserScreen';
import NewFeedScreen from '../screens/NewFeedScreen';
import PlayerScreen from '../screens/PlayerScreen';
import RentScreen from '../screens/RentScreen';
import ImageScreen from '../screens/ImageScreen';
import UpdateUserScreen from '../screens/UpdateUserScreen';
import UpgradePlayerScreen from '../screens/UpgradePlayerScreen';
import HistoryScreen from '../screens/HistoryScreen';

const config = Platform.select({
  web: { headerMode: 'screen' },
  default: {},
});

const UserStack = createStackNavigator(
  {
    Home: UserScreen,
    Update: UpdateUserScreen,
    UpdateImage: ImageScreen,
    Upgrade: UpgradePlayerScreen,
    History: HistoryScreen
  },
  config
);

UserStack.navigationOptions = {
  tabBarLabel: 'Thông tin người chơi',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

UserStack.path = '';

const HomeStack = createStackNavigator(
  {
    Home: NewFeedScreen,
    Details: PlayerScreen,
    Rent: RentScreen,
  },
  config
);

HomeStack.navigationOptions = {
  tabBarLabel: 'Tìm player',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

HomeStack.path = '';

const tabNavigator = createBottomTabNavigator({
  UserStack,
  HomeStack,
});

tabNavigator.path = '';

export default tabNavigator;