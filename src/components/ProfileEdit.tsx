import React, { useEffect, useState } from "react";
import { View, FlatList, Text, StyleSheet, Image, TextInput, ScrollView } from 'react-native';
import Sound from 'react-native-sound';
import { useIsFocused } from '@react-navigation/native';

import { loadStorage, saveStorage } from "../utils/storage";
import { TimeAgo } from "../utils/timeAgo";
import { showAlert } from "../utils/alert";
import Play from '../assets/svgs/play.svg';
import Delete from '../assets/svgs/delete.svg';
import { COLORS } from "../utils/constants";
import { TextStyles } from "../utils/TextStyles";
import { FS, HP, VP } from "../utils/Responsive";
import { RNText } from "./RNText";
import Pencil from '../assets/svgs/pencil.svg';
import { Button } from "./Button";
import User from '../assets/svgs/user.svg';
import ProfileImageContainer from "./ProfileImageContainer";

const ProfileEdit = (props: { handler: () => void, profile: any, inputChange: (arg1: any, arg2: any) => void, submitHandler: () => void, loading: boolean, error: any }) => {
    const { handler, profile, inputChange, submitHandler, loading, error } = props;

    return (
        <>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ backgroundColor: "#E6E6E6", paddingHorizontal: 16, paddingVertical: 12, borderBottomLeftRadius: 60, borderBottomRightRadius: 60, paddingBottom: VP(40) }}>
                    <View style={styles.container}>
                        <ProfileImageContainer profile={profile} />
                    </View>
                    <View style={{ ...styles.container, marginTop: VP(47), justifyContent: "flex-start" }}>
                        <View style={styles.formContainer}>
                            <User width={18} height={18} />
                            <TextInput
                                style={styles.input}
                                onChangeText={(e: any) => inputChange('name', e)}
                                value={profile.name || ""}
                                placeholder="Enter your name here"
                                placeholderTextColor={COLORS.PLACEHOLDER_COLOR}
                                maxLength={25}
                            />
                        </View>
                    </View>
                    <View style={{ ...styles.container, marginTop: VP(10), justifyContent: "flex-start" }}>
                        <View style={styles.formContainer}>
                            <Image source={require('../assets/icons/mail.png')} style={{ padding: 5, ...styles.icon }} />
                            <TextInput
                                style={styles.input}
                                onChangeText={(e: any) => inputChange('email', e)}
                                value={profile.email || ""}
                                placeholder="Enter your email here"
                                placeholderTextColor={COLORS.PLACEHOLDER_COLOR}
                                maxLength={25}
                            />
                        </View>
                    </View>
                    {/* <View style={{ ...styles.container, marginTop: VP(10), justifyContent: "flex-start" }}>
                        <View style={styles.formContainer}>
                            <Image source={require('../assets/icons/phone.png')} style={{ padding: 5, ...styles.icon }} />
                            <TextInput
                                style={styles.input}
                                onChangeText={(e: any) => inputChange('mobile', e)}
                                value={profile.mobile || ""}
                                placeholder="Enter your mobile here"
                                keyboardType="numeric"
                                placeholderTextColor={COLORS.PLACEHOLDER_COLOR}
                                maxLength={10}
                            />
                        </View>
                    </View> */}
                    <View style={{ ...styles.container, marginTop: VP(10), justifyContent: "flex-start" }}>
                        <View style={{ ...styles.formContainer, borderBottomWidth: 0 }}>
                            <Image source={require('../assets/icons/location.png')} style={{ padding: 5, ...styles.icon }} />
                            <TextInput
                                style={styles.input}
                                onChangeText={(e: any) => inputChange('location', e)}
                                value={profile.location || ""}
                                placeholder="Enter your location here"
                                placeholderTextColor={COLORS.PLACEHOLDER_COLOR}
                                maxLength={25}
                            />
                        </View>
                    </View>
                </View>
                <View style={{ ...styles.container, marginTop: VP(20), justifyContent: "center" }}>
                    <RNText textStyle={{ ...TextStyles.SOFIA_SEMI_BOLD, color: COLORS.RED, fontSize: HP(16) }}>{error.status && (<>{error.text}</>)}</RNText>
                </View>
                <View style={{ margin: "auto", flexDirection: "row", gap: 10, marginTop: VP(50) }}>
                    <View style={{ width: "46%" }}>
                        <Button
                            text={'Save'}
                            onPress={submitHandler}
                            textStyle={styles.buttonStyle}
                            Icon={<Image source={require('../assets/icons/save.png')} style={styles.icon} />}
                            style={{ width: "100%" }}
                            isLoading={loading}
                        />
                    </View>
                    <View style={{ width: "46%" }}>
                        <Button
                            text={'Cancel'}
                            onPress={handler}
                            textStyle={{ ...styles.buttonStyle, color: "#000000" }}
                            Icon={<Image source={require('../assets/icons/cancel.png')} style={styles.icon} />}
                            style={{ borderColor: "#6017EB", borderWidth: 1, width: "100%" }}
                            LinearGradienrColor={['#FDFDFD', '#FDFDFD']}
                            isLoading={loading}
                        />
                    </View>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    formContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        borderBottomColor: "#D2D2D2",
        borderBottomWidth: 1,
        marginLeft: 10,
        paddingBottom: 4
    },
    input: {
        flex: 1,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 0,
        fontSize: FS(14),
        color: COLORS.BLACK
    },
    buttonStyle: {
        ...TextStyles.SOFIA_MEDIUM,
        fontSize: FS(16),
        color: COLORS.WHITE
    },
    container: {
        justifyContent: "center",
        flexDirection: "row",
        ...TextStyles.SOFIA_MEDIUM
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
        borderWidth: 3
    },
    username: {
        fontSize: FS(20),
        color: COLORS.BLACK,
    },
    icon: {
        width: 16,
        height: 16,
    }
});

export default ProfileEdit;
