import React from 'react';
import {
    View,
    TouchableOpacity,
    StyleProp,
    ViewStyle,
    StyleSheet,
    ActivityIndicator,
    TextStyle,
} from 'react-native';
import { RNText } from './RNText';
import { HP } from '../utils/Responsive';
import { COLORS } from '../utils/constants';
import { TextStyles } from '../utils/TextStyles';
import LinearGradient from 'react-native-linear-gradient';


type Props = {
    text: string;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    isLoading?: boolean;
    disabled?: boolean;
    Icon?: JSX.Element;
    contentContainerStyle?: StyleProp<ViewStyle>;
    activityIndicatorColor?: string;
    textStyle?: StyleProp<TextStyle>;
    activeButtonText?: StyleProp<TextStyle>;
    LinearGradienrColor?: string[]
};

export const Button: React.FunctionComponent<Props> = ({
    text,
    onPress,
    style,
    isLoading,
    textStyle,
    disabled,
    Icon,
    contentContainerStyle,
    activityIndicatorColor,
    activeButtonText,
    LinearGradienrColor = ['#5C44E4', '#753E8D']
}) => {
    const handleButtonPress = () => {
        if (isLoading || disabled) {
            return;
        }
        onPress();
    };
    const isButtonDisabled = () => {
        return disabled || isLoading;
    };

    const getButtonStyle = () => {
        if (disabled || isLoading) {
            return styles.disabledButton;
        } else {
            return null;
        }
    };

    const renderButton = () => {
        if (isLoading) {
            return (
                <View
                    style={[
                        styles.buttonContentContainer,
                        contentContainerStyle,
                    ]}
                >
                    <ActivityIndicator
                        color={activityIndicatorColor || COLORS.WHITE}
                        size="small"
                    />
                </View>
            );
        } else {
            return (
                <>
                    <View
                        style={[
                            styles.buttonContentContainer,
                            contentContainerStyle,
                        ]}
                    >
                        {Icon ? Icon : null}
                        <RNText
                            textStyle={[
                                disabled || isLoading
                                    ? activeButtonText
                                    : styles.activeButtonText,
                                textStyle,
                            ]}
                        >
                            {text}
                        </RNText>
                    </View>
                </>
            );
        }
    };

    return (
        <>
            <LinearGradient style={{ borderRadius: HP(8) }} start={{ x: 0, y: 0 }} end={{ x: 2, y: 0 }} colors={LinearGradienrColor}>
                <TouchableOpacity
                    onPress={handleButtonPress}
                    disabled={isButtonDisabled()}
                    style={[styles.button, getButtonStyle(), style]}
                >
                    {renderButton()}
                </TouchableOpacity>
            </LinearGradient>
        </>
    );
};

const styles = StyleSheet.create({
    button: {
        width: HP(343),
        height: HP(44),
        borderRadius: HP(8),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContentContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        flexDirection: "row",
        gap: 10,
    },
    disabledButton: {
        backgroundColor: COLORS.PRIMARY,
    },
    activeButtonText: {
        ...TextStyles.SOFIA_SEMI_BOLD,
        color: COLORS.WHITE,
    },
});
