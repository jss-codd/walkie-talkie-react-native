import React, { useContext, useEffect, useRef, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, Pressable, View, Platform, Linking, ScrollView, TextInput, Image, TouchableOpacity } from 'react-native';
import { openSettings } from 'react-native-permissions';
import { FS, HP, VP } from '../utils/Responsive';
import ProfileImageContainer from './ProfileImageContainer';
import { SettingContext } from '../context/SettingContext';
import { TextStyles } from '../utils/TextStyles';
import User from '../assets/svgs/user.svg';
import { COLORS, emailRegex, errorMessage, nameRegex } from '../utils/constants';
import { Button } from "./Button";
import { RNText } from './RNText';
import { navigationString } from '../utils/navigationString';
import Pencil from '../assets/svgs/pencil.svg';
import Tick from '../assets/svgs/tick.svg';
import Loader from './Loader';
import { submitEmailDetails, submitLocationDetails, submitNameDetails, submitProfileDetails } from '../utils/apiCall';
import { showFadeAlert } from '../utils/alert';
import Close from '../assets/svgs/close.svg';

const ProfileDrawer = (props: { navigation: any; }) => {
    const { navigation } = props;
    const nameRef = useRef<any>(null);

    const settings = useContext<any>(SettingContext);

    const [profile, setProfile] = useState<any>({});
    const [editMode, setEditMode] = useState<any>({ email: false, location: false, name: false });
    const [loader, setLoader] = useState(false);
    const [error, setError] = useState({ email: { status: false, text: "" }, location: { status: false, text: "" }, name: { status: false, text: "" } });

    const inputChange = (key: any, value: any) => {
        setProfile((pre: any) => ({ ...pre, [key]: value }));
    }

    const EmailSubmitHandler = async () => {
        try {
            if (profile.email == null) {
                throw new Error('Email is required!');
            }

            if (profile.email.trim() == "") {
                throw new Error('Email is required!');
            }

            if (emailRegex.test(profile.email) === false) {
                throw new Error(errorMessage.email);
            }

            setError((pre) => ({ ...pre, email: { status: false, text: "" } }));

            setLoader(true);

            const dataPayload = {
                email: profile.email
            };

            const res = await submitEmailDetails(dataPayload, settings);

            setLoader(false);

            setEditMode((pre: any) => ({ ...pre, email: false }));

            showFadeAlert('Successfully updated');
        } catch (err: any) {
            setError((pre) => ({ ...pre, email: { status: true, text: err.message } }));
            setLoader(false);
            setEditMode((pre: any) => ({ ...pre, email: false }));
            showFadeAlert('Failed to update!');
            setProfile(settings.proflieDetails)
        }
    }

    const LocationSubmitHandler = async () => {
        try {
            if (profile.location == null) {
                throw new Error('Email is required!');
            }

            if (profile.location.trim() == "") {
                throw new Error('Email is required!');
            }

            if (nameRegex.test(profile.location) === false) {
                throw new Error(errorMessage.location);
            }

            setError((pre) => ({ ...pre, location: { status: false, text: "" } }));

            setLoader(true);

            const dataPayload = {
                location: profile.location
            };

            const res = await submitLocationDetails(dataPayload, settings);

            setLoader(false);

            setEditMode((pre: any) => ({ ...pre, location: false }));

            showFadeAlert('Successfully updated');
        } catch (err: any) {
            setError((pre) => ({ ...pre, location: { status: true, text: err.message } }));
            setLoader(false);
            setEditMode((pre: any) => ({ ...pre, location: false }));
            showFadeAlert('Failed to update!');
            setProfile(settings.proflieDetails)
        }
    }

    const NameSubmitHandler = async () => {
        try {
            if (profile.name == null) {
                throw new Error('Email is required!');
            }

            if (profile.name.trim() == "") {
                throw new Error('Email is required!');
            }

            if (nameRegex.test(profile.name) === false) {
                throw new Error(errorMessage.name);
            }

            setError((pre) => ({ ...pre, name: { status: false, text: "" } }));

            setLoader(true);

            const dataPayload = {
                name: profile.name
            };

            const res = await submitNameDetails(dataPayload, settings);

            setLoader(false);

            setEditMode((pre: any) => ({ ...pre, name: false }));

            showFadeAlert('Successfully updated');
        } catch (err: any) {
            setError((pre) => ({ ...pre, name: { status: true, text: err.message } }));
            setLoader(false);
            setEditMode((pre: any) => ({ ...pre, name: false }));
            showFadeAlert('Failed to update!');
            setProfile(settings.proflieDetails)
        }
    }

    useEffect(() => {
        setProfile(settings.proflieDetails)
    }, [settings.proflieDetails])

    return (
        <>
            <Loader loading={loader} />
            <View style={styles.main}>
                <View style={{ height: "100%" }}>
                    {/* Close Icon */}
                    <View style={{ flexDirection: "row", justifyContent: "flex-end", }}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{}}
                        >
                            <Close height={35} width={35} />
                        </TouchableOpacity>
                    </View>
                    {/* Profile Image Div */}
                    <View style={styles.container}>
                        <ProfileImageContainer profile={profile} />
                    </View>
                    {/* Name div */}
                    <View style={{ ...styles.container, marginTop: VP(22) }}>
                        {editMode.name ? (
                            <>
                                <TextInput
                                    style={{ ...styles.username, padding: 0, flexBasis: "80%" }}
                                    onChangeText={(e: any) => inputChange('name', e)}
                                    value={profile.name || ""}
                                    placeholder="Enter your name here"
                                    placeholderTextColor={COLORS.PLACEHOLDER_COLOR}
                                    maxLength={25}
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        NameSubmitHandler();
                                    }}
                                    style={{ alignSelf: "center", }}
                                >
                                    <Tick height={25} width={25} />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <RNText textStyle={{ ...styles.username, flexBasis: "80%" }}>
                                    {profile.name || 'NA'}
                                </RNText>

                                <TouchableOpacity
                                    onPress={() => setEditMode((pre: any) => ({ ...pre, name: true }))}
                                    style={{ alignSelf: "center", start: 10 }}
                                >
                                    <Pencil height={25} width={25} />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    <View style={{ ...styles.container }}>
                        <View style={{ ...styles.line, backgroundColor: error.name.status ? 'red' : '#D2D2D2' }}></View>
                    </View>
                    {/* Email Div */}
                    <View style={{ ...styles.container, marginTop: VP(40), justifyContent: "flex-start", alignItems: "center", }}>
                        <Image source={require('../assets/icons/mail.png')} style={{ ...styles.icon }} />
                        {editMode.email ? (
                            <>
                                <TextInput
                                    style={{ ...styles.input, flexBasis: "80%", padding: 0, }}
                                    onChangeText={(e: any) => inputChange('email', e)}
                                    value={profile.email || ""}
                                    placeholder="Enter your email here"
                                    placeholderTextColor={COLORS.PLACEHOLDER_COLOR}
                                    maxLength={25}
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        EmailSubmitHandler();
                                    }}
                                    style={{ alignSelf: "center", }}
                                >
                                    <Tick height={25} width={25} />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <RNText textStyle={{ ...styles.inputs, flexBasis: "80%" }}>
                                    {profile.email || 'NA'}
                                </RNText>

                                <TouchableOpacity
                                    onPress={() => setEditMode((pre: any) => ({ ...pre, email: true }))}
                                    style={{ alignSelf: "center", start: 10 }}
                                >
                                    <Pencil height={25} width={25} />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    <View style={{ ...styles.container, paddingLeft: 14, paddingRight: 14 }}>
                        <View style={{ ...styles.line, backgroundColor: error.email.status ? 'red' : '#D2D2D2' }}></View>
                    </View>

                    {/* Mobile Div */}
                    <View style={{ ...styles.container, marginTop: VP(20), justifyContent: "flex-start" }}>
                        <RNText textStyle={styles.inputs}>
                            <Image source={require('../assets/icons/phone.png')} style={styles.icon} /> {profile.mobile || 'NA'}
                        </RNText>
                    </View>

                    <View style={{ ...styles.container, paddingLeft: 14, paddingRight: 14 }}>
                        <View style={styles.line}></View>
                    </View>

                    {/* Location Div */}
                    <View style={{ ...styles.container, marginTop: VP(20), justifyContent: "flex-start", alignItems: "center", }}>
                        <Image source={require('../assets/icons/location.png')} style={{ ...styles.icon }} />
                        {editMode.location ? (
                            <>
                                <TextInput
                                    style={{ ...styles.input, flexBasis: "80%", padding: 0, }}
                                    onChangeText={(e: any) => inputChange('location', e)}
                                    value={profile.location || ""}
                                    placeholder="Enter your location here"
                                    placeholderTextColor={COLORS.PLACEHOLDER_COLOR}
                                    maxLength={25}
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        LocationSubmitHandler();
                                    }}
                                    style={{ alignSelf: "center", }}
                                >
                                    <Tick height={25} width={25} />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <RNText textStyle={{ ...styles.inputs, flexBasis: "80%" }}>
                                    {profile.location || 'NA'}
                                </RNText>

                                <TouchableOpacity
                                    onPress={() => setEditMode((pre: any) => ({ ...pre, location: true }))}
                                    style={{ alignSelf: "center", start: 10 }}
                                >
                                    <Pencil height={25} width={25} />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    <View style={{ ...styles.container, paddingLeft: 14, paddingRight: 14 }}>
                        <View style={{ ...styles.line, backgroundColor: error.location.status ? 'red' : '#D2D2D2' }}></View>
                    </View>

                    {/* Setting Div */}
                    <View style={{ ...styles.container, marginTop: VP(20), justifyContent: "flex-start", alignItems: "center" }}>
                        <Image source={require('../assets/icons/setting.png')} style={styles.icon} />
                        <RNText textStyle={{ ...styles.inputs, flexBasis: "80%" }}>
                            Settings
                        </RNText>
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate(
                                    navigationString.SETTING_SCREEN,
                                )}
                            style={{ alignSelf: "center", start: 10 }}
                        >
                            <Pencil height={25} width={25} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    main: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "80%",
        backgroundColor: '#FFFFFF',
        borderRightWidth: 1,
        borderTopRightRadius: 30,
        borderRightColor: "#FFFFFF",
        borderBottomRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 4,
        paddingHorizontal: 16,
        paddingVertical: 12
    },
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
        start: 5,
    },
    input: {
        start: 5,
        flex: 1,
        fontSize: FS(14),
        color: COLORS.BLACK
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

export default ProfileDrawer;