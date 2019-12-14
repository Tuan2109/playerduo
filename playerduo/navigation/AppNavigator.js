import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import UpdateUserScreen from '../screens/UpdateUserScreen';
import ImageScreen from '../screens/ImageScreen';
import HistoryScreen from '../screens/HistoryScreen';

export default createAppContainer(
  createSwitchNavigator({
    // Test: HistoryScreen,
    Login: LoginScreen,
    Register: RegisterScreen,
    App: MainTabNavigator,
    Update: UpdateUserScreen,
    Image: ImageScreen,
  })
);
