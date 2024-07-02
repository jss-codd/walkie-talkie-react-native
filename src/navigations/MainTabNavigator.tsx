import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/main/HomeScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import RecordingListScreen from '../screens/main/RecordingListScreen';
import { navigationString } from '../utils/navigationString';
import ProfileScreen from '../screens/main/ProfileScreen';

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