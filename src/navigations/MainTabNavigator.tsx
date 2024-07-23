import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Animated, Easing } from 'react-native';

import HomeScreen from '../screens/main/HomeScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import RecordingListScreen from '../screens/main/RecordingListScreen';
import { navigationString } from '../utils/navigationString';
import ProfileScreen from '../screens/main/ProfileScreen';
import ProfileDrawer from '../components/ProfileDrawer';
import CallerScreen from '../screens/calls/CallerScreen';
import ReceiverScreen from '../screens/calls/ReceiverScreen';

export const roomName = 'room';

export const BorderAnimation = () => {
    const [fadeAnim1] = useState(new Animated.Value(1));

    React.useEffect(() => {
        const runAnimation = () => {
            Animated.sequence([
                Animated.timing(fadeAnim1, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                    easing: Easing.ease,
                }),
                Animated.timing(fadeAnim1, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                    easing: Easing.ease,
                }),
            ]).start(() => runAnimation());
        };

        runAnimation();
    }, []);

    return (
        <Animated.View
            style={{
                opacity: fadeAnim1,
            }}>
            <View style={{
                padding: 26,
                borderRadius: 150,
                borderWidth: 1,
                borderColor: '#929292'
            }}>
                <Animated.View
                    style={{
                        opacity: fadeAnim1,
                    }}>
                    <View style={{
                        padding: 26,
                        borderRadius: 150,
                        borderWidth: 1,
                        borderColor: '#929292'
                    }}>
                        <Animated.View
                            style={{
                                opacity: fadeAnim1,
                            }}>
                            <View style={{
                                padding: 100,
                                borderRadius: 150,
                                borderWidth: 2,
                                borderColor: '#3BB9F2'
                            }}>
                            </View>
                        </Animated.View>
                    </View>
                </Animated.View>
            </View>
        </Animated.View>
    );
};

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
                <Stack.Screen name="ProfileDrawer" component={ProfileDrawer} />
                <Stack.Screen name="CallerScreen" component={CallerScreen} />
                <Stack.Screen name="ReceiverScreen" component={ReceiverScreen} />
            </Stack.Group>
        </Stack.Navigator>
    );
};

export default MainTabNavigator;