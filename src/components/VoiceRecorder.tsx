import React, { useState } from 'react';
import { View, Button, Text, Platform, Alert, StyleSheet } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFetchBlob from 'rn-fetch-blob'

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

const VoiceRecorder = ({ children }) => {
    const [recording, setRecording] = useState(false);
    const [recordTime, setRecordTime] = useState('00:00:00');
    const [audioPath, setAudioPath] = useState('');
    const [loader, setLoader] = useState(false);
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

    return (
        <View style={{ marginBottom: '1%', }}>
            <Loader loading={loader} />

            <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 20, gap: 10, justifyContent: "center" }}>
                <View>
                    <Clock height={35} width={35} />
                </View>
                <View>
                    <Text style={{ fontSize: 20, color: "#666" }}>
                        {recordTime}
                    </Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
                {!recording ? (
                    <View>
                        <Button title={"Start Recording"} onPress={onStartRecord} />
                    </View>
                ) : (
                    <View>
                        <Button color="#dc3545" title={"Cancel Recording"} onPress={() => onCancelRecord(timerState)} />
                    </View>
                )}

                {children}
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
