import Geolocation, { GeolocationResponse } from '@react-native-community/geolocation';
import { SetStateAction } from 'react';

import { showAlert } from './alert';
import { loadStorage } from './storage';
import { saveLocation } from './apiCall';

const returnLocation = () => {
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            async (pos) => {
                const latitude = pos?.coords?.latitude;
                const longitude = pos?.coords?.longitude;
                resolve({ latitude, longitude })
            },
            (error) => {
                console.log(JSON.stringify(error), "returnLocation Error");
                reject(error.message);
            },
            { timeout: 10000 }
        );
    })
};

const getLocation = async (setLocation: (arg0: GeolocationResponse) => void, setLocationRegion: (arg0: GeolocationResponse) => void, locationRegion: { (): undefined; (value: SetStateAction<boolean>): void; coords?: any; } | undefined, setModalVisible: (arg0: any) => void) => {
    Geolocation.getCurrentPosition(
        async (pos: GeolocationResponse) => {
            setLocation(pos);

            if (!locationRegion?.coords?.latitude) {
                setLocationRegion(pos);
            }

            const savedLocation = await loadStorage('savedLocation');

            const latitude = pos?.coords?.latitude;
            const longitude = pos?.coords?.longitude;
            const heading = pos?.coords?.heading;

            const compareDistance = await compareLocation({ latitude, longitude }, savedLocation);

            if (compareDistance) {
                setLocationRegion(pos);

                const dataPayload = {
                    latitude: latitude,
                    longitude: longitude,
                    heading: heading
                };

                console.log(dataPayload, 'dataPayload1');

                saveLocation(dataPayload);
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

const watchPosition = (setLocation: (arg0: GeolocationResponse) => void, setLocationRegion: (arg0: GeolocationResponse) => void, setSubscriptionId: (arg0: number) => void) => {
    try {
        const watchID = Geolocation.watchPosition(
            async (position) => {
                setLocation(position);

                const latitude = position?.coords?.latitude;
                const longitude = position?.coords?.longitude;
                const heading = position?.coords?.heading;

                const savedLocation = await loadStorage('savedLocation');

                const compareDistance = await compareLocation({ latitude, longitude }, savedLocation);

                if (compareDistance) {
                    setLocationRegion(position);

                    const dataPayload = {
                        latitude: latitude,
                        longitude: longitude,
                        heading
                    };

                    console.log(dataPayload, 'dataPayload2');

                    saveLocation(dataPayload);
                }
            },
            (error) => {
                console.log('WatchPosition Error', JSON.stringify(error));
                // showAlert('WatchPosition Error', JSON.stringify(error)) 
            },
            { distanceFilter: 100, interval: 5000, timeout: 10000 }
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

const compareLocation = (newLoc: { latitude: number; longitude: number; }, oldLoc: any) => {
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

const calculateHeading = (cord1: { latitude: number; longitude: number; }, cord2: { latitude: number; longitude: number; }) => {
    if (cord2) {
        const { latitude: lat1, longitude: lng1 } = cord1;
        const { latitude: lat2, longitude: lng2 } = cord2;
        const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
        const x =
            Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
        const θ = Math.atan2(y, x);
        const brng = ((θ * 180) / Math.PI + 360) % 360;
        return brng;
    }
    return 0;
}

export { getLocation, watchPosition, clearWatch, returnLocation, compareLocation };