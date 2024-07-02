import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';

import { COLORS } from "../utils/constants";
import { TextStyles } from "../utils/TextStyles";
import { FS, VP } from "../utils/Responsive";
import { RNText } from "./RNText";
import { Button } from "./Button";
import { navigationString } from "../utils/navigationString";
import ProfileImageContainer from "./ProfileImageContainer";

const Profile = (props: { handler: () => void, navigation: any, profile: any }) => {
    const { handler, navigation, profile } = props;
    return (
        <>
            <View style={{ backgroundColor: "#E6E6E6", paddingHorizontal: 16, paddingVertical: 12, borderBottomLeftRadius: 60, borderBottomRightRadius: 60, paddingBottom: VP(40) }}>
                <View style={styles.container}>
                    <ProfileImageContainer profile={profile} />
                </View>
                <View style={{ ...styles.container, marginTop: VP(22) }}>
                    <RNText textStyle={styles.username}>
                        {profile.name || 'NA'}
                    </RNText>
                </View>
                <View style={{ ...styles.container, marginTop: VP(47), justifyContent: "flex-start" }}>
                    <RNText textStyle={styles.inputs}>
                        <Image source={require('../assets/icons/mail.png')} style={styles.icon} /> {profile.email || 'NA'}
                    </RNText>
                </View>
                <View style={{ ...styles.container, paddingLeft: 14, paddingRight: 14 }}>
                    <View style={styles.line}></View>
                </View>
                <View style={{ ...styles.container, marginTop: VP(20), justifyContent: "flex-start" }}>
                    <RNText textStyle={styles.inputs}>
                        <Image source={require('../assets/icons/phone.png')} style={styles.icon} /> {profile.mobile || 'NA'}
                    </RNText>
                </View>
                <View style={{ ...styles.container, paddingLeft: 14, paddingRight: 14 }}>
                    <View style={styles.line}></View>
                </View>
                <View style={{ ...styles.container, marginTop: VP(20), justifyContent: "flex-start" }}>
                    <RNText textStyle={styles.inputs}>
                        <Image source={require('../assets/icons/location.png')} style={styles.icon} /> {profile.location || 'NA'}
                    </RNText>
                </View>
                <View style={{ ...styles.container, paddingLeft: 14, paddingRight: 14 }}>
                    <View style={styles.line}></View>
                </View>
                <View style={{ ...styles.container, marginTop: VP(20), justifyContent: "flex-start" }}>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate(
                                navigationString.SETTING_SCREEN,
                            )}
                        style={{}}
                    >
                        <RNText textStyle={styles.inputs}>
                            <Image source={require('../assets/icons/setting.png')} style={styles.icon} /> Settings
                        </RNText>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ margin: "auto" }}>
                <Button
                    text={'Edit Profile'}
                    onPress={handler}
                    textStyle={styles.buttonStyle}
                    Icon={<Image source={require('../assets/icons/edit.png')} style={styles.icon} />}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    buttonStyle: {
        ...TextStyles.SOFIA_MEDIUM,
        fontSize: FS(16),
        color: COLORS.WHITE,
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
    inputs: {
        fontSize: FS(14),
        color: COLORS.BLACK,
        start: 14
    },
    icon: {
        width: 16,
        height: 16,
    },
    line: {
        height: 1,
        backgroundColor: "#D2D2D2",
        width: "100%",
        flexDirection: "row",
        marginTop: VP(14.9),
        justifyContent: 'center',
        alignItems: 'center',
        display: "flex",
    },
});

export default Profile;
