import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { navigationString } from '../utils/navigationString';
import AuthStackNavigator from './AuthStackNavigator';
import MainTabNavigator from './MainTabNavigator';
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
            {/*
            <Stack.Screen
                name={navigationString.MAIN_TAB_NAVIGATOR}
                component={MainTabNavigator}
            />
            <Stack.Screen
                name={navigationString.TRANSACT_LOADING_SCREEN}
                component={TransactLoadingScreen as React.FunctionComponent}
            />
            <Stack.Screen
                name={navigationString.SEARCH_SCREEN}
                component={SearchScreen as React.FunctionComponent}
            />
            <Stack.Screen
                name={navigationString.SEARCH_CONFIRM_SCREEN}
                component={SearchConfirmScreen as React.FunctionComponent}
            />

            <Stack.Screen
                name={navigationString.REQUEST_CARD_SCREEN}
                component={RequestCardScreen as React.FunctionComponent}
            />
            <Stack.Screen
                name={navigationString.CATEGORY_SCREEN}
                component={CategoryScreen as React.FunctionComponent}
            /> */}
        </Stack.Navigator>
    );
};

export default MainStackNavigator;
