import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, mediaDevices, RTCView } from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';

import { socket } from '../../socket';
import { askInitialPermission, requestAudioPermissions } from '../utils/permissions';
import Loader from './Loader';
import { LinearGradientComp } from '../screens/main/HomeScreen';
import LinearGradient from 'react-native-linear-gradient';
import { HP } from '../utils/Responsive';
import Microphone from '../assets/svgs/microphone.svg';
import PhoneOff from '../assets/svgs/phone-off.svg';
import { RNText } from './RNText';
import { SettingContext } from '../context/SettingContext';

const configuration = {
  iceServers: [
    // { urls: "stun:stun.stunprotocol.org" },
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    {
      url: 'turn:freeturn.net:3478',
      credential: 'free',
      username: 'free',
    },
  ],
  // iceCandidatePoolSize: 10,
};

const roomName = 'room';

let sessionConstraints = {
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: false,
    VoiceActivityDetection: true
  }
};

const CustomSocket = ({ iconContainer, iconText, navigation }: { iconContainer: any, iconText: any, navigation: any }) => {
  const settings = useContext<any>(SettingContext);

  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStreams, setRemoteStreams] = useState<any[]>([]);
  const [micOn, setMicOn] = useState(false);
  const [loader, setLoader] = useState(false);
  const [timerDigit, setTimerDigit] = useState<any>(0);

  const peerConnections = useRef<any>({});


  useEffect(() => {
    // socket.emit('join', roomName);

    const init = async () => {
      InCallManager.setSpeakerphoneOn(true);

      const granted = await askInitialPermission();

      if (!granted) {
        return;
      }

      const stream = await mediaDevices.getUserMedia({ video: false, audio: true });
      setLocalStream(stream);

      socket.on('user-joined', id => handleUserJoined(id, stream));
      socket.on('offer', (id, description) => handleOffer(id, description, stream));
      socket.on('answer', (id, description) => handleAnswer(id, description));
      socket.on('candidate', (id, candidate) => handleCandidate(id, candidate));
      socket.on('user-disconnected', id => handleUserDisconnected(id));

      if (stream) {
        stream.getAudioTracks().forEach(track => {
          track.enabled = false;
        });
      }
    };

    init();

    return () => {
      socket.off();
    };
  }, []);

  const handleUserJoined = async (id, stream) => {
    try {
      console.log(settings.proflieDetails.mobile, '-----------handleUserJoined');

      if (!peerConnections.current[id]) {
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnections.current[id] = peerConnection;

        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        peerConnection.onicecandidate = event => {
          console.log(event.candidate, 'event.candidate')
          if (event.candidate) {
            socket.emit('candidate', roomName, event.candidate);
          }
        };

        peerConnection.ontrack = event => {
          // setRemoteStreams(prevStreams => ([...new Map([...prevStreams, event.streams[0]].map(item =>
          //   [item['id'], item])).values()]));

          // event.streams[0].getTracks().forEach(track => {
          //   const remoteStream = remoteStreams.filter(d => id  === event.streams[0]['id'])[0] ?? new MediaStream([])
  
          //   remoteStream.addTrack(track)
          // })

          setRemoteStreams(prevStreams => [...prevStreams, event.streams[0]]);
        };

        peerConnection.onconnectionstatechange = event => {
          console.log(settings.proflieDetails.mobile, peerConnection.connectionState, '---------peerConnection.connectionState')
        }

        const offer = await peerConnection.createOffer(sessionConstraints);
        await peerConnection.setLocalDescription(offer);
        socket.emit('offer', roomName, offer);
      }
    } catch (error) {
      console.error('Error handleUserJoined: ', error);
    }
  };

  const handleOffer = async (id, description, stream) => {
    try {
      console.log(settings.proflieDetails.mobile, '-----------handleOffer')

      if (!peerConnections.current[id]) {
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnections.current[id] = peerConnection;

        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        peerConnection.onicecandidate = event => {
          if (event.candidate) {
            socket.emit('candidate', roomName, event.candidate);
          }
        };

        peerConnection.ontrack = event => {
          // setRemoteStreams(prevStreams => ([...new Map([...prevStreams, event.streams[0]].map(item =>
          //   [item['id'], item])).values()]));

          // event.streams[0].getTracks().forEach(track => {
          //   const remoteStream = remoteStreams.filter(d => id  === event.streams[0]['id'])[0] ?? new MediaStream([])
  
          //   remoteStream.addTrack(track)
          // })

          setRemoteStreams(prevStreams => [...prevStreams, event.streams[0]]);
        };

        await peerConnection.setRemoteDescription(new RTCSessionDescription(description));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('answer', roomName, answer);
      }
    } catch (error) {
      console.error('Error handleOffer: ', error);
    }
  };

  const handleAnswer = (id, description) => {
    try {
      console.log(settings.proflieDetails.mobile, '-----------handleAnswer');

      const peerConnection = peerConnections.current[id];
      peerConnection.setRemoteDescription(new RTCSessionDescription(description));

    } catch (error) {
      console.error('Error handleAnswer: ', error);
    }
  };

  const handleCandidate = (id, candidate) => {
    try {
      console.log(settings.proflieDetails.mobile, '------------handleCandidate')
      const peerConnection = peerConnections.current[id];
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handleCandidate: ', error);
    }
  };

  const handleUserDisconnected = id => {
    try {
      console.log(settings.proflieDetails.mobile, '-----------handleUserDisconnected')
      const peerConnection = peerConnections.current[id];
      if (peerConnection) {
        peerConnection.close();
        delete peerConnections.current[id];
      }
      setRemoteStreams(prevStreams => prevStreams.filter(stream => stream.id !== id));
    } catch (error) {
      console.error('Error handleUserDisconnected: ', error);
    }
  };

  const stopLocalStream = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
    }

    setMicOn(false);
  }

  const startLocalStream = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = true;
      });

    }
    setMicOn(true);

    // socket.emit('join', roomName);
  }

  return (
    <>
      {localStream && (
        <RTCView streamURL={localStream.toURL()} style={{ width: '0%', height: '0%', position: "absolute" }} />
      )}
      {remoteStreams.map(stream => (
        <RTCView key={Math.random() + stream.id} streamURL={stream.toURL()} style={{ width: '0%', height: '0%', position: "absolute" }} />
      ))}

      <Loader loading={loader} />

      <View style={{ alignItems: "center" }}>
        <LinearGradientComp onOffer={false} status={micOn} style={{ top: -5 }}>
          <TouchableOpacity
            style={{ alignItems: "flex-start" }}
            onPress={() => (!micOn ? startLocalStream() : stopLocalStream())}
          // disabled={onOffer}
          >
            <View>
              <LinearGradient
                // colors={onOffer ? ['rgb(255, 0, 0)', 'rgb(0, 0, 0)'] : ['#E5E5E5', '#E5E5E5']}
                colors={['#E5E5E5', '#E5E5E5']}
                start={{ x: 0.0, y: 1.0 }} end={{ x: 1.0, y: 1.0 }}
                style={{ borderRadius: HP(100), padding: 15 }}
              >
                <View style={{ ...iconContainer, backgroundColor: "#E0D0D0", marginBottom: 0 }}>
                  {!micOn ? (<Microphone width={32} height={32} />) : (<PhoneOff width={32} height={32} />)}
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
});

export default CustomSocket;
