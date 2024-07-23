import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import { RNText } from './RNText';
import { FS, HP, VP } from '../utils/Responsive';
import { SettingContext } from '../context/SettingContext';
import Unmute from '../assets/svgs/unmute.svg';
import { TextStyles } from '../utils/TextStyles';
import Mute from '../assets/svgs/mute.svg';

const ToggleNotification = (): React.JSX.Element => {
    const settings = useContext<any>(SettingContext);

    const notificationStatus = settings.notificationStatus;

    const toggleNotification = async () => {
        const dataPayload = {
            "status": !notificationStatus
        };

        settings.handler('notificationStatus', !notificationStatus);
    }

    return (
        <>
            <TouchableOpacity style={{ alignItems: "center" }} onPress={() => toggleNotification()}>
                <View style={styles.iconContainer}>
                    {notificationStatus ? <Unmute width={31} height={31} /> : (<Mute width={31} height={31} />)}
                </View>
                <RNText textStyle={styles.iconText}>{notificationStatus ? 'Mute' : 'Unmute'}</RNText>
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
