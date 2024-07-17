import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import { request, PERMISSIONS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Permissions from 'react-native-permissions'

import { AlertMessages, apiEndpoints, BACKEND_URL } from './constants';
import { saveStorage } from './storage';
import { showAlert } from './alert';

const hasLocationPermission = async () => {
    let locationPermission: any;

    if (Platform.OS === 'android') {
        const grantedPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: 'Location Access Required',
                message: 'This app needs to access your location',
                buttonPositive: 'OK',
            },
        );
        locationPermission =
            grantedPermission === PermissionsAndroid.RESULTS.GRANTED;
    } else {
        const grantedPermission = await request(
            PERMISSIONS.IOS.LOCATION_ALWAYS,
        );
        locationPermission = grantedPermission === 'granted';
    }

    return locationPermission;
};

const hasLocationPermissionBG = async () => {
    let bgPermission: any;

    if (Platform.OS === 'android') {
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
        bgPermission = granted2 === PermissionsAndroid.RESULTS.GRANTED;
    } else {
        bgPermission = true;
    }

    return bgPermission;
};

const getFcmToken = async () => {
    let fcmToken = await AsyncStorage.getItem('fcmToken');

    if (fcmToken === null) {
        try {
            const getToken = await messaging().getToken();
            if (getToken) {
                saveToken(getToken);
            }
        } catch (err) {
            console.log('Error while getting FCM Token', err);
        }
    }
};

// save token
const saveToken = async (token: string) => {
    try {
        const dataPayload = {
            token: token,
        };

        axios
            .post(BACKEND_URL + apiEndpoints.deviceToken, dataPayload)
            .then(async response => {
                console.log('saveToken ', response.data);
                await AsyncStorage.setItem('fcmToken', token);
                saveStorage({ token: token });
            })
            .catch(error => {
                console.error('Error sending data: ', error);
            });
    } catch (error: any) {
        console.log('Permission or Token retrieval error:', error.message);
    }
};

const notificationPermission = async () => {
    try {
        if (Platform.OS === 'android') {
            const permission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            );
            return (
                permission === PermissionsAndroid.RESULTS.GRANTED ||
                permission === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
            );
        } else {
            const permission = await messaging().requestPermission();
            return (
                permission === messaging.AuthorizationStatus.AUTHORIZED ||
                permission === messaging.AuthorizationStatus.PROVISIONAL
            );
        }
    } catch (err) {
        return false;
    }
};

const askInitialPermission = async () => {
    const grantedNotification = await notificationPermission();
    const grantedLocation = await hasLocationPermission();
    // const audioPermissions = await requestAudioPermissions();

    if (grantedNotification) {
        getFcmToken();
    }

    return grantedLocation && grantedNotification;
};

const requestAudioPermissions = async () => {
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED) {
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

const requestAudioAndStoragePermissions = async () => {
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
            ((granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED)) &&
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

const checkPermissions = async () => {
    if (Platform.OS === 'android') {
        const notification = await Permissions.check('android.permission.POST_NOTIFICATIONS');

        if (
            notification !== PermissionsAndroid.RESULTS.GRANTED &&
            notification !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
        ) {
            showAlert(AlertMessages.notification_access_error.title, AlertMessages.notification_access_error.message);
        }

        const location = await Permissions.check('android.permission.ACCESS_FINE_LOCATION');

        if (location !== PermissionsAndroid.RESULTS.GRANTED) {
            showAlert(AlertMessages.location_access_error.title, AlertMessages.location_access_error.message);
        }
    } else {
        const notification = await messaging().requestPermission();
        if (
            notification !== messaging.AuthorizationStatus.AUTHORIZED &&
            notification !== messaging.AuthorizationStatus.PROVISIONAL
        ) {
            showAlert(AlertMessages.notification_access_error.title, AlertMessages.notification_access_error.message);
        }

        const location = await Permissions.check('ios.permission.LOCATION_ALWAYS');

        if (location !== PermissionsAndroid.RESULTS.GRANTED) {
            showAlert(AlertMessages.location_access_error.title, AlertMessages.location_access_error.message);
        }
    }
}

const checkPermissionsBGLocation = async () => {
    if (Platform.OS === 'android') {
        const locationbg = await Permissions.check('android.permission.ACCESS_BACKGROUND_LOCATION');

        if (locationbg !== PermissionsAndroid.RESULTS.GRANTED) {
            showAlert(AlertMessages.location_access_bg_error.title, AlertMessages.location_access_bg_error.message);
        }
    } else {
        const location = await Permissions.check('ios.permission.LOCATION_ALWAYS');

        if (location !== PermissionsAndroid.RESULTS.GRANTED) {
            showAlert(AlertMessages.location_access_bg_error.title, AlertMessages.location_access_bg_error.message);
        }
    }
}

export { hasLocationPermission, askInitialPermission, requestAudioPermissions, notificationPermission, checkPermissions, hasLocationPermissionBG, requestAudioAndStoragePermissions };
