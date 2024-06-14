import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, Text, StyleSheet, Image, Button, Alert, Switch } from 'react-native';
import { loadStorage } from '../utils/storage';
import { BACKEND_URL } from '../utils/constants';
import axios from 'axios';
import { showAlert } from '../utils/alert';
import Loader from '../components/Loader';

function SettingsScreen(): React.JSX.Element {
    const [isEnabled, setIsEnabled] = useState(false);
    const [loader, setLoader] = useState(false);

    const toggleNotification = async (e: boolean) => {
        setIsEnabled(e);
        setLoader(true)
        const token: any = await loadStorage();

        const dataPayload = {
            "token": token?.token || "",
            "status": e
        };

        axios.put(BACKEND_URL + '/notification-status', dataPayload)
            .then(response => {
                console.log("response.data: ", response.data);
                setIsEnabled(e);
                setLoader(false)
            })
            .catch(error => {
                setLoader(false);
                showAlert('Error to change', "");
                setIsEnabled(previousState => !previousState)
                console.error("Error sending data: ", error);
            });
    }

    const fetchNotificationStatus = async () => {
        setLoader(true);
        const token: any = await loadStorage();

        const dataPayload = {
            "token": token?.token || ""
        };

        axios.post(BACKEND_URL + '/notification-status', dataPayload)
            .then(response => {
                console.log(response.data, 'response.data');
                setIsEnabled(response.data.status);
                setLoader(false)
            })
            .catch(error => {
                setLoader(false);
                showAlert('Error to fetch', "");
                console.error("Error fetch data: ", error);
            });
    }

    useEffect(() => {
        fetchNotificationStatus();
    }, [])

    return (
        <View style={{ margin: 10, flexDirection: 'row', gap: 10 }}>
            <Loader loading={loader} />
            <View style={{ flexBasis: 0, flexGrow: 1 }}>
                <Text style={{ fontSize: 18, color: "#666", fontWeight: "bold" }}>Receive Notification:</Text>
            </View>
            <View style={{ flexBasis: 0, flexGrow: 1 }}>
                <Switch
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    value={isEnabled}
                    onValueChange={toggleNotification}
                />
            </View>
        </View>
    )
}

export default SettingsScreen;