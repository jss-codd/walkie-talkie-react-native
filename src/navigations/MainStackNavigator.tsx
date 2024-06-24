import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { navigationString } from '../utils/navigationString';
import AuthStackNavigator from './AuthStackNavigator';
import MainTabNavigator from './MainTabNavigator';
import ProfileScreen from '../screens/main/ProfileScreen';
import HomeScreen from '../screens/main/HomeScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
// import AuthStackNavigator from './AuthStackNavigator';
// import MainTabNavigator from './MainTabNavigator';
// import SearchScreen from '../screens/search/SearchScreen';
// import RequestCardScreen from '../screens/requestCard/RequestCardScreen';
// import SearchConfirmScreen from '../screens/searchConfirm/SearchConfirmScreen';
// import TransactLoadingScreen from '../screens/TransactLoading/TransactLoadingScreen';
// import {navigationString} from '../constants/navigationString';
// import CategoryScreen from '../screens/category/CategoryScreen';

export type MainStackParamList = {
    AuthStackNavigator: undefined;
    MainTabNavigator: undefined;
    OnBoardScreen: undefined;
    ProfileScreen: undefined;
    // HomeScreen: undefined;
    SettingScreen: undefined;
};

const MainStackNavigator: React.FunctionComponent = () => {
    const Stack = createNativeStackNavigator<MainStackParamList>();
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen
                name={navigationString.AUTH_STACK_NAVIGATOR}
                component={AuthStackNavigator}
            />
            <Stack.Screen
                name={navigationString.MAIN_TAB_NAVIGATOR}
                component={MainTabNavigator}
            />
        </Stack.Navigator>
    );
};

export default MainStackNavigator;
