import React, { useContext, useState, SetStateAction, Dispatch } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';

import { RNText } from './RNText';
import { FS, HP, VP } from '../utils/Responsive';
import { SettingContext } from '../context/SettingContext';
import { TextStyles } from '../utils/TextStyles';
import Camera from '../assets/svgs/camera.svg';
import Policeman from '../assets/svgs/policeman.svg';
import TrafficLight from '../assets/svgs/traffic-light.svg';
import Traffic from '../assets/svgs/traffic.svg';
import Loader from './Loader';
import { iconTapSubmit } from '../utils/apiCall';
import { returnLocation } from '../utils/location';
import { showAlert, showFadeAlert } from '../utils/alert';
import { AlertMessages, errorMessage, mapActionIcons } from '../utils/constants';
import { socket } from '../../socket';
import { mapActionIconComponents } from '../../types';

const MapIconsAction = (): React.JSX.Element => {
    const settings = useContext<any>(SettingContext);

    const { route, setCameraMarkers, setActionIconMarkers }: { route: any, setCameraMarkers: Dispatch<SetStateAction<any[]>>, setActionIconMarkers: Dispatch<SetStateAction<any[]>> } = settings;

    const [loader, setLoader] = useState(false);

    const iconTapAction = async (type: string) => {
        setLoader(true);

        try {
            if (!route?.value) {
                throw new Error(errorMessage.routeSelect);
            }

            // get user current location
            const currentLocation = await returnLocation();

            const dataPayload = {
                location: currentLocation,
                route: route.value,
                type
            }

            const res = await iconTapSubmit(dataPayload);

            if (res?.latitude && res?.longitude && res?.type) {
                if (res.type === 'camera') {
                    setCameraMarkers((pre: any) => ([...pre, { lat: res.latitude, lng: res.longitude }]));
                } else {
                    setActionIconMarkers((pre: any) => ([...pre, { lat: res.latitude, lng: res.longitude, type: res.type, createdAt: '' }]));
                }
                socket.emit('sendActionIconLocation', {
                    roomId: route.value,
                    lat: res.latitude,
                    lng: res.longitude,
                    type: res.type
                });
            }

            setLoader(false);
            showFadeAlert(AlertMessages.cameraTapAction.title);
        } catch (err: any) {
            showFadeAlert(err?.message || errorMessage.commonError);
            setLoader(false);
        }
    }

    const Components: any = {
        policeman: Policeman,
        traffic: Traffic,
    };

    return (
        <>
            <Loader loading={loader} />
            <View style={{ ...styles.iconContainerMain }}>
                <TouchableOpacity style={{ ...styles.iconContainer }} onPress={() => iconTapAction("camera")}>
                    <Camera width={32} height={32} />
                </TouchableOpacity>

                {mapActionIcons.map((d: { icon: string }, i: number) => (
                    <TouchableOpacity key={`actionicons-${i}`} style={{ ...styles.iconContainer }} onPress={() => iconTapAction(d.icon)}>
                        {React.createElement(Components[d.icon], {
                            width: 32,
                            height: 32
                        })}
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    iconContainerMain: {
        top: VP(180),
        right: HP(-150),
        gap: VP(16)
    },
    iconContainer: {
        padding: HP(6),
        // backgroundColor: "#E5E5E5",
        borderRadius: HP(24),
        backgroundColor: 'rgba(81,67,225,.8)',
    },
    icon: {
        width: HP(24),
        height: HP(24),
    }
});

export default MapIconsAction;
