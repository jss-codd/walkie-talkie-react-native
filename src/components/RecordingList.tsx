import React, { useEffect, useState } from "react";
import { View, FlatList, Text, StyleSheet, Image, Button, Alert } from 'react-native';
import { loadStorage, saveStorage } from "../utils/storage";
import VoiceRecorder from "./VoiceRecorder";
import { TimeAgo } from "../utils/timeAgo";
import Sound from 'react-native-sound';

Sound.setCategory('Playback'); // true = mixWithOthers

const RecordingList = (props: any) => {
    const { messageReceiveCount } = props;
    const [recordingList, setRecordingList] = useState([]);

    function playSound(item: any, index: number) {

        setRecordingList((pre: any) => (pre.map((d: any, i: number) => { return (i === index) ? { ...d, playStatus: true } : d })))

        const callback = (error: any, sound: any) => {
            if (error) {
                Alert.alert('error', error.message);
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
            <Image source={require('../assets/audio-1.jpg')} style={styles.avatar} />
            <View style={styles.threadContent}>
                <Text style={styles.username}>@Recording {index + 1}</Text>
                {/* <Text style={styles.content}>This is the content of the first thread</Text> */}
                <Text style={styles.timestamp}>{TimeAgo.inWords(item.sentTime)}</Text>
            </View>
            <View>
                <Button
                    title="Play"
                    disabled={item.playStatus}
                    onPress={() => playSound(item, index)}
                />
            </View>
            <View>
                <Button
                    title="Delete"
                    color="#dc3545"
                    onPress={() => deleteNotification(item, index)}
                />
            </View>
        </View>
    );

    const loadRecordingFromStorage = async () => {
        let list: any = await loadStorage("recordingList");

        list = Array.isArray(list) ? list.map((d: any) => { return { ...d, playStatus: false } }) : [];

        setRecordingList(list);
    }

    useEffect(() => {
        loadRecordingFromStorage();
    }, [messageReceiveCount])

    return (
        <>
            <FlatList
                data={recordingList}
                renderItem={({ item, index }) => <ThreadItem item={item} index={index} />}
                contentContainerStyle={styles.container}
                ListHeaderComponent={VoiceRecorder}
            />
            {/* <GestureHandlerRootView style={backgroundStyle}>
                <SwipeableFlatList
                    ListHeaderComponent={VoiceRecorder}
                    data={recordingList}
                    renderItem={({ item, index }) => <ThreadItem item={item} index={index} />}
                    renderLeftActions={({ item }) => (
                        <SwipeableQuickActions>
                            <SwipeableQuickActionButton
                                onPress={() => {
                                    LayoutAnimation.configureNext(
                                        LayoutAnimation.Presets.easeInEaseOut,
                                    );
                                    // setData(data.filter(value => value !== item.album));
                                }}
                                text="delete"
                                textStyle={{ fontWeight: 'bold', color: 'white' }}
                            />
                        </SwipeableQuickActions>
                    )}
                    renderRightActions={({ item }) => (
                        <SwipeableQuickActions>
                            <SwipeableQuickActionButton onPress={() => { }} text="Other" />
                            <SwipeableQuickActionButton onPress={() => { }} text="Flag" />
                            <SwipeableQuickActionButton onPress={() => { }} text="Archive" />
                        </SwipeableQuickActions>
                    )}
                />
            </GestureHandlerRootView> */}
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
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#666'
    },
    content: {
        marginBottom: 4,
    },
    timestamp: {
        color: '#666',
    },
    scrollContainer: {},
});

export default RecordingList;
