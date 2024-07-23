import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { Button, View, Animated, TouchableOpacity, Image, StyleSheet, Easing } from 'react-native';
import InCallManager from 'react-native-incall-manager';

import HomeScreen from '../screens/main/HomeScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import RecordingListScreen from '../screens/main/RecordingListScreen';
import { navigationString } from '../utils/navigationString';
import ProfileScreen from '../screens/main/ProfileScreen';
import Microphone from '../assets/svgs/microphone.svg';
import { HP, VP } from '../utils/Responsive';
import ProfileDrawer from '../components/ProfileDrawer';
import { RNText } from '../components/RNText';
import { TextStyles } from '../utils/TextStyles';
import { socket } from '../../socket';
import {
    RTCView,
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    mediaDevices,
    MediaStream,
    MediaStreamTrack,
} from 'react-native-webrtc';
import { useIsFocused } from '@react-navigation/native';
import { askInitialPermission } from '../utils/permissions';
import { loadStorage } from '../utils/storage';
import { distanceGet } from '../utils/location';

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

function ModalScreen({ route, navigation }: { route: any, navigation: any }) {
    const { username, distance } = route.params;
    console.log(route.params, 'route.params')
    return (
        <LinearGradient
            colors={['#2D3436', '#000000']}
            start={{ x: 1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, justifyContent: "center", alignItems: "center", height: "100%", width: "100%", position: "absolute", bottom: 0 }}
        >
            <View style={{
                padding: 15,
                backgroundColor: '#E5E5E5',
                borderRadius: 100,
                borderWidth: 1,
                borderColor: '#E5E5E5'
            }}>
                <View style={{
                    backgroundColor: "#E0D0D0", marginBottom: 0, padding: HP(14),
                    borderRadius: HP(50)
                }}>
                    <Microphone width={64} height={64} />
                </View>
            </View>
            <View style={{ marginVertical: VP(30) }}>
                <RNText textStyle={{ ...TextStyles.SOFIA_SEMI_BOLD, fontSize: HP(22), color: "#FFF", textAlign: "center" }}>Caller: {username}</RNText>

                <RNText textStyle={{ ...TextStyles.SOFIA_SEMI_BOLD, fontSize: HP(22), color: "#FFF", marginVertical: VP(10), textAlign: "center" }}>Distance: {distance}</RNText>
            </View>
            {/* <Button onPress={() => navigation.goBack()} title="Dismiss" /> */}
        </LinearGradient>
    );
}

const roomName = 'room';

let sessionConstraints = {
    mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: false,
        VoiceActivityDetection: true
    }
};

let peerConnection: any = {};
let localStreamData: any;

const BorderAnimation = () => {
    const [fadeAnim1] = useState(new Animated.Value(1));

    React.useEffect(() => {
        const runAnimation = () => {
            Animated.sequence([
                Animated.timing(fadeAnim1, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                    easing: Easing.ease,
                }),
                Animated.timing(fadeAnim1, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                    easing: Easing.ease,
                }),
            ]).start(() => runAnimation());
        };

        runAnimation();
    }, []);

    return (
        <Animated.View
            style={{
                opacity: fadeAnim1,
            }}>
            <View style={{
                padding: 26,
                borderRadius: 150,
                borderWidth: 1,
                borderColor: '#929292'
            }}>
                <Animated.View
                    style={{
                        opacity: fadeAnim1,
                    }}>
                    <View style={{
                        padding: 26,
                        borderRadius: 150,
                        borderWidth: 1,
                        borderColor: '#929292'
                    }}>
                        <Animated.View
                            style={{
                                opacity: fadeAnim1,
                            }}>
                            <View style={{
                                padding: 100,
                                borderRadius: 150,
                                borderWidth: 2,
                                borderColor: '#3BB9F2'
                            }}>
                            </View>
                        </Animated.View>
                    </View>
                </Animated.View>
            </View>
        </Animated.View>
    );
};

