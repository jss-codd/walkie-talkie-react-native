import React, { useEffect, useState } from "react";
import { View, FlatList, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Sound from 'react-native-sound';
import { useIsFocused } from '@react-navigation/native';

import { loadStorage, saveStorage } from "../utils/storage";
import { TimeAgo } from "../utils/timeAgo";
import { showAlert } from "../utils/alert";
import Play from '../assets/svgs/play.svg';
import Delete from '../assets/svgs/delete.svg';
import Pause from '../assets/svgs/pause.svg';
import { AlertMessages, COLORS } from "../utils/constants";
import { TextStyles } from "../utils/TextStyles";
import { FS, HP, VP } from "../utils/Responsive";
import { RNText } from "./RNText";
import Loader from "./Loader";
import { reportUserCall } from "../utils/apiCall";

Sound.setCategory('Playback'); // true = mixWithOthers

const RecordingList = ({ reload }: { reload: number }) => {
    const isFocused = useIsFocused();

    const [recordingList, setRecordingList] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loader, setLoader] = useState(false);

    function playSound(item: any, index: number) {
        setRecordingList((pre: any) => (pre.map((d: any, i: number) => { return (i === index) ? { ...d, playStatus: true } : d })))

        const callback = (error: any, sound: any) => {
            if (error) {
                showAlert('Error on playing sound!', error.message);
                return;
            }

            sound.play((success: any) => {
                if (success) {
                    console.log('Successfully played the sound');
                } else {
                    console.log('Playback failed due to audio decoding errors');
                }
                // Release when it's done so we're not using up resources
                sound.release();

                setRecordingList((pre: any) => (pre.map((d: any, i: number) => { return (i === index) ? { ...d, playStatus: false } : d })))
            });
        };

        const sound: any = new Sound(item.data.audio_url, undefined, error => callback(error, sound));
    }

    const deleteNotification = async (item: any, index: number) => {
        let list: any = await loadStorage("recordingList");

        list = list.filter((d: any, i: number) => i !== index);

        saveStorage(list, 'recordingList');

        setRecordingList(list)
    }

    const reportUser = async (id: number) => {
        setLoader(true);
        try {
            let list: any = await loadStorage("recordingList");

            const result: any = await reportUserCall(id);

            if (result.success) {
                showAlert(AlertMessages.report_user_success.title, AlertMessages.report_user_success.message);


                list = list.map((d: any, i: number) => { return d.data.id === id ? { ...d, reported: true } : { ...d } });

                saveStorage(list, 'recordingList');

                setRecordingList(list)
            } else {
                showAlert(AlertMessages.report_user_failed.title, AlertMessages.report_user_failed.message);
            }
            setLoader(false);
        } catch (err: any) {
            setLoader(false);
            showAlert(err.message, "");
        }
    }

    const ThreadItem = ({ item, index }: { item: any, index: number }) => (
        <>
            <View style={styles.thread}>
                {item?.data?.profileImage ? (<Image loadingIndicatorSource={require("../assets/images/profile.png")} source={{ uri: item?.data?.profileImage }} style={styles.avatar} />) : (<Image source={require('../assets/images/profile.png')} style={styles.avatar} />)}

                <View style={styles.threadContent}>
                    <RNText textStyle={styles.username}>
                        Audio Message sent by <RNText textStyle={styles.sentBy}>{item.data.user_name}</RNText>
                    </RNText>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <RNText textStyle={styles.timestamp}>
                            {TimeAgo.inWords(item.sentTime)}
                        </RNText>
                        <TouchableOpacity
                            onPress={() => reportUser(item.data.id)}
                            disabled={(item?.reported === true) ? true : false}
                        >
                            <RNText textStyle={{ ...styles.timestamp, color: COLORS.RED, textDecorationColor: "red", textDecorationLine: "underline" }}>
                                {(item?.reported === true) ? `Reported` : `Report User`}
                            </RNText>
                        </TouchableOpacity>
                    </View>
                </View>

                <View>
                    {!item.playStatus ? (<Play onPress={() => playSound(item, index)} height={35} width={35} />) : (<Pause height={35} width={35} />)}
                </View>
                <View>
                    <Delete onPress={() => deleteNotification(item, index)} height={32} width={32} />
                </View>
            </View>
            <View style={styles.line}></View>
        </>
    );

    const loadRecordingFromStorage = async () => {
        let list: any = await loadStorage("recordingList");

        list = Array.isArray(list) ? list.map((d: any) => { return { ...d, playStatus: false } }) : [];

        setRecordingList(list);

        setIsRefreshing(false)
    }

    const onRefresh = () => {
        setIsRefreshing(true)

        loadRecordingFromStorage();
    };

    const emptyComponent = () => {
        return (
            <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ color: "#666", fontSize: 18 }}>oops! There's no data here!</Text>
            </View>
        );
    };

    useEffect(() => {
        if (isFocused) {
            loadRecordingFromStorage();
        }
    }, [isFocused, reload])

    return (
        <>
            <Loader loading={loader} />
            <FlatList
                data={recordingList}
                renderItem={({ item, index, separators }) => <ThreadItem item={item} index={index} />}
                contentContainerStyle={styles.container}
                onRefresh={onRefresh}
                refreshing={isRefreshing}
                ListEmptyComponent={emptyComponent}
            // ListHeaderComponent={VoiceRecorder}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.WHITE,
        paddingHorizontal: HP(16),
        paddingVertical: VP(19),
    },
    thread: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    avatar: {
        width: 47,
        height: 47,
        borderRadius: 25,
        marginRight: 12,
    },
    threadContent: {
        flex: 1,
        paddingHorizontal: HP(5),
    },
    username: {
        ...TextStyles.SOFIA_SEMI_BOLD,
        fontSize: FS(14),
        marginBottom: 4,
        color: '#0F0F0F'
    },
    content: {
        marginBottom: 4,
    },
    timestamp: {
        ...TextStyles.SOFIA_REGULAR,
        color: '#232323',
        fontSize: FS(12),
    },
    sentBy: {
        color: "#7609C3",
        fontWeight: 'bold'
    },
    line: {
        height: 1,
        backgroundColor: "#D2D2D2",
        width: "100%",
        flexDirection: "row",
        marginTop: VP(19),
        marginBottom: VP(19),
        justifyContent: 'center',
        alignItems: 'center',
        display: "flex",
    },
});

export default RecordingList;
