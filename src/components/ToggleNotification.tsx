import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import { RNText } from './RNText';
import { FS, HP, VP } from '../utils/Responsive';
import Unmute from '../assets/svgs/unmute.svg';
import { TextStyles } from '../utils/TextStyles';
import Mute from '../assets/svgs/mute.svg';
import { useDispatch, useSelector } from 'react-redux';
import { notificationStatus, setSettings } from '../redux/features/settings';
import { saveStorage } from '../utils/storage';

const ToggleNotification = (): React.JSX.Element => {
    const dispatch = useDispatch();

    const NotificationStatus = useSelector(notificationStatus);

    const toggleNotification = async () => {
        dispatch(setSettings({ notificationStatus: !NotificationStatus }));
        saveStorage({ notificationStatus: !NotificationStatus }, "settings");
    }

    return (
        <>
            <TouchableOpacity style={{ alignItems: "center" }} onPress={() => toggleNotification()}>
                <View style={styles.iconContainer}>
                    {NotificationStatus ? <Unmute width={31} height={31} /> : (<Mute width={31} height={31} />)}
                </View>
                <RNText textStyle={styles.iconText}>{NotificationStatus ? 'Mute' : 'Unmute'}</RNText>
            </TouchableOpacity>
        </>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        padding: HP(14),
        backgroundColor: "#E5E5E5",
        borderRadius: HP(50)
    },
    iconText: {
        ...TextStyles.SOFIA_SEMI_BOLD,
        fontSize: FS(8),
        color: "#282828",
        marginTop: VP(9)
    },
});

export default ToggleNotification;
