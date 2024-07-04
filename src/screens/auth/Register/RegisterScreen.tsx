import React, { useEffect, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, TouchableOpacity, View, Image, BackHandler, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import PhoneInput from "react-native-phone-number-input";

import OuterLayout from '../../../components/OuterLayout';
import { AuthStackParamList } from '../../../navigations/AuthStackNavigator';
import { styles } from './styles';
import InnerBlock from '../../../components/InnerBlock';
import { RNText } from '../../../components/RNText';
import ValidationTextInput from '../../../components/ValidationTextInput';
import { Button } from '../../../components/Button';
import { navigationString } from '../../../utils/navigationString';
import { BACKEND_URL, COLORS, errorMessage, mobileRegex } from '../../../utils/constants';
import Mobile from '../../../assets/svgs/mobile.svg';
import { FS, HP, VP } from '../../../utils/Responsive';
import ArrowLeftSquare from '../../../assets/svgs/arrow-left-square.svg';
import { showAlert } from '../../../utils/alert';
import { removeStorage, saveStorage } from '../../../utils/storage';
import { TextStyles } from '../../../utils/TextStyles';

type NavigationProp = NativeStackScreenProps<AuthStackParamList>;

const RegisterScreen: React.FunctionComponent<NavigationProp> = ({
    navigation,
}) => {
    const phoneInput = useRef<PhoneInput>(null);

    const [text, setText] = useState('');
    const [error, setError] = useState({ status: false, text: "" });
    const [loading, setLoading] = useState(false);

    const [value, setValue] = useState("");
    const [formattedValue, setFormattedValue] = useState("");
    const [showMessage, setShowMessage] = useState(false);
    const [valid, setValid] = useState(false);
    const [code, setCode] = useState("");
    const [code1, setCode1] = useState("");

    const handleOnPress = () => {
        try {
            const inputValue = text.trim();

            if (mobileRegex.test(inputValue) == false) {
                throw new Error(errorMessage.mobile_no);
            }

            setLoading(true);

            setError({ status: false, text: "" });

            const dataPayload = {
                "mobile": inputValue
            };

            axios.post(BACKEND_URL + '/mobile-verification', dataPayload)
                .then(response => {
                    setLoading(false);

                    if (response.data.success && response.data.mobile) {
                        saveStorage({ "mobile": response.data.mobile }, "signupMobile");

                        navigation.navigate(
                            navigationString.VERIFY_CODE,
                        )
                    } else {
                        showAlert(errorMessage.commonError, "");
                    }
                })
                .catch(error => {
                    setLoading(false);
                    showAlert(errorMessage.commonError, error.response.data.error || "");
                    console.warn("Error sending data: ", error.message);
                });

        } catch (err: any) {
            setError((pre) => ({ status: true, text: err.message }))
        }
    };

    const dumpStorage = async () => {
        removeStorage("signupMobile");
        removeStorage("userDetails");
        removeStorage("recordingList");
        removeStorage("savedLocation");
        removeStorage("fcm");
        removeStorage("userProfile");

        // removeItem
        await AsyncStorage.removeItem('fcmToken');
    }

    const handleOnPressV1 = () => {
        try {
            const checkValid = phoneInput.current?.isValidNumber(value) || false;

            if (!checkValid) {
                throw new Error(errorMessage.mobile_no);
            }

            const countryCode = phoneInput.current?.getCountryCode() || "";
            const callingCode = phoneInput.current?.getCallingCode() || "";

            if (!countryCode || !callingCode || !formattedValue) {
                throw new Error(errorMessage.mobile_no);
            }

            setLoading(true);

            setError({ status: false, text: "" });

            const dataPayload = {
                "mobile": formattedValue,
                "countryCode": countryCode,
                "callingCode": callingCode
            };

            axios.post(BACKEND_URL + '/mobile-verification', dataPayload)
                .then(response => {
                    setLoading(false);

                    if (response.data.success && response.data.mobile) {
                        saveStorage({ "mobile": response.data.mobile, "countryCode": countryCode, "callingCode": callingCode }, "signupMobile");

                        navigation.navigate(
                            navigationString.VERIFY_CODE,
                        )
                    } else {
                        showAlert(errorMessage.commonError, "");
                    }
                })
                .catch(error => {
                    setLoading(false);
                    showAlert(errorMessage.commonError, error.response.data.error || "");
                    console.warn("Error sending data: ", error.message);
                });

        } catch (err: any) {
            setError((pre) => ({ status: true, text: err.message }))
        }
    };

    useEffect(() => {
        dumpStorage();
    }, [])

    return (
        <OuterLayout containerStyle={styles.containerStyle}>
            <InnerBlock>
                <View style={styles.container}>
                    <View style={{ marginLeft: VP(20), marginTop: VP(20), }}>
                        <TouchableOpacity
                            onPress={() => BackHandler.exitApp()}
                        >
                            <ArrowLeftSquare height={21} width={21} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.startContainer}>
                            <Mobile height={VP(160)} />
                        </View>
                        <View style={styles.paraContainer}>
                            <RNText textStyle={styles.paraHeadingStyle}>
                                OTP Verification
                            </RNText>
                        </View>
                        <View style={{ marginTop: VP(18), paddingHorizontal: HP(10) }}>
                            <RNText textStyle={styles.paraStyle}>
                                we will send you a <RNText textStyle={styles.paraBold}>One Time Password (OTP)</RNText> on this mobile number
                            </RNText>
                        </View>
                        <View style={styles.formContainer}>
                            <View style={styles.inputContainer}>
                                {/* <ValidationTextInput placeholder="Enter Mobile number" keyboardType="numeric" maxLength={10} formProps={{ text, setText, error }} /> */}

                                <PhoneInput
                                    ref={phoneInput}
                                    defaultValue={value}
                                    defaultCode="IN"
                                    layout="second"
                                    onChangeText={(text) => {
                                        setValue(text);
                                    }}
                                    onChangeFormattedText={(text) => {
                                        setFormattedValue(text);
                                    }}
                                    // withDarkTheme
                                    // withShadow
                                    // autoFocus
                                    disableArrowIcon={false}
                                    containerStyle={{ borderBottomColor: error.status ? COLORS.RED : "#A1A1A1", borderBottomWidth: 1, width: HP(294), }}
                                    textContainerStyle={{ backgroundColor: "#fff", paddingLeft: 0, }}
                                    textInputStyle={{ ...TextStyles.SOFIA_REGULAR, fontSize: FS(20), paddingLeft: 0, }}
                                    codeTextStyle={{ ...TextStyles.SOFIA_REGULAR, fontSize: FS(20) }}
                                    textInputProps={{
                                        placeholder: "Enter Mobile number",
                                        placeholderTextColor: '#7B7B7B',
                                    }}
                                />
                            </View>
                            {error.status && error.text && (
                                <RNText textStyle={{ ...TextStyles.SOFIA_REGULAR, color: COLORS.RED, textAlign: "center", marginBottom: 5 }}>{error.text}</RNText>
                            )}

                            <View style={{ marginTop: VP(34) }}>
                                <Button
                                    text={'Get OTP'}
                                    onPress={() => handleOnPressV1()}
                                    textStyle={styles.buttonStyle}
                                    isLoading={loading}
                                />
                            </View>
                            <View style={styles.signInTextContainer}>
                                <View style={{ flex: 1, height: 1, backgroundColor: '#A1A1A1' }} />
                                <RNText textStyle={styles.signInTextStyle}>
                                    or sign in using
                                </RNText>
                                <View style={{ flex: 1, height: 1, backgroundColor: '#A1A1A1', width: "100%" }} />
                            </View>

                            <View style={{ margin: "auto", flexDirection: "row", gap: 10, marginTop: VP(32) }}>
                                <View style={{ width: "46%" }}>
                                    <Button
                                        text={'Facebook'}
                                        onPress={() => void (0)}
                                        textStyle={{ ...styles.buttonStyle, color: "#000000" }}
                                        Icon={<Image source={require('../../../assets/icons/facebook.png')} style={styles.icon} />}
                                        style={{ width: "100%", borderColor: "#eee", borderWidth: 1 }}
                                        LinearGradienrColor={['#FDFDFD', '#FDFDFD']}
                                    />
                                </View>
                                <View style={{ width: "46%" }}>
                                    <Button
                                        text={'Google'}
                                        onPress={() => void (0)}
                                        textStyle={{ ...styles.buttonStyle, color: "#000000" }}
                                        Icon={<Image source={require('../../../assets/icons/google.png')} style={styles.icon} />}
                                        style={{ width: "100%", borderColor: "#eee", borderWidth: 1 }}
                                        LinearGradienrColor={['#FDFDFD', '#FDFDFD']}
                                    />
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </InnerBlock>
        </OuterLayout>
    );
};
export default RegisterScreen;
