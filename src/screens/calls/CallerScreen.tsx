import { useEffect, useRef, useState } from "react";
import InCallManager from 'react-native-incall-manager';
import {
    RTCView,
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    mediaDevices
} from 'react-native-webrtc';
import { TouchableOpacity, View, Image } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { socket } from "../../../socket";
import { HP, VP } from "../../utils/Responsive";
import { TextStyles } from "../../utils/TextStyles";
import { RNText } from "../../components/RNText";
import { BorderAnimation, roomName } from "../../navigations/MainTabNavigator";

let peerConnection: any = {};
let localStreamData: any;

function CallerScreen({ navigation }: { navigation: any }) {
    const [timerDigit, setTimerDigit] = useState<any>(0);

    const [remoteStream, setRemoteStream] = useState<any>([]);
    const [localStream, setlocalStream] = useState<any>(null);
    const [timerInterval, setTimerInterval] = useState<any>(null);
    const [leaveCallCount, setLeaveCallCount] = useState<any>(0);
    const [timerState, setTimerState] = useState<any>(null);
    const [callConnected, setCallConnected] = useState<any>(false);

    let remoteRTCMessage = useRef<any>(null);
    const otherUserId = useRef(null);
    const callConnectedOnce = useRef<any>(null);

    useEffect(() => {
        callConnectedOnce.current = 0;

        socket.emit('joinRoom', {
            roomId: roomName,
            userType: 'caller'
        });
        socket.on('connect_error', err => { });

        socket.on('callAnswered', data => {
            remoteRTCMessage.current = data.rtcMessage;
            let callee = data.callee;

            if (peerConnection[callee]) {
                if (peerConnection[callee].signalingState === 'have-local-offer') {
                    peerConnection[callee]
                        .setRemoteDescription(
                            new RTCSessionDescription(remoteRTCMessage.current),
                        )
                        .then(() => {
                            if (callConnectedOnce.current === 0) {
                                setCallConnected(true);
                                const timerIntervalGet = setInterval(() => {
                                    setTimerDigit((pre: number) => ++pre);
                                }, 1000);
                                setTimerInterval(timerIntervalGet);

                                const timer = setTimeout(() => {
                                    setLeaveCallCount((pre: number) => ++pre);
                                }, 15000)
                                setTimerState(timer);

                                callConnectedOnce.current++;
                            }
                        })
                        .catch((error: any) =>
                            console.error('Failed to set remote description:', error),
                        );
                } else {
                    console.warn(
                        'Cannot set remote description in current signaling state:',
                        peerConnection[callee].signalingState,
                    );
                }
            }
        });

        socket.on('requestToJoin', async data => {
            let ids = data.callerId;
            if (!peerConnection[ids]) {
                peerConnection[ids] = new RTCPeerConnection({
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
                            url: 'turn:freeturn.net:3478',
                            credential: 'free',
                            username: 'free',
                        },
                    ],
                });

                localStreamData
                    .getTracks()
                    .forEach((track: any) =>
                        peerConnection[ids].addTrack(track, localStreamData),
                    );

                const sessionDescription = await peerConnection[ids].createOffer();
                await peerConnection[ids].setLocalDescription(sessionDescription);

                peerConnection[ids].ontrack = (event: { streams: any[]; }) => {
                    remoteStream[ids] = event.streams[0];
                    setRemoteStream(event.streams[0]);
                };

                sendCall({
                    rtcMessage: sessionDescription,
                    roomId: ids,
                });
            }
        });

        socket.on('ICEcandidate', data => {
            let message = data.rtcMessage;
            if (peerConnection[data.sender]) {
                peerConnection[data.sender]
                    .addIceCandidate(
                        new RTCIceCandidate({
                            candidate: message.candidate,
                            sdpMid: message.id,
                            sdpMLineIndex: message.label,
                        }),
                    )
                    .then((data: any) => {
                        console.log('SUCCESS');
                    })
                    .catch((err: any) => {
                        console.log('Error===============>', err);
                    });
                peerConnection[data.sender].oniceconnectionstatechange = async () => {
                    if (
                        Object.keys(peerConnection).length > 0 &&
                        peerConnection[data.sender].iceConnectionState === 'checking'
                    ) {

                        const sessionDescription = await peerConnection[
                            data.sender
                        ].createOffer();
                        await peerConnection[data.sender].setLocalDescription(
                            sessionDescription,
                        );

                        peerConnection[data.sender].ontrack = (event: { streams: any[]; }) => {
                            setRemoteStream(event.streams[0]);
                        };
                        // sendCall({
                        //     rtcMessage: sessionDescription,
                        //     roomId: data.sender,
                        // });
                    } else if (
                        Object.keys(peerConnection).length > 0 &&
                        peerConnection[data.sender].iceConnectionState === 'failed'
                    ) {
                        const sessionDescription = await peerConnection[
                            data.sender
                        ].createOffer();
                        await peerConnection[data.sender].setLocalDescription(
                            sessionDescription,
                        );

                        // sendCall({
                        //     rtcMessage: sessionDescription,
                        //     roomId: data.sender,
                        // });
                    } else if (
                        Object.keys(peerConnection).length > 0 &&
                        peerConnection[data.sender].iceConnectionState === 'disconnected'
                    ) {
                        delete peerConnection[data.sender];
                    } else if (
                        Object.keys(peerConnection).length > 0 &&
                        peerConnection[data.sender].iceConnectionState === 'connected'
                    ) {
                        // sendAudioVideoStatus();
                    }
                };
                peerConnection[data.sender].onicecandidate = (event: { candidate: { sdpMLineIndex: any; sdpMid: any; candidate: any; }; }) => {
                    if (event.candidate) {
                        sendICEcandidate({
                            calleeId: data.sender,
                            rtcMessage: {
                                label: event.candidate.sdpMLineIndex,
                                id: event.candidate.sdpMid,
                                candidate: event.candidate.candidate,
                            },
                        });
                    } else {
                        console.log('End of candidates.');
                    }
                };
            }
        });

        socket.on('endOfCall', data => { });

        mediaDevices.enumerateDevices().then(sourceInfos => {
            mediaDevices
                .getUserMedia({
                    audio: true,
                    video: false,
                })
                .then(stream => {
                    // Got stream!

                    setlocalStream(stream);
                    localStreamData = stream;
                })
                .catch(error => {
                    // Log error
                });
        });

        return () => {
            socket.off('callAnswered');
            socket.off('ICEcandidate');
            socket.off('endOfCall');
            socket.off('requestToJoin');
            clearInterval(timerInterval);
            clearTimeout(timerState);
            leaveCall();
        };
    }, []);

    useEffect(() => {
        if (leaveCallCount > 0)
            leaveCall();
    }, [leaveCallCount]);

    function sendCall(data: { rtcMessage: any; roomId: any; }) {
        socket.emit('teacherLive', data);

        InCallManager.setSpeakerphoneOn(true);
        InCallManager.setForceSpeakerphoneOn(true);
    }

    function sendICEcandidate(data: { calleeId: any; rtcMessage: { label: any; id: any; candidate: any; }; }) {
        socket.emit('ICEcandidate', data);
    }

    const leaveCall = () => {
        peerConnection = {};

        setRemoteStream(null);
        socket.emit('endCall', { roomId: roomName });
        otherUserId.current = null;
        clearInterval(timerInterval);
        clearTimeout(timerState);
        setTimerDigit(0);

        navigation.navigate('HomeScreen', {
        })
    }

    return (
        <>
            {localStream ? (
                <>
                    <RTCView
                        objectFit={'cover'}
                        style={{
                            flex: 1,
                            backgroundColor: '#050A0E',
                            zIndex: -1,
                        }}
                        streamURL={localStream.toURL()}
                        zOrder={0}
                    />
                </>
            ) : (<></>)}


            <LinearGradient
                colors={['#5E43DD', '#723F96']}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, justifyContent: "center", alignItems: "center", height: "100%", width: "100%", position: "absolute" }}
            >
                <BorderAnimation animationStatus={callConnected}>
                </BorderAnimation>

                <TouchableOpacity style={{
                    position: "relative",
                    top: -220
                }}
                    onPress={() => { leaveCall() }}
                >
                    <Image source={require('../../assets/icons/mic.png')} style={{ width: HP(127), height: HP(127) }} />
                </TouchableOpacity>

                <View style={{ marginTop: VP(-80) }}>
                    <RNText textStyle={{ ...TextStyles.SOFIA_SEMI_BOLD, color: '#fff', textAlign: "center", fontSize: HP(16), }}>{!callConnected ? '"Connecting..."' : '"Click on mic for cancel"'}</RNText>

                    <RNText textStyle={{ ...TextStyles.SOFIA_SEMI_BOLD, color: '#fff', textAlign: "center", fontSize: HP(20), marginTop: VP(19) }}>00:00:{(timerDigit.toString().length >= 2) ? timerDigit : '0' + timerDigit}</RNText>
                </View>
            </LinearGradient>
        </>
    );
}

export default CallerScreen;