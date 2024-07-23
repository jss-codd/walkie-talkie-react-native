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

const VoiceRecorder = ({ iconContainer, iconText, navigation }: { iconContainer: any, iconText: any, navigation: any }) => {
    const settings = useContext<any>(SettingContext);

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
        pcRef.current = new RTCPeerConnection(configuration);

        pcRef.current.onicecandidate = (event: { candidate: any; }) => {
            console.log(settings.proflieDetails.mobile, '-------------candidate emit')
            if (event.candidate) {
                socket.emit('candidate', event.candidate);
            }
        };

        pcRef.current.onconnectionstatechange = (event: any) => {
            console.log(pcRef.current.connectionState, settings.proflieDetails.mobile, '----------pcRef.current.connectionState')
            switch (pcRef.current.connectionState) {
                case 'closed':
                    socket.emit('leaveCall', {});
                    setOnOffer(false);

                    setRecording(false);

                    clearInterval(timerInterval);
                    setTimerDigit(0);
                    break;
            };
        };

        // Handle incoming stream
        pcRef.current.ontrack = (event: { streams: any[]; }) => {
            console.log(settings.proflieDetails.mobile, '-------------ontrack')
            const remoteStreamGet = event.streams[0];
            // Attach the remote stream to your UI
            setRemoteStream(remoteStreamGet);
        };

        socket.on('offer', async (offer, user, location) => {
            try {
                console.log(settings.proflieDetails.mobile, '-----------------offer');
                setCallerDetails({ ...user, ...location });
                setOnOffer(true);

                // setLeaveCallCount((pre: number) => ++pre);

                //here we are going to disabled call button

                await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pcRef.current.createAnswer();
                await pcRef.current.setLocalDescription(new RTCSessionDescription(answer));
                // Send the answer to the remote peer using your signaling server
                socket.emit('answer', answer);

                // InCallManager.setSpeakerphoneOn(true);
                // InCallManager.setForceSpeakerphoneOn(true);
            } catch (error) {
                console.error('Error answering call: ', error);
            }
        });

        socket.on('leaveCall', async (offer) => {
            try {
                console.log(settings.proflieDetails.mobile, '-----------------leaveCall');
                setOnOffer(false);
                setRemoteStream(null);
                // pcRef.current.close()
            } catch (error) {
                console.error('Error leaveCall: ', error);
            }
        });

        socket.on('answer', async (answer) => {
            console.log(settings.proflieDetails.mobile, '-----------------answer');
            // code for mic on
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on('candidate', async (candidate) => {
            console.log(settings.proflieDetails.mobile, '-----------------candidate on')
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        });

        // startLocalStream();

        InCallManager.setSpeakerphoneOn(true);

        return () => {
            socket.disconnect();
            pcRef.current.close();
        };
    }, []);

    useEffect(() => {
        if (leaveCallCount > 0)
            leaveCall()
    }, [leaveCallCount]);

    useEffect(() => {
        (async () => {
            if (onOffer) {
                const savedLocation = await loadStorage('savedLocation');

                navigation.navigate('MyModal', {
                    username: callerDetails?.name || 'Unknown',
                    distance: (callerDetails.lat > 0 && callerDetails.lng > 0) ? Math.round(+(distanceGet(savedLocation.latitude, savedLocation.longitude, callerDetails.lat, callerDetails.lng) || 0) / 1000) + 'km' : 'NA',
                });
            }
            else {
                navigation.navigate(navigationString.HOME_SCREEN);
            }
        })()
    }, [onOffer, callerDetails]);

    const startLocalStream = async () => {
        try {
            const granted = await requestAudioPermissions();

            if (!granted) {
                return;
            }

            setRecording(true);

            const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: false,
            });

            stream
                .getTracks()
                .forEach(track => pcRef.current.addTrack(track, stream));

            setLocalStream(stream);

            createOffer();
        } catch (error) {
            console.error('Error startLocalStream: ', error);
        }
    };

    const createOffer = async () => {
        try {
            const offer = await pcRef.current.createOffer();
            await pcRef.current.setLocalDescription(new RTCSessionDescription(offer));
            // Send the offer to the remote peer using your signaling server
            socket.emit('offer', offer);

            // const timer = setTimeout(() => {
            //     setLeaveCallCount((pre: number) => ++pre);
            // }, 15000)

            const timerIntervalGet = setInterval(() => {
                setTimerDigit((pre: number) => ++pre);
            }, 1000)

            // setTimerState(timer);
            setTimerInterval(timerIntervalGet);
        } catch (error) {
            console.error('Error starting call: ', error);
        }
    };

    const leaveCall = async () => {
        try {
            console.log('-----------leaveCall');

            setRecording(false);

            localStream.getAudioTracks().forEach((track: { enabled: boolean; }) => {
                track.enabled = false
            });

            socket.emit('leaveCall', {});

            // pcRef.current.close();

            // clearTimeout(timerState);
            clearInterval(timerInterval);
            setTimerDigit(0);
        } catch (error) {
            console.error('Error leaveCall: ', error);
        }
    };

    return (
        <>
            {
                localStream && (
                    <>
                        <RTCView streamURL={localStream.toURL()} style={{ width: '0%', height: '0%', position: "absolute" }} />
                    </>
                )
            }
            {remoteStream ? <RTCView streamURL={remoteStream.toURL()} style={{ width: '0%', height: '0%', position: "absolute" }} /> : null}

            <Loader loading={loader} />

            <View style={{ alignItems: "center" }}>
                <LinearGradientComp onOffer={onOffer} status={recording} style={{ top: -5, }}>
                    <TouchableOpacity
                        ref={buttonRef}
                        style={{ alignItems: "flex-start" }}
                        onPress={() => !recording ? startLocalStream() : leaveCall()}
                        // onPress={() => startLocalStream()}
                        disabled={onOffer ? true : false}
                    >
                        <View style={{
                            // padding: 15,
                            // backgroundColor: onOffer ? 'red' : '#E5E5E5',
                            // borderRadius: 100,
                            // borderWidth: 1,
                            // borderColor: '#E5E5E5'
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
                <RNText textStyle={iconText}>{timerDigit}</RNText>
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
