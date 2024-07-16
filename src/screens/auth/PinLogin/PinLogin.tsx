import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import axios from 'axios';

import OuterLayout from '../../../components/OuterLayout';
import { styles } from './styles';
import InnerBlock from '../../../components/InnerBlock';
import { RNText } from '../../../components/RNText';
import { Button } from '../../../components/Button';
import { apiEndpoints, BACKEND_URL, COLORS, errorMessage } from '../../../utils/constants';
import Mobile from '../../../assets/svgs/mobile.svg';
import { HP, VP } from '../../../utils/Responsive';
import { loadStorage, saveStorage } from '../../../utils/storage';
import OTPInput from '../../../components/OTPInput';
import { showAlert } from '../../../utils/alert';
import { maskInput } from '../../../utils/commonHelper';
import { SettingContext } from '../../../context/SettingContext';

const pinCheck = /^[0-9]{4}$/;
const otpRetryCount = 5;

const PinLogin: React.FunctionComponent<any> = ({
    navigation,
}) => {
    const settings = useContext<any>(SettingContext);

    const [pin, setPin] = useState('1111');
    const [errorPin, setErrorPin] = useState({ status: false, text: "" });
    const [loading, setLoading] = useState(false);
    const [maskMobile, setMaskMobile] = useState("");
    const [wrongOTP, setWrongOTP] = useState(0);

    const handleOnPress = async () => {
        try {
            const userDetails = await loadStorage("userDetails");

            const inputValue = pin.trim();

            if (pinCheck.test(inputValue) == false) {
                throw new Error(errorMessage.pin);
            }

            setLoading(true);

            setErrorPin({ status: false, text: "" });

            const dataPayload = {
                "pin": inputValue,
                "mobile": userDetails.mobile
            };

            axios.post(BACKEND_URL + apiEndpoints.pinLogin, dataPayload)
                .then(response => {
                    setLoading(false);

                    if (response.data.success && response.data.mobile && response.data.jwt) {
                        saveStorage({ ...userDetails, "mobile": response.data.mobile, "jwt": response.data.jwt }, "userDetails");

                        saveStorage(response.data.data, "userProfile");
                        settings.setProflieDetails((pre: any) => ({ ...pre, ...response?.data?.data }))

                        navigation.reset({
                            index: 0,
                            routes: [
                                {
                                    name: 'MainTabNavigator',
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

                    if (error.response.status == 400) {
                        setWrongOTP(+error.response.data.pin_retry_count || 1);
                    }

                    console.warn("Error sending data: ", error.message);

                    console.warn(error.response.data, 'error.response.data');
                    console.warn(error.response.status, 'error.response.status');
                });

        } catch (err: any) {
            setErrorPin((pre) => ({ status: true, text: err.message }))
        }
    };

    const handleForgotPress = () => {
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: 'RegisterScreen',
                },
            ],
        });
    }

    useEffect(() => {
        (async () => {
            const userDetails = await loadStorage("userDetails");

            if (!userDetails || !userDetails.hasOwnProperty("mobile") || !userDetails.hasOwnProperty("jwt")) {
                navigation.reset({
                    index: 0,
                    routes: [
                        {
                            name: 'RegisterScreen',
                        },
                    ],
                });
            } else {
                setMaskMobile(maskInput(userDetails.mobile));
            }
        })()

        handleOnPress()
    }, [])

    return (
        <OuterLayout containerStyle={styles.containerStyle}>
            <InnerBlock>
                <View style={styles.container}>
                    <View style={{ marginLeft: VP(20), marginTop: VP(20) }}>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.startContainer}>
                            <Mobile height={VP(160)} />
                        </View>
                        <View style={styles.paraContainer}>
                            <RNText textStyle={styles.paraHeadingStyle}>
                                Enter 4 Digit Pin
                            </RNText>
                        </View>
                        <View style={{ alignSelf: 'center', marginTop: VP(18) }}>
                            <RNText textStyle={styles.paraStyle}>
                                To access your account
                            </RNText>
                        </View>
                        <View style={styles.formContainer}>
                            <View style={styles.inputContainer}>
                                <OTPInput formProps={{ value: pin, setValue: setPin, error: errorPin }} />
                            </View>

                            <View style={{ ...styles.signInTextContainer, paddingHorizontal: HP(10) }}>
                                {wrongOTP > 0 && (
                                    <RNText textStyle={{ ...styles.signInTextStyle }}>
                                        Oh-Oh Invalid PIN! {(otpRetryCount - wrongOTP) > 0 ? `Only ${otpRetryCount - wrongOTP}` : `no`} attemps are left.
                                    </RNText>
                                )}
                            </View>

                            <View style={{ ...styles.signInTextContainer, paddingHorizontal: HP(10) }}>
                                {wrongOTP > 0 && (
                                    <RNText textStyle={{ ...styles.signInTextStyle }}>
                                        <TouchableOpacity
                                            onPress={handleForgotPress}
                                        >
                                            <RNText textStyle={{ color: COLORS.PRIMARY }}>Forgot PIN?</RNText>
                                        </TouchableOpacity>
                                    </RNText>
                                )}
                                <RNText textStyle={{ ...styles.signInTextStyle }}>
                                    <TouchableOpacity
                                        onPress={handleForgotPress}
                                    >
                                        <RNText textStyle={{ color: COLORS.PRIMARY }}>Not {maskMobile}?</RNText>
                                    </TouchableOpacity>
                                </RNText>
                            </View>

                            <View style={{ marginTop: VP(34) }}>
                                <Button
                                    text={'Enter & Proceed'}
                                    onPress={() => handleOnPress()}
                                    textStyle={styles.buttonStyle}
                                    isLoading={loading}
                                    disabled={wrongOTP >= otpRetryCount ? true : false}
                                    activeButtonText={{ opacity: .65 }}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </InnerBlock>
        </OuterLayout>
    );
};
export default PinLogin;