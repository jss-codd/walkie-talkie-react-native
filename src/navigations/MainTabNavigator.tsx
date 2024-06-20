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

export type StackParamList = {
    HomeScreen: undefined;
    SettingScreen: undefined;
    LastTalk: undefined;
    ProfileScreen: undefined;
};

const Tab = createBottomTabNavigator<StackParamList>();

function LogoTitle(props: any) {
    return (
        <View style={{ display: "flex" }}>
            <Image
                style={{ width: 100, height: 100, }}
                // source={require('../assets/icons/logo.png')}
                source={require('../assets/images/logo.png')}
            />
            {/* <Image
                style={{ width: 150, height: 130 }}
                // source={require('../assets/icons/logo.png')}
                source={require('../assets/images/logo.png')}
            /> */}
        </View>
    );
}

function MyTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                header: ({ options, route }) => (
                    <Header headerTitle={(props) => <LogoTitle {...props} />} headerTitleAlign="center" {...options} title={getHeaderTitle(options, route.name)} />
                ),
                tabBarIcon: ({ focused, color, size }) => {
                    if (route.name === navigationString.HOME_SCREEN) {
                        return <Home height={32} width={32} />;
                    } else if (route.name === navigationString.SETTING_SCREEN) {
                        return <Settings height={32} width={32} />;
                    } else if (route.name === navigationString.PROFILE_SCREEN) {
                        return <Profile height={30} width={30} />;
                    } else {
                        return <Clock height={32} width={32} />;
                    }

                },
                tabBarActiveTintColor: 'orange',
                tabBarInactiveTintColor: 'gray',
                tabBarLabelStyle: { fontSize: 12, fontWeight: 600 },
                headerStyle: {
                    height: 100,
                },
            })}
        >
            <Tab.Screen options={{ title: "Home" }} name={navigationString.HOME_SCREEN} component={HomeScreen} />
            <Tab.Screen options={{ title: "Settings" }} name={navigationString.SETTING_SCREEN} component={SettingsScreen} />
            <Tab.Screen options={{ title: "Last Talks" }} name={navigationString.LAST_TALK} component={RecordingListScreen} />
            <Tab.Screen options={{ title: "Profile" }} name={navigationString.PROFILE_SCREEN} component={ProfileScreen} />
        </Tab.Navigator>
    );
}

const MainTabNavigator: React.FunctionComponent = () => {
    const theme = useTheme();
    return (
        <MyTabs />
    );
};

export default MainTabNavigator;