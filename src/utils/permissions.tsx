import { PermissionsAndroid, Platform } from "react-native";
import messaging from '@react-native-firebase/messaging';
import axios from "axios";
import { BACKEND_URL } from "./constants";
import { saveStorage } from "./storage";

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

export { hasLocationPermission, requestUserPermission, askInitialPermission };