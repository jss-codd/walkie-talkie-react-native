import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, TextInput, TouchableOpacity, View, Image } from 'react-native';
import OuterLayout from '../../../components/OuterLayout';
import { AuthStackParamList } from '../../../navigations/AuthStackNavigator';
import { styles } from './styles';
import InnerBlock from '../../../components/InnerBlock';
import { RNText } from '../../../components/RNText';
import ValidationTextInput from '../../../components/ValidationTextInput';
import { Button } from '../../../components/Button';
import { navigationString } from '../../../utils/navigationString';
import { BACKEND_URL, COLORS, errorMessage } from '../../../utils/constants';
import Mobile from '../../../assets/svgs/mobile.svg';
import { HP, VP } from '../../../utils/Responsive';
import ArrowLeftSquare from '../../../assets/svgs/arrow-left-square.svg';
import { MainStackParamList } from '../../../navigations/MainStackNavigator';
import { loadStorage, removeStorage, saveStorage } from '../../../utils/storage';
import OTPInput from '../../../components/OTPInput';
import axios from 'axios';
import { showAlert } from '../../../utils/alert';
import { getConfig } from '../../../utils/axiosConfig';
import { maskInput } from '../../../utils/commonHelper';

const pinCheck = /^[0-9]{4}$/;

const PinLogin: React.FunctionComponent<any> = ({
    navigation,
}) => {
    const [pin, setPin] = useState('');
    const [errorPin, setErrorPin] = useState({ status: false, text: "" });
    const [loading, setLoading] = useState(false);
    const [maskMobile, setMaskMobile] = useState("");

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

            // console.log(dataPayload, 'dataPayload pin-login')

            axios.post(BACKEND_URL + '/pin-login', dataPayload)
                .then(response => {
                    // console.log("pin-login: ", response.data);
                    setLoading(false);

                    if (response.data.success && response.data.mobile && response.data.jwt) {
                        saveStorage({ ...userDetails, "mobile": response.data.mobile, "jwt": response.data.jwt }, "userDetails");

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
                                <RNText textStyle={{ ...styles.signInTextStyle }}>
                                    {/* Oh-Oh Invalid PIN! Only 4 attemps are left. */}
                                    <TouchableOpacity
                                        onPress={handleForgotPress}
                                    >
                                        <RNText textStyle={{ color: COLORS.PRIMARY }}>Forgot PIN?</RNText>
                                    </TouchableOpacity>
                                </RNText>
                                <RNText textStyle={{ ...styles.signInTextStyle }}>
                                    {/* Oh-Oh Invalid PIN! Only 4 attemps are left. */}
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