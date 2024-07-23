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
import { HP } from '../utils/Responsive';
import { navigationString } from '../utils/navigationString';
import { SettingContext } from '../context/SettingContext';
import { loadStorage } from '../utils/storage';
import { useIsFocused } from '@react-navigation/native';

const VoiceRecorder = ({ iconContainer, iconText, navigation }: { iconContainer: any, iconText: any, navigation: any }) => {
    const settings = useContext<any>(SettingContext);
    const isFocused = useIsFocused();

    const [recording, setRecording] = useState(false);
    const [recordTime, setRecordTime] = useState('00:00:00');
    const [audioPath, setAudioPath] = useState('');
    const [loader, setLoader] = useState(false);
    const [timerState, setTimerState] = useState<any>(null);

    const [timerDigit, setTimerDigit] = useState<any>(0);
    const [timerInterval, setTimerInterval] = useState<any>(null);

    /* This creates an WebRTC Peer Connection, which will be used to set local/remote descriptions and offers. */
    const configuration = {
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302',
            },
            {
                urls: 'stun:stun1.l.google.com:19302',
            },
            {
                urls: 'stun:stun2.l.google.com:19302',
            },
            {
                urls: 'stun:stun3.l.google.com:19302',
            },
            {
                urls: 'stun:stun4.l.google.com:19302',
            },
            {
                url: 'turn:freeturn.net:3478',
                credential: 'free',
                username: 'free',
            },
        ],
    };

    const [localStream, setLocalStream] = useState<any>(null);
    const [remoteStream, setRemoteStream] = useState<any>(null);
    const [micOn, setMicOn] = useState<any>(true);
    const [onOffer, setOnOffer] = useState<any>(false);
    const buttonRef = useRef<any>(null);
    const [leaveCallCount, setLeaveCallCount] = useState<any>(0);
    const [callerDetails, setCallerDetails] = useState<any>({});

    const pcRef = useRef<any>();

    useEffect(() => {
        if (settings.notificationStatus) {
            socket.on('calling', async (name, location) => {
                try {
                    console.log(settings.proflieDetails.mobile, '-----------------calling');

                    navigation.navigate('ReceiverScreen', {
                        name: name,
                        location: location
                    })
                } catch (error) {
                    console.error('Error answering call: ', error);
                }
            });

            return () => {
                socket.off('calling')
            }
        }
    }, [settings.notificationStatus])

    const startLocalStream = async () => {
        try {
            const granted = await requestAudioPermissions();

            if (!granted) {
                return;
            }

            navigation.navigate('CallerScreen', {
            })

            // navigation.reset({
            //     index: 0,
            //     routes: [
            //         {
            //             name: 'CallerScreen',
            //         },
            //     ],
            // });
        } catch (error) {
            console.error('Error startLocalStream: ', error);
        }
    };

    return (
        <>
            <Loader loading={loader} />

            <View style={{ alignItems: "center" }}>
                <LinearGradientComp onOffer={onOffer} status={recording} style={{ top: -5, }}>
                    <TouchableOpacity
                        ref={buttonRef}
                        style={{ alignItems: "flex-start" }}
                        onPress={() => startLocalStream()}
                        disabled={onOffer ? true : false}
                    >
                        <View style={{
                        }}>
                            <LinearGradient
                                colors={onOffer ? ['rgb(255, 0, 0)', 'rgb(0, 0, 0)'] : ['#E5E5E5', '#E5E5E5']}
                                start={{ x: 0.0, y: 1.0 }} end={{ x: 1.0, y: 1.0 }}
                                style={{ borderRadius: HP(100), padding: 15 }}
                            >
                                <View style={{ ...iconContainer, backgroundColor: "#E0D0D0", marginBottom: 0 }}>
                                    {!recording ? (<Microphone width={32} height={32} />) : (<PhoneOff width={32} height={32} />)}
                                </View>
                            </LinearGradient>
                        </View>
                    </TouchableOpacity>
                </LinearGradientComp>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    logo: {
        width: 300,
        height: 80,
    },
    bottom: {
        verticalAlign: "bottom"
    },
    textDark: {
        color: "#666"
    },
    thread: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    body: {
        backgroundColor: "#FFF",
    },
    stream: {
        flex: 1,
        // height: 500,
        // width: 500,
    },
});

export default VoiceRecorder;
