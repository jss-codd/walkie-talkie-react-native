import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { navigationString } from '../utils/navigationString';
import RegisterScreen from '../screens/auth/Register/RegisterScreen';
import VerifyCode from '../screens/auth/VerifyCode/VerifyCode';
import PinSet from '../screens/auth/PInSet/PinSet';
import SplashScreen from '../screens/splash/SplashScreen';
import PinLogin from '../screens/auth/PinLogin/PinLogin';

export type AuthStackParamList = {
    RegisterScreen: undefined;
    VerifyCodeScreen: undefined;
    PinSetScreen: undefined;
    SplashScreen: undefined;
    PinLoginScreen: undefined;
};

const AuthStackNavigator: React.FunctionComponent = () => {
    const Stack = createNativeStackNavigator<AuthStackParamList>();
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen
                name={navigationString.SPLASH_SCREEN}
                component={SplashScreen as React.FunctionComponent}
            />
            <Stack.Screen
                name={navigationString.REGISTER_SCREEN}
                component={RegisterScreen as React.FunctionComponent}
            />
            <Stack.Screen
                name={navigationString.VERIFY_CODE}
                component={VerifyCode as React.FunctionComponent}
            />
            <Stack.Screen
                name={navigationString.PIN_SET_SCREEN}
                component={PinSet as React.FunctionComponent}
            />
            <Stack.Screen
                name={navigationString.PIN_LOGIN_SCREEN}
                component={PinLogin as React.FunctionComponent}
            />
        </Stack.Navigator>
    );
};

export default AuthStackNavigator;
