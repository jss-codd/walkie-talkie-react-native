import { PermissionsAndroid, Platform } from "react-native";
import messaging from '@react-native-firebase/messaging';
import axios from "axios";
import { request, PERMISSIONS } from 'react-native-permissions';

import { BACKEND_URL } from "./constants";
import { saveStorage } from "./storage";
import { showAlert } from "./alert";

const hasLocationPermission = async () => {
    if (Platform.OS === 'ios') {
        return true;
    }

    const granted1 = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
            title: 'Location Access Required',
            message: 'This app needs to access your location',
            buttonPositive: 'OK',
        },
    );

    const granted2 = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
            title: 'Background Location Permission',
            message:
                'We need access to your location ' +
                'so you can get live quality updates.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
        },
    );

    return granted1 === PermissionsAndroid.RESULTS.GRANTED && granted2 === PermissionsAndroid.RESULTS.GRANTED;
};

// fetch token
const requestUserPermission = async () => {
    try {
        await messaging().requestPermission();
        const token = await messaging().getToken();

        const dataPayload = {
            "token": token
        };

        axios.post(BACKEND_URL + '/device-token', dataPayload)
            .then(response => {
                // console.log("response.data token: ", response.data);
                saveStorage({ "token": token });
            })
            .catch(error => {
                console.error("Error sending data: ", error);
            });
    } catch (error: any) {
        console.log('Permission or Token retrieval error:', error.message);
    }
};

const askInitialPermission = async () => {
    const grantedLocation = await hasLocationPermission();

    if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (granted == PermissionsAndroid.RESULTS.GRANTED || granted == PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            const grantedNotification = true;
            requestUserPermission();
            return grantedLocation && grantedNotification;
        }
    } else if (Platform.OS === "ios") {
        // iOS - Requesting permissions
        const grantedNotification = true;
        requestUserPermission();
        return grantedLocation && grantedNotification;
    }
}

const requestAudioPermissions = async () => {
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
            ((granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED) || (granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) &&
            ((granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED) || (granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) &&
            ((granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED) || (granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN))
        ) {
            return true;
        } else {
            showAlert('Permissions not granted!', "");
            return false;
        }
    } else {
        const result = await request(PERMISSIONS.IOS.MICROPHONE);
        return result === 'granted';
    }
};

export { hasLocationPermission, requestUserPermission, askInitialPermission, requestAudioPermissions };