import Geolocation, { GeolocationResponse } from '@react-native-community/geolocation';

import { showAlert } from './alert';
import { loadStorage } from './storage';
import { saveLocation } from './apiCall';

const getLocation = async (setLocation: (arg0: GeolocationResponse) => void) => {
    Geolocation.getCurrentPosition(
        (pos) => {
            setLocation(pos);

            const latitude = pos?.coords?.latitude;
            const longitude = pos?.coords?.longitude;

            loadStorage().then(
                token => {
                    const dataPayload = {
                        latitude: latitude,
                        longitude: longitude,
                        token: token?.token || '',
                    };

                    console.log(dataPayload, 'dataPayload1');

                    saveLocation(dataPayload);
                },
                err => {
                    console.error(err, 'token error'); // Error!
                },
            );
        },
        (error) => {
            console.log(JSON.stringify(error), "GetCurrentPosition Error")
            // showAlert('Get Current Position Error', JSON.stringify(error))
        },
        { enableHighAccuracy: true }
    );
};

const watchPosition = (setLocation: (arg0: GeolocationResponse) => void, setSubscriptionId: (arg0: number) => void) => {
    try {
        const watchID = Geolocation.watchPosition(
            (position) => {
                setLocation(position);

                const latitude = position?.coords?.latitude;
                const longitude = position?.coords?.longitude;

                loadStorage().then(
                    token => {
                        const dataPayload = {
                            latitude: latitude,
                            longitude: longitude,
                            token: token?.token || '',
                        };

                        console.log(dataPayload, 'dataPayload2');

                        saveLocation(dataPayload);
                    },
                    err => {
                        console.error(err, 'token error'); // Error!
                    },
                );
            },
            (error) => {
                console.log('WatchPosition Error', JSON.stringify(error));
                // showAlert('WatchPosition Error', JSON.stringify(error)) 
            },
            { distanceFilter: 0, interval: 5000 }
        );

        setSubscriptionId(watchID);
    } catch (error) {
        showAlert('WatchPosition Error', JSON.stringify(error));
    }
};

const clearWatch = (subscriptionId: number | null, setSubscriptionId: (arg0: null) => void) => {
    subscriptionId !== null && Geolocation.clearWatch(subscriptionId);
    setSubscriptionId(null);
};

export { getLocation, watchPosition, clearWatch };