import React, { useContext, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { requestAudioPermissions } from '../utils/permissions';
import Microphone from '../assets/svgs/microphone.svg';
import { LinearGradientComp } from '../screens/main/HomeScreen';
import { socket } from '../../socket';
import { HP } from '../utils/Responsive';
import { SettingContext } from '../context/SettingContext';
import { showFadeAlert } from '../utils/alert';
import { roomName } from '../navigations/MainTabNavigator';
import { useSelector } from 'react-redux';
import { notificationStatus } from '../redux/features/settings';

const VoiceRecorder = ({ iconContainer, navigation }: { iconContainer: any, iconText: any, navigation: any }) => {
    const NotificationStatus = useSelector(notificationStatus);

    const buttonRef = useRef<any>(null);

    useEffect(() => {
        if (NotificationStatus) {
            socket.on('calling', async (name, location) => {
                try {
                    navigation.navigate('ReceiverScreen', {
                        name: name,
                        location: location
                    })
                } catch (error) {
                    console.error('Error answering call: ', error);
                }
            });

            return () => {
                socket.off('calling');
            }
        }
    }, [NotificationStatus])

    const startLocalStream = async () => {
        try {
            const granted = await requestAudioPermissions();

            if (!granted) {
                return;
            }

            socket.emit('checkCall', roomName, (data: boolean) => {
                if (data) {
                    navigation.navigate('CallerScreen')
                } else {
                    showFadeAlert('Can not connect, Call is already initiated by another user!');
                }
            });
        } catch (error) {
            console.error('Error startLocalStream: ', error);
        }
    };

    return (
        <>
            <View style={{ alignItems: "center" }}>
                <LinearGradientComp onOffer={false} status={false} style={{ top: -5, }}>
                    <TouchableOpacity
                        ref={buttonRef}
                        style={{ alignItems: "flex-start" }}
                        onPress={() => startLocalStream()}
                    >
                        <View style={{}}>
                            <LinearGradient
                                colors={['#E5E5E5', '#E5E5E5']}
                                start={{ x: 0.0, y: 1.0 }} end={{ x: 1.0, y: 1.0 }}
                                style={{ borderRadius: HP(100), padding: 15 }}
                            >
                                <View style={{ ...iconContainer, backgroundColor: "#E0D0D0", marginBottom: 0 }}>
                                    <Microphone width={32} height={32} />
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
});

export default VoiceRecorder;