function CallerScreen({ route, navigation }: { route: any, navigation: any }) {
    const [remoteStreams, setRemoteStreams] = useState<any[]>([]);
    const [micOn, setMicOn] = useState(false);
    const [loader, setLoader] = useState(false);
    const [timerDigit, setTimerDigit] = useState<any>(0);

    const [remoteStream, setRemoteStream] = useState<any>([]);
    const [localStream, setlocalStream] = useState<any>(null);
    const [timerInterval, setTimerInterval] = useState<any>(null);
    const [leaveCallCount, setLeaveCallCount] = useState<any>(0);
    const [timerState, setTimerState] = useState<any>(null);
    const [callConnected, setCallConnected] = useState<any>(false);

    let remoteRTCMessage = useRef<any>(null);
    const otherUserId = useRef(null);

    useEffect(() => {
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
                            setCallConnected(true);
                            const timerIntervalGet = setInterval(() => {
                                setTimerDigit((pre: number) => ++pre);
                            }, 1000);
                            setTimerInterval(timerIntervalGet);

                            const timer = setTimeout(() => {
                                setLeaveCallCount((pre: number) => ++pre);
                            }, 15000)
                            setTimerState(timer);
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
                        sendCall({
                            rtcMessage: sessionDescription,
                            roomId: data.sender,
                        });
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

                        sendCall({
                            rtcMessage: sessionDescription,
                            roomId: data.sender,
                        });
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

        let isFront = true;

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
            // clearInterval(timerIntervalGet);
            // clearTimeout(timer);
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
                <BorderAnimation>
                </BorderAnimation>

                <TouchableOpacity style={{
                    position: "relative",
                    top: -220
                }}
                    onPress={() => { leaveCall() }}
                >
                    <Image source={require('../assets/icons/mic.png')} style={{ width: HP(127), height: HP(127) }} />
                </TouchableOpacity>

                <View style={{ marginTop: VP(-80) }}>
                    <RNText textStyle={{ ...TextStyles.SOFIA_SEMI_BOLD, color: '#fff', textAlign: "center", fontSize: HP(16), }}>{!callConnected ? '"Connecting..."' : '"Click on mic for cancel"'}</RNText>

                    <RNText textStyle={{ ...TextStyles.SOFIA_SEMI_BOLD, color: '#fff', textAlign: "center", fontSize: HP(20), marginTop: VP(19) }}>00:00:{(timerDigit.toString().length >= 2) ? timerDigit : '0' + timerDigit}</RNText>
                </View>
            </LinearGradient>
        </>
    );
}

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

                <BorderAnimation>
                </BorderAnimation>

                <View style={{
                    position: "relative",
                    top: -220
                }}>
                    <Image source={require('../assets/icons/mic.png')} style={{ width: HP(127), height: HP(127), }} />
                </View>

                <View style={{ marginTop: VP(-80) }}>
                    <RNText textStyle={{ ...TextStyles.SOFIA_SEMI_BOLD, color: '#fff', textAlign: "center", fontSize: HP(16) }}>"Distance: {callerDistance}"</RNText>
                </View>


                {/* <View style={{
                    paddingTop: 26,
                    paddingBottom: 26,
                    paddingLeft: 26,
                    paddingRight: 26,
                    borderRadius: 150,
                    borderWidth: 1,
                    borderColor: '#929292'
                }}>
                    <View style={{
                        paddingTop: 26,
                        paddingBottom: 26,
                        paddingLeft: 26,
                        paddingRight: 26,
                        borderRadius: 127,
                        borderWidth: 1,
                        borderColor: '#929292'
                    }}>
                        <View style={{
                            paddingTop: 26,
                            paddingBottom: 26,
                            paddingLeft: 26,
                            paddingRight: 26,
                            borderRadius: 127,
                            borderWidth: 2,
                            borderColor: '#3BB9F2'
                        }}>
                            <Image source={require('../assets/icons/mic.png')} style={{ width: HP(127), height: HP(127), }} />
                        </View>
                    </View>
                </View>
                <View style={{ marginTop: VP(35) }}>
                    <RNText textStyle={{ ...TextStyles.SOFIA_SEMI_BOLD, color: '#fff', textAlign: "center", fontSize: HP(16) }}>"Distance: {callerDistance}"</RNText>
                </View> */}
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
});

const MainTabNavigator: React.FunctionComponent = () => {
    const Stack = createNativeStackNavigator<any>();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name={navigationString.HOME_SCREEN}
                component={HomeScreen}
            />
            <Stack.Screen
                name={navigationString.PROFILE_SCREEN}
                component={ProfileScreen}
            />
            <Stack.Screen
                name={navigationString.SETTING_SCREEN}
                component={SettingsScreen}
            />
            <Stack.Screen
                name={navigationString.LAST_TALK}
                component={RecordingListScreen}
            />

            <Stack.Group screenOptions={{ presentation: 'transparentModal' }}>
                <Stack.Screen name="MyModal" component={ModalScreen} />
                <Stack.Screen name="ProfileDrawer" component={ProfileDrawer} />
                <Stack.Screen name="CallerScreen" component={CallerScreen} />
                <Stack.Screen name="ReceiverScreen" component={ReceiverScreen} />
            </Stack.Group>
        </Stack.Navigator>
    );
};

export default MainTabNavigator;