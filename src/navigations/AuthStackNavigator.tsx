import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { navigationString } from '../utils/navigationString';
import RegisterScreen from '../screens/auth/Register/RegisterScreen';
import VerifyCode from '../screens/auth/VerifyCode/VerifyCode';

export type AuthStackParamList = {
    OnBoardScreen: undefined;
    VerifyCodeScreen: undefined;
};

const AuthStackNavigator: React.FunctionComponent = () => {
    const Stack = createNativeStackNavigator<AuthStackParamList>();
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen
                name={navigationString.ON_BOARD_SCREEN}
                component={RegisterScreen as React.FunctionComponent}
            />
            <Stack.Screen
                name={navigationString.VERIFY_CODE}
                component={VerifyCode as React.FunctionComponent}
            />
        </Stack.Navigator>
    );
};

export default AuthStackNavigator;
