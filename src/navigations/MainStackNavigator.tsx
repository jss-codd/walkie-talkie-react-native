import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { navigationString } from '../utils/navigationString';
import AuthStackNavigator from './AuthStackNavigator';
import MainTabNavigator from './MainTabNavigator';

export type MainStackParamList = {
    AuthStackNavigator: undefined;
    MainTabNavigator: undefined;
    OnBoardScreen: undefined;
    ProfileScreen: undefined;
    SettingScreen: undefined;
};

const MainStackNavigator: React.FunctionComponent = () => {
    const Stack = createNativeStackNavigator<MainStackParamList>();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
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
