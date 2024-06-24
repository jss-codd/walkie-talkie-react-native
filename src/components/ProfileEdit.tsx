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
import PencilEdit from '../assets/svgs/pencil-edit.svg';

const ProfileEdit = (props: { handler: () => void }) => {
    const { handler } = props;
    return (
        <>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ backgroundColor: "#E6E6E6", paddingHorizontal: 16, paddingVertical: 12, borderBottomLeftRadius: 60, borderBottomRightRadius: 60, paddingBottom: VP(40) }}>
                    <View style={styles.container}>
                        <Image source={require('../assets/images/image.png')} style={styles.avatar} />
                        <View style={{ position: "absolute", top: VP(120), right: HP(115) }}>
                            <Pencil height={40} width={40} />
                        </View>
                    </View>
                    <View style={{ ...styles.container, marginTop: VP(22) }}>
                        <RNText textStyle={styles.username}>
                            Terry Migua
                        </RNText>
                    </View>
                    <View style={{ ...styles.container, marginTop: VP(25), justifyContent: "flex-start" }}>
                        <View style={styles.formContainer}>
                            <Image source={require('../assets/icons/mail.png')} style={{ padding: 5, ...styles.icon }} />
                            <TextInput
                                style={styles.input}
                                // onChangeText={onChangeNumber}
                                value={"terrymigua2@gmail.com"}
                                placeholder="useless placeholder"
                            />
                        </View>
                    </View>
                    <View style={{ ...styles.container, marginTop: VP(10), justifyContent: "flex-start" }}>
                        <View style={styles.formContainer}>
                            <Image source={require('../assets/icons/phone.png')} style={{ padding: 5, ...styles.icon }} />
                            <TextInput
                                style={styles.input}
                                // onChangeText={onChangeNumber}
                                value={"0420 222 585"}
                                placeholder="useless placeholder"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                    <View style={{ ...styles.container, marginTop: VP(10), justifyContent: "flex-start" }}>
                        <View style={{ ...styles.formContainer, borderBottomWidth: 0 }}>
                            <Image source={require('../assets/icons/location.png')} style={{ padding: 5, ...styles.icon }} />
                            <TextInput
                                style={styles.input}
                                // onChangeText={onChangeNumber}
                                value={"melbourne"}
                                placeholder="useless placeholder"
                            />
                        </View>
                    </View>
                </View>
                <View style={{ margin: "auto", flexDirection: "row", gap: 10, marginTop: VP(71) }}>
                    <View style={{ width: "46%" }}>
                        <Button
                            text={'Save'}
                            onPress={handler}
                            textStyle={styles.buttonStyle}
                            Icon={<Image source={require('../assets/icons/save.png')} style={styles.icon} />}
                            style={{ width: "100%" }}
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
