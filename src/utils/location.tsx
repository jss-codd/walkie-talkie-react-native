import Geolocation, { GeolocationResponse } from '@react-native-community/geolocation';

import { showAlert } from './alert';
import { loadStorage } from './storage';
import { saveLocation } from './apiCall';

const getLocation = async (setLocation: (arg0: GeolocationResponse) => void, setModalVisible: (arg0: any) => void) => {
    Geolocation.getCurrentPosition(
        async (pos) => {
            setLocation(pos);

            const savedLocation = await loadStorage('savedLocation');

            const latitude = pos?.coords?.latitude;
            const longitude = pos?.coords?.longitude;

            const compareDistance = await compareLocation({ latitude, longitude }, savedLocation);

            if (compareDistance) {
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
            }
        },
        (error) => {
            console.log(JSON.stringify(error), "GetCurrentPosition Error");
            if (error.code === 2) {
                setModalVisible(true)
            }
            // showAlert('Get Current Position Error', JSON.stringify(error))
        },
        { timeout: 10000 }
    );
};

const watchPosition = (setLocation: (arg0: GeolocationResponse) => void, setSubscriptionId: (arg0: number) => void) => {
    try {
        const watchID = Geolocation.watchPosition(
            async (position) => {
                setLocation(position);

                const latitude = position?.coords?.latitude;
                const longitude = position?.coords?.longitude;

                const savedLocation = await loadStorage('savedLocation');

                const compareDistance = await compareLocation({ latitude, longitude }, savedLocation);

                if (compareDistance) {
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
                }
            },
            (error) => {
                console.log('WatchPosition Error', JSON.stringify(error));
                // showAlert('WatchPosition Error', JSON.stringify(error)) 
            },
            { distanceFilter: 0, interval: 5000, timeout: 10000 }
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

const compareLocation = async (newLoc: { latitude: number; longitude: number; }, oldLoc: any) => {
    return new Promise((resolve) => {
        if (oldLoc.hasOwnProperty('latitude') && oldLoc.hasOwnProperty('longitude') && newLoc.hasOwnProperty('latitude') && newLoc.hasOwnProperty('longitude')) {
            const distance = distanceGet(newLoc.latitude, newLoc.longitude, oldLoc.latitude, oldLoc.longitude);

            console.log(distance, 'distance');

            if (distance >= 100) {
                resolve(true);
            } else {
                resolve(false);
            }
        } else {
            resolve(true);
        }
    })
}

const distanceGet = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180, Δλ = (lon2 - lon1) * Math.PI / 180, R = 6371e3;
    const d = Math.acos(Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ)) * R;

    return d;
}

export { getLocation, watchPosition, clearWatch };