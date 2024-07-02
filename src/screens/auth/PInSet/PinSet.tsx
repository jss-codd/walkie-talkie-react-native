import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import axios from 'axios';

import OuterLayout from '../../../components/OuterLayout';
import { styles } from './styles';
import InnerBlock from '../../../components/InnerBlock';
import { RNText } from '../../../components/RNText';
import { Button } from '../../../components/Button';
import { navigationString } from '../../../utils/navigationString';
import { BACKEND_URL, errorMessage } from '../../../utils/constants';
import Mobile from '../../../assets/svgs/mobile.svg';
import { VP } from '../../../utils/Responsive';
import ArrowLeftSquare from '../../../assets/svgs/arrow-left-square.svg';
import { loadStorage, saveStorage } from '../../../utils/storage';
import OTPInput from '../../../components/OTPInput';
import { showAlert } from '../../../utils/alert';

const pinSteps = { currentStep: 1, pin1: "", pin2: "" }

const pinCheck = /^[0-9]{4}$/;

const PinSet: React.FunctionComponent<any> = ({
    navigation,
}) => {
    const [pin1, setPin1] = useState('');
    const [errorPin1, setErrorPin1] = useState({ status: false, text: "" });
    const [pin2, setPin2] = useState('');
    const [errorPin2, setErrorPin2] = useState({ status: false, text: "" });
    const [loading, setLoading] = useState(false);
    const [pinStep, setPinStep] = useState(pinSteps);

    const handleOnPressPin1 = async () => {
        try {
            const userDetails = await loadStorage("userDetails");

            if (!userDetails || !userDetails.hasOwnProperty("mobile") || !userDetails.hasOwnProperty("jwt")) {
                navigation.navigate(
                    navigationString.REGISTER_SCREEN,
                )
            }

            const inputValue = pin1.trim();

            if (pinCheck.test(inputValue) == false) {
                throw new Error(errorMessage.pin);
            }

            setErrorPin1({ status: false, text: "" });

            setPinStep((pre) => ({ currentStep: 2, pin1: inputValue, pin2: "" }));

        } catch (err: any) {
            setErrorPin1((pre) => ({ status: true, text: err.message }))
        }
    };

    const handleOnPressPin2 = async () => {
        try {
            const inputValue = pin2.trim();

            if (pinCheck.test(inputValue) == false) {
                throw new Error(errorMessage.pin);
            }

            if (pinStep.pin1 !== inputValue) {
                throw new Error(errorMessage.pinConfirm);
            }

            setLoading(true);

            setErrorPin2({ status: false, text: "" });

            const dataPayload = {
                "pin": inputValue

            };

            const userDetails = await loadStorage("userDetails");

            axios.post(BACKEND_URL + '/pin-set', dataPayload)
                .then(response => {
                    console.log("response.data: ", response.data);
                    setLoading(false);

                    if (response.data.success && response.data.pin) {

                        saveStorage({ ...userDetails, "pin": response.data.pin }, "userDetails");

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
            setErrorPin2((pre) => ({ status: true, text: err.message }))
        }
    };

    useEffect(() => {
        (async () => {
            const userDetails = await loadStorage("userDetails");

            if (!userDetails || !userDetails.hasOwnProperty("mobile") || !userDetails.hasOwnProperty("jwt")) {
                navigation.navigate(
                    navigationString.REGISTER_SCREEN,
                )
            }
        })()
    }, [])

    return (
        <OuterLayout containerStyle={styles.containerStyle}>
            <InnerBlock>
                <View style={styles.container}>
                    <View style={{ marginLeft: VP(20), marginTop: VP(20) }}>
                        {pinStep.currentStep == 2 && (

                            <TouchableOpacity
                                onPress={() => setPinStep(pinSteps)}
                            >
                                <ArrowLeftSquare height={21} width={21} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.startContainer}>
                            <Mobile height={VP(160)} />
                        </View>
                        <View style={styles.paraContainer}>
                            <RNText textStyle={styles.paraHeadingStyle}>
                                {pinStep.currentStep == 1 ? (<>1 - Set 4 Digit Pin</>) : <>2 - Confirm 4 Digit Pin</>}
                            </RNText>
                        </View>
                        <View style={{ alignSelf: 'center', marginTop: VP(18) }}>
                            <RNText textStyle={styles.paraStyle}>
                                To keep your information secure
                            </RNText>
                        </View>
                        <View style={styles.formContainer}>
                            <View style={styles.inputContainer}>
                                {pinStep.currentStep == 1 && (
                                    <OTPInput formProps={{ value: pin1, setValue: setPin1, error: errorPin1 }} />
                                )}
                                {pinStep.currentStep == 2 && (
                                    <OTPInput formProps={{ value: pin2, setValue: setPin2, error: errorPin2 }} />
                                )}
                            </View>

                            <View style={{ marginTop: VP(34) }}>
                                {pinStep.currentStep == 1 && (
                                    <Button
                                        text={'Set & Proceed'}
                                        onPress={() => handleOnPressPin1()}
                                        textStyle={styles.buttonStyle}
                                        isLoading={loading}
                                    />
                                )}
                                {pinStep.currentStep == 2 && (
                                    <Button
                                        text={'Confirm & Proceed'}
                                        onPress={() => handleOnPressPin2()}
                                        textStyle={styles.buttonStyle}
                                        isLoading={loading}
                                    />
                                )}
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </InnerBlock>
        </OuterLayout>
    );
};
export default PinSet;
