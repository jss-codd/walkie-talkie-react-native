import React, { useState, useRef, useEffect } from 'react';
import { View, Button, Text, PermissionsAndroid, Platform, Alert, Image, StyleSheet, Switch } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { request, PERMISSIONS } from 'react-native-permissions';
import RNFetchBlob from 'rn-fetch-blob'
import { BACKEND_URL } from '../utils/constants'
import Loader from './Loader';
import { loadStorage } from '../utils/storage';
import axios from 'axios';

const audioRecorderPlayer = new AudioRecorderPlayer();

const UPLOAD_URL = BACKEND_URL;

const VoiceRecorder = () => {
    const [recording, setRecording] = useState(false);
    const [recordTime, setRecordTime] = useState('0');
    const [audioPath, setAudioPath] = useState('');
    const [loader, setLoader] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [timerState, setTimerState] = useState<any>(null);

    const dirs = RNFetchBlob.fs.dirs;
    const path = Platform.select({
        ios: 'sound.m4a',
        android: `${dirs.CacheDir}/sound.mp3`,
    });

    const getMimeType = (fileExtension: string) => {
        // Define a map of file extensions to MIME types
        const mimeTypes = {
            m4a: 'audio/m4a',
            mp3: 'audio/mp3',
        };

        // Get the MIME type from the map based on the file extension
        const mimeType = mimeTypes[fileExtension.toLowerCase()];

        // Return the MIME type or a default value if not found
        return mimeType || 'application/octet-stream'; // Default MIME type for unknown file types
    };

    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            ]);

            if (
                ((granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED) || (granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) &&
                ((granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED) || (granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) &&
                ((granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED) || (granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN))
            ) {
                return true;
            } else {
                Alert.alert('Permissions not granted');
                return false;
            }
        } else {
            const result = await request(PERMISSIONS.IOS.MICROPHONE);
            return result === 'granted';
        }
    };

    const onStartRecord = async () => {
        const hasPermissions = await requestPermissions();
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
        setRecordTime('0');
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
        setRecordTime('0');
        setAudioPath(result);
        const token: any = await loadStorage();

        //call curl here
        RNFetchBlob.fetch(
            'POST',
            UPLOAD_URL + '/upload',
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
                else Alert.alert('Recording Failed');
            })
            .catch(err => {
                setLoader(false);
                Alert.alert('Recording Failed', err.message);
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
                setLoader(false)
                Alert.alert('Error to change');
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
                setLoader(false)
                Alert.alert('Error to fetch');
                console.error("Error fetch data: ", error);
            });
    }

    useEffect(() => {
        fetchNotificationStatus();
    }, [])

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: '10%' }}>
            <Loader loading={loader} />
            <Image style={styles.logo} source={require('../icons/logo.png')} width={100} height={100} alt='logo' />
            <Text style={{ marginBottom: 20, marginTop: 50, fontSize: 20, color: "#666" }}>Recording Time: {recordTime}</Text>

            <View style={styles.thread}>
                <View>
                    <Button title={recording ? "Recording Running" : "Start Recording"} onPress={recording ? void (0) : onStartRecord} />
                </View>
                <View>
                    {recording && (<Button color="#dc3545" title={"Cancel Recording"} onPress={() => onCancelRecord(timerState)} />)}
                </View>
            </View>


            <View style={{ marginBottom: 20, marginTop: 20 }}>
                <Text style={{ fontSize: 20, color: "#666" }}>Receive Notification: <Switch
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    style={{}}
                    value={isEnabled}
                    onValueChange={toggleNotification}
                /></Text>
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
