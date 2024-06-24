import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useTheme } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { Header, getHeaderTitle } from '@react-navigation/elements';

import Home from '../assets/svgs/home.svg';
import Settings from '../assets/svgs/settings.svg';
import Clock from '../assets/svgs/clock-check.svg';
import Profile from '../assets/svgs/profile.svg';
import HomeScreen from '../screens/main/HomeScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import RecordingListScreen from '../screens/main/RecordingListScreen';
import { navigationString } from '../utils/navigationString';
import ProfileScreen from '../screens/main/ProfileScreen';
import { RNText } from '../components/RNText';
import { TextStyles } from '../utils/TextStyles';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const MainTabNavigator: React.FunctionComponent = () => {
    const Stack = createNativeStackNavigator<any>();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name={navigationString.HOME_SCREEN}
                component={HomeScreen}
            />
            <Stack.Screen
                name={navigationString.PROFILE_SCREEN}
                component={ProfileScreen}
            />
            <Stack.Screen
                name={navigationString.SETTING_SCREEN}
                component={SettingsScreen}
            />
            <Stack.Screen
                name={navigationString.LAST_TALK}
                component={RecordingListScreen}
            />
        </Stack.Navigator>
    );
};

export default MainTabNavigator;