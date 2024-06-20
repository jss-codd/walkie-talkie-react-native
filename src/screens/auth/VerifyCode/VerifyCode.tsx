import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import OuterLayout from '../../../components/OuterLayout';
import { AuthStackParamList } from '../../../navigations/AuthStackNavigator';
import { styles } from './styles';
import InnerBlock from '../../../components/InnerBlock';
import { RNText } from '../../../components/RNText';
import ValidationTextInput from '../../../components/ValidationTextInput';
import { Button } from '../../../components/Button';
import { navigationString } from '../../../utils/navigationString';
import { COLORS } from '../../../utils/constants';
import Mobile from '../../../assets/svgs/mobile.svg';
import { HP, VP } from '../../../utils/Responsive';
import { StackParamList } from '../../../navigations/MainTabNavigator';

type NavigationProp = NativeStackScreenProps<StackParamList>;

const VerifyCode: React.FunctionComponent<NavigationProp> = ({
    navigation,
}) => {
    const handleOnPress = () => {
        navigation.goBack();
    };

    return (
        <OuterLayout containerStyle={styles.containerStyle}>
            <InnerBlock>
                <View style={styles.container}>
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
                                Enter The OTP Sent to <RNText textStyle={styles.paraBold}>1234-567-898</RNText>
                            </RNText>
                        </View>
                        <View style={styles.formContainer}>
                            <View style={styles.inputContainer}>
                                <ValidationTextInput placeholder="Enter OTP" stylesPlaceholder={{left: HP(100)}} />
                            </View>

                            <View style={styles.signInTextContainer}>
                                <RNText textStyle={styles.signInTextStyle}>
                                    Didn’t receive the OTP? <RNText textStyle={{ color: COLORS.PRIMARY }}>Resend</RNText>
                                </RNText>
                            </View>

                            <View style={{ marginTop: VP(34) }}>
                                <Button
                                    text={'Verify & Proceed'}
                                    onPress={() =>
                                        navigation.navigate(
                                            navigationString.MAIN_TAB_NAVIGATOR,
                                        )
                                    }
                                    textStyle={styles.buttonStyle}
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
