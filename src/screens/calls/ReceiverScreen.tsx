import { useEffect, useRef, useState } from "react";
import InCallManager from 'react-native-incall-manager';
import {
    RTCView,
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    mediaDevices
} from 'react-native-webrtc';
import { View, Image } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { socket } from "../../../socket";
import { loadStorage } from "../../utils/storage";
import { distanceGet } from "../../utils/location";
import { BorderAnimation, roomName } from "../../navigations/MainTabNavigator";
import { RNText } from "../../components/RNText";
import { TextStyles } from "../../utils/TextStyles";
import { HP, VP } from "../../utils/Responsive";

function ReceiverScreen({ route, navigation }: { route: any, navigation: any }) {
    const { name, location } = route.params;

    const peerConnection = useRef<any>(
        new RTCPeerConnection({
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
                    urls: 'turn:freeturn.net:3478',
                    credential: 'free',
                    username: 'free',
                },
            ],
            iceTransportPolicy: 'all',
        }),
    );

    let remoteRTCMessage = useRef<any>(null);
    const otherUserId = useRef(null);
    const [remoteStream, setRemoteStream] = useState<any>(null);
    const [callerName, setCallerName] = useState<any>('');
    const [callerDistance, setCallerDistance] = useState<any>('');

    useEffect(() => {
        socket.on('connect', () => { });
        socket.on('connect_error', err => { });

        socket.on('receiveTeacherCall', (data) => {
            remoteRTCMessage.current = data.rtcMessage;
            otherUserId.current = data.callerId;
            processAccept();
        });

        socket.on('callAnswered', data => {
            remoteRTCMessage.current = data.rtcMessage;
            peerConnection.current.setRemoteDescription(
                new RTCSessionDescription(remoteRTCMessage.current),
            );
        });

        socket.on('ICEcandidate', data => {
            let message = data.rtcMessage;
            if (peerConnection.current) {
                peerConnection?.current
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
                        console.log('Error---------------', err);
                    });
            }
        });

        socket.on('endOfCall', data => {
            peerConnection.current.close();
            setRemoteStream(null);
            navigation.navigate('HomeScreen', {
            })
        });

        peerConnection.current.ontrack = (event: { streams: any[]; }) => {
            setRemoteStream(event.streams[0]);
        };

        // Setup ice handling
        peerConnection.current.onicecandidate = (event: { candidate: { sdpMLineIndex: any; sdpMid: any; candidate: any; }; }) => {
            if (event.candidate) {
                sendICEcandidate({
                    calleeId: otherUserId.current,
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

        peerConnection.current.onconnectionstatechange = (event: any) => {
            console.log(peerConnection.current.connectionState, '----------ReceiverScreen connectionState')
        }

        processToJoin();

        return () => {
            socket.off('callAnswered');
            socket.off('ICEcandidate');
            socket.off('receiveTeacherCall');
            socket.off('endOfCall');
            peerConnection.current.close();
            setRemoteStream(null);
        };
    }, []);

    useEffect(() => {
        (async () => {
            const savedLocation = await loadStorage('savedLocation');
            setCallerName(name || 'Unknown');
            setCallerDistance((location.lat > 0 && location.lng > 0) ? Math.round(+(distanceGet(savedLocation.latitude, savedLocation.longitude, location.lat, location.lng) || 0) / 1000) + ' km' : 'NA');
        })()
    }, []);

    async function processAccept() {
        peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(remoteRTCMessage.current),
        );
        const sessionDescription = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(sessionDescription);
        answerCall({
            callerId: otherUserId.current,
            rtcMessage: sessionDescription
        });
    }

    function answerCall(data: { callerId: null; rtcMessage: any; }) {
        socket.emit('answerCall', data);
        InCallManager.setSpeakerphoneOn(true);
        InCallManager.setForceSpeakerphoneOn(true);
    }

    function sendICEcandidate(data: { calleeId: null; rtcMessage: { label: any; id: any; candidate: any; }; }) {
        socket.emit('ICEcandidate', data);
    }

    async function processToJoin() {
        socket.emit('joinRoom', {
            roomId: roomName,
            userType: 'receiver'
        });
    }

    return (
        <>
            {remoteStream ? (
                <>
                    <RTCView
                        objectFit={'cover'}
                        style={{
                            flex: 1,
                            backgroundColor: '#050A0E',
                            zIndex: -1,
                        }}
                        streamURL={remoteStream.toURL()}
                        zOrder={0}
                    />
                </>
            ) : (<></>)}

            <LinearGradient
                colors={['#5E43DD', '#723F96']}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, justifyContent: "center", alignItems: "center", height: "100%", width: "100%", position: "absolute", bottom: 0 }}
            >
                <RNText textStyle={{ ...TextStyles.SOFIA_SEMI_BOLD, color: '#fff', textAlign: "center", fontSize: HP(16), marginBottom: VP(16) }}>{callerName}</RNText>

                <BorderAnimation animationStatus={true}>
                </BorderAnimation>

                <View style={{
                    position: "relative",
                    top: -220
                }}>
                    <Image source={require('../../assets/icons/mic.png')} style={{ width: HP(127), height: HP(127), }} />
                </View>

                <View style={{ marginTop: VP(-80) }}>
                    <RNText textStyle={{ ...TextStyles.SOFIA_SEMI_BOLD, color: '#fff', textAlign: "center", fontSize: HP(16) }}>"Distance: {callerDistance}"</RNText>
                </View>
            </LinearGradient>
        </>
    );
}

export default ReceiverScreen;