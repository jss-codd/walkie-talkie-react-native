import React, { useState, useRef, useEffect } from 'react';
import { View, Button, Text, PermissionsAndroid, Platform, Alert, Image, StyleSheet, Switch } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { request, PERMISSIONS } from 'react-native-permissions';
import RNFetchBlob from 'rn-fetch-blob'
import axios from 'axios';

import { BACKEND_URL } from '../utils/constants'
import Loader from './Loader';
import { loadStorage } from '../utils/storage';
import Clock from '../assets/svgs/clock.svg';
import { requestAudioPermissions } from '../utils/permissions';
import { showAlert } from '../utils/alert';

const audioRecorderPlayer = new AudioRecorderPlayer();

const dirs = RNFetchBlob.fs.dirs;
const path = Platform.select({
    ios: 'sound.m4a',
    android: `${dirs.CacheDir}/sound.mp3`,
});

const getMimeType = (fileExtension: string) => {
    // Define a map of file extensions to MIME types
    const mimeTypes: any = {
        m4a: 'audio/m4a',
        mp3: 'audio/mp3',
    };

    // Get the MIME type from the map based on the file extension
    const mimeType = mimeTypes[fileExtension.toLowerCase()];

    // Return the MIME type or a default value if not found
    return mimeType || 'application/octet-stream'; // Default MIME type for unknown file types
};

const VoiceRecorder = () => {
    const [recording, setRecording] = useState(false);
    const [recordTime, setRecordTime] = useState('00:00:00');
    const [audioPath, setAudioPath] = useState('');
    const [loader, setLoader] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [timerState, setTimerState] = useState<any>(null);

    const onStartRecord = async () => {
        const hasPermissions = await requestAudioPermissions();
        if (!hasPermissions) return;

        setRecording(true);
        const result = await audioRecorderPlayer.startRecorder(path);
        audioRecorderPlayer.addRecordBackListener((e) => {
            setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
            return;
        });
        setAudioPath(result);

        const timer = setTimeout(() => {
            onStopRecord();
        }, 10000)

        setTimerState(timer);
    };

    const onCancelRecord = async (timer: string | number | NodeJS.Timeout | undefined) => {
        await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();

        clearTimeout(timer);
        setRecording(false);
        setRecordTime('00:00:00');
        setAudioPath('');
    }

    const onStopRecord = async () => {
        setLoader(true);
        setRecording(false);
        const result = await audioRecorderPlayer.stopRecorder();
        const fileExtension = result.split('.').pop();
        if (!fileExtension) return;
        const mimeType = getMimeType(fileExtension);
        const fileNameWithExtension = 'sound.' + fileExtension;
        audioRecorderPlayer.removeRecordBackListener();
        setRecordTime('00:00:00');
        setAudioPath(result);
        const token: any = await loadStorage();

        //call curl here
        RNFetchBlob.fetch(
            'POST',
            BACKEND_URL + '/upload',
            {
                // this is required, otherwise it won't be process as a multipart/form-data request
                'Content-Type': 'multipart/form-data',
            },
            [
                {
                    name: 'file',
                    filename: fileNameWithExtension,
                    // upload a file from asset is also possible in version >= 0.6.2
                    data: RNFetchBlob.wrap(
                        Platform.OS === 'ios'
                            ? result.replace('file://', '')
                            : result,
                    ),
                    // type: mimeType,
                },
                {
                    name: 'token',
                    data: token?.token || '',
                },
            ],
        )
            // listen to upload progress event
            .uploadProgress((written, total) => {
                console.log('uploaded', written / total);
            })
            // listen to download progress event
            .progress((received, total) => {
                console.log('progress', received / total);
            })
            .then(resp => {
                const res = JSON.parse(resp.data) || { success: false };
                setLoader(false);
                if (res?.success) Alert.alert('Recording Success');
                else showAlert('Recording Failed', "");
            })
            .catch(err => {
                setLoader(false);
                showAlert('Recording Failed', err.message);
                console.log(err, 'err');
            });
    };

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
                // console.log(response.data, 'response.data');
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: '10%' }}>
            <Loader loading={loader} />
            <Image style={styles.logo} source={require('../icons/logo.png')} alt='logo' />

            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 20, gap: 10 }}>
                <View>
                    <Clock height={35} width={35} />
                </View>
                <View>
                    <Text style={{ fontSize: 20, color: "#666" }}>
                        {recordTime}
                    </Text>
                </View>
            </View>

            <View style={styles.thread}>
                <View>
                    <Button title={recording ? "Recording Running" : "Start Recording"} onPress={recording ? void (0) : onStartRecord} />
                </View>
                <View>
                    {recording && (<Button color="#dc3545" title={"Cancel Recording"} onPress={() => onCancelRecord(timerState)} />)}
                </View>
            </View>

            <View style={{ marginTop: 20, flexDirection: 'row' }}>
                <View>
                    <Text style={{ fontSize: 18, color: "#666" }}>Receive Notification:</Text>
                </View>
                <View>
                    <Switch
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        value={isEnabled}
                        onValueChange={toggleNotification}
                    />
                </View>
            </View>
        </View>
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
    }
});

export default VoiceRecorder;
