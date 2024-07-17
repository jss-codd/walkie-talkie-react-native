import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/main/HomeScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import RecordingListScreen from '../screens/main/RecordingListScreen';
import { navigationString } from '../utils/navigationString';
import ProfileScreen from '../screens/main/ProfileScreen';
import LinearGradient from 'react-native-linear-gradient';
import { Button, View, Animated, TouchableOpacity } from 'react-native';
import Microphone from '../assets/svgs/microphone.svg';
import { HP, VP } from '../utils/Responsive';
import ProfileDrawer from '../components/ProfileDrawer';
import { RNText } from '../components/RNText';
import { TextStyles } from '../utils/TextStyles';

function ModalScreen({ route, navigation }: { route: any, navigation: any }) {
    const { username, distance } = route.params;
    console.log(route.params, 'route.params')
    return (
        <LinearGradient
            colors={['#2D3436', '#000000']}
            start={{ x: 1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, justifyContent: "center", alignItems: "center", height: "100%", width: "100%", position: "absolute", bottom: 0 }}
        >
            <View style={{
                padding: 15,
                backgroundColor: '#E5E5E5',
                borderRadius: 100,
                borderWidth: 1,
                borderColor: '#E5E5E5'
            }}>
                <View style={{
                    backgroundColor: "#E0D0D0", marginBottom: 0, padding: HP(14),
                    borderRadius: HP(50)
                }}>
                    <Microphone width={64} height={64} />
                </View>
            </View>
            <View style={{ marginVertical: VP(30) }}>
                <RNText textStyle={{ ...TextStyles.SOFIA_SEMI_BOLD, fontSize: HP(22), color: "#FFF", textAlign: "center" }}>Caller: {username}</RNText>

                <RNText textStyle={{ ...TextStyles.SOFIA_SEMI_BOLD, fontSize: HP(22), color: "#FFF", marginVertical: VP(10), textAlign: "center" }}>Distance: {distance}</RNText>
            </View>
            {/* <Button onPress={() => navigation.goBack()} title="Dismiss" /> */}
        </LinearGradient>
    );
}

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

            <Stack.Group screenOptions={{ presentation: 'transparentModal' }}>
                <Stack.Screen name="MyModal" component={ModalScreen} />
                <Stack.Screen name="ProfileDrawer" component={ProfileDrawer} />
            </Stack.Group>
        </Stack.Navigator>
    );
};

export default MainTabNavigator;