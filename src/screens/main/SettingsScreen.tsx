import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, FlatList, Text, StyleSheet, Image, Button, Alert, Switch } from 'react-native';
import axios from 'axios';

import { loadStorage } from '../../utils/storage';
import { BACKEND_URL } from '../../utils/constants';
import { showAlert } from '../../utils/alert';
import Loader from '../../components/Loader';
import { SettingContext } from '../../context/SettingContext';

function SettingsScreen(): React.JSX.Element {
    const settings = useContext<any>(SettingContext);

    const notificationStatus = settings.notificationStatus;
    const audioPlayStatus = settings.audioPlayStatus;

    const [loader, setLoader] = useState(false);
    const [tokenShow, setTokenShow] = useState("");

    const toggleNotification = async (e: boolean) => {
        setLoader(true);

        const token: any = await loadStorage();

        const dataPayload = {
            "token": token?.token || "",
            "status": e
        };

        axios.put(BACKEND_URL + '/notification-status', dataPayload)
            .then(response => {
                console.log("response.data: ", response.data);
                settings.handler('notificationStatus', e)
                setLoader(false)
            })
            .catch(error => {
                setLoader(false);
                showAlert('Error to change', "");
                console.warn("Error sending data: ", error);
            });
    }

    const togglePlayAudio = async (e: boolean) => {
        setLoader(true)
        const token: any = await loadStorage();

        const dataPayload = {
            "token": token?.token || "",
            "status": e
        };

        axios.put(BACKEND_URL + '/audio-play-status', dataPayload)
            .then(response => {
                console.log("response.data: ", response.data);
                settings.handler('audioPlayStatus', e)
                setLoader(false)
            })
            .catch(error => {
                setLoader(false);
                showAlert('Error to change', "");
                console.warn("Error sending data: ", error);
            });
    }

    useEffect(() => {
        loadStorage().then(
            token => {
                setTokenShow(token?.token || '')
            },
            err => {
                console.error(err, 'token error'); // Error!
            },
        );
    }, [])

    return (
        <View style={{ margin: 10 }}>
            <Loader loading={loader} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flexBasis: 0, flexGrow: 1 }}>
                    <Text style={{ fontSize: 18, color: "#666", fontWeight: "bold" }}>Receive Notification:</Text>
                </View>
                <View style={{ flexBasis: 0, flexGrow: 1 }}>
                    <Switch
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={notificationStatus ? '#f5dd4b' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        value={notificationStatus}
                        onValueChange={toggleNotification}
                    />
                </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                <View style={{ flexBasis: 0, flexGrow: 1 }}>
                    <Text style={{ fontSize: 18, color: "#666", fontWeight: "bold" }}>Play Audio:</Text>
                </View>
                <View style={{ flexBasis: 0, flexGrow: 1 }}>
                    <Switch
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={audioPlayStatus ? '#f5dd4b' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        value={audioPlayStatus}
                        onValueChange={togglePlayAudio}
                    />
                </View>
            </View>
            {/* <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                <Text selectable={true} style={{ color: "#666" }}>Token: {tokenShow}</Text>
            </View> */}
        </View>
    )
}

export default SettingsScreen;