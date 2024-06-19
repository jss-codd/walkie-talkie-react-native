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

Sound.setCategory('Playback'); // true = mixWithOthers

const RecordingList = () => {
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

        const sound: any = new Sound(item.data.audio_url, null, error => callback(error, sound));
    }

    const deleteNotification = async (item: any, index: number) => {
        let list: any = await loadStorage("recordingList");

        list = list.filter((d: any, i: number) => i !== index);

        saveStorage(list, 'recordingList');

        setRecordingList(list)
    }

    const ThreadItem = ({ item, index }: { item: any, index: number }) => (
        <View style={styles.thread}>
            <Image source={require('../assets/images/images.jpeg')} style={styles.avatar} />
            <View style={styles.threadContent}>
                <Text style={styles.username}>Audio Message sent by <Text style={styles.sentBy}>Michel</Text></Text>
                <Text style={styles.timestamp}>{TimeAgo.inWords(item.sentTime)}</Text>
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
    }, [isFocused])

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
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    thread: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    threadContent: {
        flex: 1,
    },
    username: {
        marginBottom: 4,
        color: '#666',
        fontWeight: 'bold'
    },
    content: {
        marginBottom: 4,
    },
    timestamp: {
        color: '#666',
    },
    scrollContainer: {},
    sentBy: {
        color: "#7e59c5",
        fontWeight: 'bold'
    }
});

export default RecordingList;
