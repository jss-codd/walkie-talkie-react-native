import React, { useEffect, useState } from "react";
import { View, FlatList, Text, StyleSheet, Image } from 'react-native';
import Sound from 'react-native-sound';
import { useIsFocused } from '@react-navigation/native';

import { loadStorage, saveStorage } from "../utils/storage";
import { TimeAgo } from "../utils/timeAgo";
import { showAlert } from "../utils/alert";
import Play from '../assets/svgs/play.svg';
import Delete from '../assets/svgs/delete.svg';
import Pause from '../assets/svgs/pause.svg';
import { COLORS } from "../utils/constants";
import { TextStyles } from "../utils/TextStyles";
import { FS, HP, VP } from "../utils/Responsive";
import { RNText } from "./RNText";

Sound.setCategory('Playback'); // true = mixWithOthers

const RecordingList = ({ reload }: { reload: number }) => {
    const isFocused = useIsFocused();

    const [recordingList, setRecordingList] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false)

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

    const ThreadItem = ({ item, index }: { item: any, index: number }) => (
        <View style={styles.thread}>
            <Image source={require('../assets/images/image.png')} style={styles.avatar} />
            <View style={styles.threadContent}>
                <RNText textStyle={styles.username}>
                    Audio Message sent by <RNText textStyle={styles.sentBy}>{item.data.user_name}</RNText>
                </RNText>
                <RNText textStyle={styles.timestamp}>
                    {TimeAgo.inWords(item.sentTime)}
                </RNText>
            </View>
            <View>
                {!item.playStatus ? (<Play onPress={() => playSound(item, index)} height={35} width={35} />) : (<Pause height={35} width={35} />)}
            </View>
            <View>
                <Delete onPress={() => deleteNotification(item, index)} height={32} width={32} />
            </View>
        </View>
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
        alignItems: 'flex-start',
        marginBottom: 16
    },
    avatar: {
        width: 47,
        height: 47,
        borderRadius: 25,
        marginRight: 12,
    },
    threadContent: {
        flex: 1,
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
    }
});

export default RecordingList;
