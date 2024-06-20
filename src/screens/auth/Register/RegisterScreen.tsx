import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, TouchableOpacity, View } from 'react-native';
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

type NavigationProp = NativeStackScreenProps<AuthStackParamList>;

const RegisterScreen: React.FunctionComponent<NavigationProp> = ({
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
                                we will send you a <RNText textStyle={styles.paraBold}>One Time Password (OTP)</RNText> on this mobile number
                            </RNText>
                        </View>
                        {/* <View style={{ alignSelf: 'center', marginTop: VP(45)  }}>
                            <RNText textStyle={styles.paraTitle}>
                                Enter Mobile number
                            </RNText>
                        </View> */}
                        <View style={styles.formContainer}>
                            <View style={styles.inputContainer}>
                                <ValidationTextInput placeholder="Enter Mobile number" />
                            </View>

                            <View style={{ marginTop: VP(34) }}>
                                <Button
                                    text={'Get OTP'}
                                    onPress={() =>
                                        navigation.navigate(
                                            navigationString.VERIFY_CODE,
                                        )
                                    }
                                    textStyle={styles.buttonStyle}
                                    style={{
                                        // backgroundColor: '#5C44E4'
                                    }}
                                />
                            </View>
                            <View style={styles.signInTextContainer}>
                                <View style={{ flex: 1, height: 1, backgroundColor: '#A1A1A1' }} />
                                <RNText textStyle={styles.signInTextStyle}>
                                    or sign in using
                                </RNText>
                                <View style={{ flex: 1, height: 1, backgroundColor: '#A1A1A1', width: "100%" }} />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </InnerBlock>
        </OuterLayout>
    );
};
export default RegisterScreen;
