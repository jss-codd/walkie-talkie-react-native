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
import { FS, VP } from "../utils/Responsive";
import { RNText } from "./RNText";

Sound.setCategory('Playback'); // true = mixWithOthers

const Profile = () => {
    return (
        <>
            <View style={styles.container}>
                <Image source={require('../assets/images/image.png')} style={styles.avatar} />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#E6E6E6",
        justifyContent: "center",
        flexDirection: "row",
        // paddingHorizontal: 16,
        // paddingVertical: 12,
    },
    avatar: {
        width: 125,
        height: 125,
        borderRadius: 125,
        marginRight: 12,
        flexDirection: 'row',
        justifyContent: "center",
        marginTop: VP(40),
        borderColor: "#FFFFFF",
        borderWidth: 2
    },
});

export default Profile;
