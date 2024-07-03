import React, { useState, useRef } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Animated,
    TextInputProps,
    TextStyle,
} from 'react-native';

import { COLORS } from '../utils/constants';
import { FS, HP, VP } from '../utils/Responsive';
import { TextStyles } from '../utils/TextStyles';
import { RNText } from './RNText';

interface OutlinedTextInputProps extends TextInputProps {
    placeholder: string;
    stylesPlaceholder?: TextStyle;
    formProps: any;
}

const ValidationTextInput: React.FC<OutlinedTextInputProps> = ({
    placeholder,
    stylesPlaceholder,
    formProps,
    ...rest
}) => {
    const { text, setText, error } = formProps;
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);
    const translateY = useRef(new Animated.Value(0)).current;

    const focusInput = () => {
        setIsFocused(true);
        Animated.timing(translateY, {
            toValue: -11,
            duration: 150,
            useNativeDriver: false,
        }).start();
    };

    const blurInput = () => {
        if (!text) {
            setIsFocused(false);
            Animated.timing(translateY, {
                toValue: 0,
                duration: 150,
                useNativeDriver: false,
            }).start();
        }
    };

    return (
        <View style={{ ...styles.container, borderBottomColor: error.status ? COLORS.RED : "#A1A1A1" }}>
            <Animated.Text
                style={[
                    styles.placeholder,
                    isFocused
                        ? TextStyles.NUNITO_EXTRA_BOLD
                        : TextStyles.NUNITO_MEDIUM,
                    {
                        transform: [{ translateY }],
                        fontSize: isFocused ? FS(15) : FS(18),
                        color: isFocused
                            ? COLORS.TEXT
                            : COLORS.PLACEHOLDER_COLOR,
                        top: isFocused ? VP(0) : VP(20),
                    },
                    stylesPlaceholder
                ]}
            >
                {placeholder}
            </Animated.Text>
            <TextInput
                ref={inputRef}
                style={styles.input}
                value={text}
                onChangeText={setText}
                onFocus={focusInput}
                onBlur={blurInput}
                {...rest}
            />
            <RNText textStyle={{ color: COLORS.RED, textAlign: "center", paddingTop: 5 }}>{error.text}</RNText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        height: VP(63),
        width: HP(294),
    },
    input: {
        ...TextStyles.SOFIA_REGULAR,
        height: VP(80),
        width: HP(294),
        color: COLORS.BLACK,
        fontSize: FS(20)
        // paddingHorizontal: HP(30),
        // paddingVertical: HP(15),
    },
    placeholder: {
        position: 'absolute',
        left: HP(65),
        // zIndex: 1,
        backgroundColor: 'transparent',
        textAlign: "center"
    },
});

export default ValidationTextInput;
