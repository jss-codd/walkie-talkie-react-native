import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, TouchableOpacity, View, Text } from 'react-native';
import axios from 'axios';

import OuterLayout from '../../../components/OuterLayout';
import { styles } from './styles';
import InnerBlock from '../../../components/InnerBlock';
import { RNText } from '../../../components/RNText';
import { Button } from '../../../components/Button';
import { navigationString } from '../../../utils/navigationString';
import { AlertMessages, apiEndpoints, BACKEND_URL, COLORS, errorMessage } from '../../../utils/constants';
import Mobile from '../../../assets/svgs/mobile.svg';
import { VP } from '../../../utils/Responsive';
import ArrowLeftSquare from '../../../assets/svgs/arrow-left-square.svg';
import { MainStackParamList } from '../../../navigations/MainStackNavigator';
import { loadStorage, removeStorage, saveStorage } from '../../../utils/storage';
import OTPInput from '../../../components/OTPInput';
import { showAlert } from '../../../utils/alert';
import Loader from '../../../components/Loader';

const otpCheck = /^[0-9]{4}$/;

const VerifyCode: React.FunctionComponent<any> = ({
    navigation,
}) => {
    const [value, setValue] = useState('');
    const [error, setError] = useState({ status: false, text: "" });
    const [loading, setLoading] = useState(false);
    const [mobileNo, setMobileNo] = useState("");
    const [loader, setLoader] = useState(false);

    const resendOTP = async () => {
        try {
            setLoader(true);
            const signupMobile = await loadStorage("signupMobile");

            if (!signupMobile || !signupMobile.hasOwnProperty("mobile")) {
                navigation.navigate(
                    navigationString.REGISTER_SCREEN,
                )
            }

            const dataPayload = {
                "mobile": signupMobile.mobile,
                "countryCode": signupMobile.countryCode,
                "callingCode": signupMobile.callingCode
            };

            const response: any = await axios.post(BACKEND_URL + apiEndpoints.mobileVerification, dataPayload);

            if (response?.data?.success && response?.data?.mobile) {
                showAlert(AlertMessages.resend_otp.title, AlertMessages.resend_otp.message);
            } else {
                showAlert(errorMessage.commonError, "");
            }

            setLoader(false);
        } catch (error: any) {
            setLoader(false);
            showAlert(errorMessage.commonError, error?.response?.data?.error || "");
            console.error(error, '------resendOTP error')
        }
    }

    const handleOnPress = async () => {
        try {
            const signupMobile = await loadStorage("signupMobile");

            if (!signupMobile || !signupMobile.hasOwnProperty("mobile")) {
                navigation.navigate(
                    navigationString.REGISTER_SCREEN,
                )
            }

            const inputValue = value.trim();

            if (otpCheck.test(inputValue) == false) {
                throw new Error(errorMessage.otp);
            }

            setLoading(true);

            setError({ status: false, text: "" });

            const dataPayload = {
                "otp": inputValue,
                "mobile": signupMobile.mobile

            };

            axios.post(BACKEND_URL + apiEndpoints.otpVerification, dataPayload)
                .then(response => {
                    // console.log("response.data: ", response.data);
                    setLoading(false);

                    if (response.data.success && response.data.mobile && response.data.jwt) {
                        removeStorage("signupMobile");

                        saveStorage({ "mobile": response.data.mobile, "jwt": response.data.jwt }, "userDetails");

                        navigation.reset({
                            index: 0,
                            routes: [
                                {
                                    name: 'PinSetScreen',
                                },
                            ],
                        });
                    } else {
                        showAlert(errorMessage.commonError, "");
                    }
                })
                .catch(error => {
                    setLoading(false);
                    showAlert(error.response.data.error || errorMessage.commonError, "");
                    console.warn("Error sending data: ", error.message);

                    console.warn(error.response.data, 'error.response.data');
                    console.warn(error.response.status, 'error.response.status');
                });

        } catch (err: any) {
            setError((pre) => ({ status: true, text: err.message }))
        }
    };

    useEffect(() => {
        (async () => {
            const signupMobile = await loadStorage("signupMobile");

            if (!signupMobile || !signupMobile.hasOwnProperty("mobile")) {
                navigation.navigate(
                    navigationString.REGISTER_SCREEN,
                )
            } else {
                setMobileNo(signupMobile.mobile);
            }
        })()
    }, [])

    return (
        <OuterLayout containerStyle={styles.containerStyle}>
            <InnerBlock>
                <Loader loading={loader} />
                <View style={styles.container}>
                    <View style={{ marginLeft: VP(20), marginTop: VP(20), }}>
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate(
                                    navigationString.REGISTER_SCREEN,
                                )}
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
                        <View style={{ alignSelf: 'center', marginTop: VP(18) }}>
                            <RNText textStyle={styles.paraStyle}>
                                Enter The OTP Sent to <RNText textStyle={styles.paraBold}>{mobileNo}</RNText>
                            </RNText>
                        </View>
                        <View style={styles.formContainer}>
                            <View style={styles.inputContainer}>
                                <OTPInput formProps={{ value, setValue, error }} />
                            </View>

                            <View style={styles.signInTextContainer}>
                                <RNText textStyle={styles.signInTextStyle}>
                                    Didn’t receive the OTP?
                                </RNText>
                                <RNText>
                                    <TouchableOpacity
                                        onPress={resendOTP}
                                    >
                                        <Text style={{ ...styles.signInTextStyle, color: COLORS.PRIMARY }}> Resend</Text>
                                    </TouchableOpacity>
                                </RNText>
                            </View>

                            <View style={{ marginTop: VP(34) }}>
                                <Button
                                    text={'Verify & Proceed'}
                                    onPress={() => handleOnPress()}
                                    textStyle={styles.buttonStyle}
                                    isLoading={loading}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </InnerBlock>
        </OuterLayout>
    );
};
export default VerifyCode;
