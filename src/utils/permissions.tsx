import {PermissionsAndroid, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import {BACKEND_URL} from './constants';
import {saveStorage} from './storage';
import {request, PERMISSIONS} from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const hasLocationPermission = async () => {
    let locationPermission: any;
    let bgPermission: any;

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

    return locationPermission && bgPermission;
};

const getFcmToken = async () => {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (fcmToken === null) {
        try {
            const getToken = await messaging().getToken();
            if (getToken) {
                await AsyncStorage.setItem('fcmToken', getToken);
                saveToken(getToken);
                saveStorage({token: getToken});
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
            .post(BACKEND_URL + '/device-token', dataPayload)
            .then(response => {
                console.log('saveToken ', response);
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
    const grantedLocation = await hasLocationPermission();
    const grantedNotification = await notificationPermission();
    if (grantedNotification) {
        getFcmToken();
    }
    return grantedLocation && grantedNotification;
};

export {hasLocationPermission, askInitialPermission};
