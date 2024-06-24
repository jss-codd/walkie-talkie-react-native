import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, TouchableOpacity, View, Image, BackHandler } from 'react-native';
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
import axios from 'axios';
import { showAlert } from '../../../utils/alert';
import { removeStorage, saveStorage } from '../../../utils/storage';

type NavigationProp = NativeStackScreenProps<AuthStackParamList>;

const mob = /^[1-9]{1}[0-9]{9}$/;

const RegisterScreen: React.FunctionComponent<NavigationProp> = ({
    navigation,
}) => {
    const [text, setText] = useState('');
    const [error, setError] = useState({ status: false, text: "" });
    const [loading, setLoading] = useState(false);

    const handleOnPress = () => {
        try {
            // navigation.navigate(
            //     navigationString.VERIFY_CODE,
            // )
            const inputValue = text.trim();

            if (mob.test(inputValue) == false) {
                throw new Error(errorMessage.mobile_no);
            }

            setLoading(true);

            setError({ status: false, text: "" });

            const dataPayload = {
                "mobile": inputValue
            };

            axios.post(BACKEND_URL + '/mobile-verification', dataPayload)
                .then(response => {
                    // console.log("response.data: ", response.data);
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
                    showAlert(errorMessage.commonError, "");
                    console.warn("Error sending data: ", error.message);
                });

        } catch (err: any) {
            setError((pre) => ({ status: true, text: err.message }))
        }

        // navigation.goBack();
    };

    useEffect(() => {
        removeStorage("signupMobile");
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
                                <ValidationTextInput placeholder="Enter Mobile number" keyboardType="numeric" maxLength={10} formProps={{ text, setText, error }} />
                            </View>

                            <View style={{ marginTop: VP(34) }}>
                                <Button
                                    text={'Get OTP'}
                                    onPress={() => handleOnPress()}
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
