import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Button, Text, Platform, Alert, StyleSheet, TouchableOpacity, ToastAndroid, SafeAreaView } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFetchBlob from 'rn-fetch-blob'
import InCallManager from 'react-native-incall-manager';

import { AlertMessages, apiEndpoints, BACKEND_URL, errorMessage } from '../utils/constants'
import Loader from './Loader';
import { requestAudioPermissions, requestAudioAndStoragePermissions, askInitialPermission } from '../utils/permissions';
import { showAlert, showFadeAlert } from '../utils/alert';
import { distanceGet, returnLocation } from '../utils/location';
import Microphone from '../assets/svgs/microphone.svg';
import PhoneOff from '../assets/svgs/phone-off.svg';
import { LinearGradientComp } from '../screens/main/HomeScreen';
import { RNText } from './RNText';
import { getConfig } from '../utils/axiosConfig';

import {
    RTCView,
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    mediaDevices,
    MediaStream,
    MediaStreamTrack,
} from 'react-native-webrtc';

import { socket } from '../../socket';
import LinearGradient from 'react-native-linear-gradient';
import { FS, HP, VP } from '../utils/Responsive';
import { navigationString } from '../utils/navigationString';
import { SettingContext } from '../context/SettingContext';
import { loadStorage } from '../utils/storage';
import Unmute from '../assets/svgs/unmute.svg';
import { TextStyles } from '../utils/TextStyles';
import axios from 'axios';
import Mute from '../assets/svgs/mute.svg';

const ToggleNotification = (): React.JSX.Element => {
    const settings = useContext<any>(SettingContext);

    const notificationStatus = settings.notificationStatus;

    // const [loader, setLoader] = useState(false);

    const toggleNotification = async () => {
        // setLoader(true);

        const dataPayload = {
            "status": !notificationStatus
        };

        settings.handler('notificationStatus', !notificationStatus);

        // setLoader(false);

        // axios.put(BACKEND_URL + apiEndpoints.notificationStatus, dataPayload)
        //     .then(response => {
        //         settings.setProflieDetails((pre: any) => ({ ...pre, status: response?.data?.status }))
        //         setLoader(false)
        //     })
        //     .catch(error => {
        //         setLoader(false);
        //         showAlert('Error to change', "");
        //         console.warn("Error sending data: ", error);

        //         console.warn(error.response.data, 'error.response.data');
        //         console.warn(error.response.status, 'error.response.status');
        //     });
    }

    return (
        <>
            {/* <Loader loading={loader} /> */}
            <TouchableOpacity style={{ alignItems: "center" }} onPress={() => toggleNotification()}>
                <View style={styles.iconContainer}>
                    {notificationStatus ? <Unmute width={31} height={31} /> : (<Mute width={31} height={31} />)}
                </View>
                <RNText textStyle={styles.iconText}>{notificationStatus ? 'Mute' : 'Unmute'}</RNText>
            </TouchableOpacity>
        </>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        padding: HP(14),
        backgroundColor: "#E5E5E5",
        borderRadius: HP(50)
    },
    iconText: {
        ...TextStyles.SOFIA_SEMI_BOLD,
        fontSize: FS(8),
        color: "#282828",
        marginTop: VP(9)
    },
});

export default ToggleNotification;
