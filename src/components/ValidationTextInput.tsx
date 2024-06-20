import React, {useState, useRef} from 'react';
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

interface OutlinedTextInputProps extends TextInputProps {
    placeholder: string;
    stylesPlaceholder?: TextStyle;
}

const ValidationTextInput: React.FC<OutlinedTextInputProps> = ({
    placeholder,
    stylesPlaceholder,
    ...rest
}) => {
    const [text, setText] = useState('');
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
        <View style={styles.container}>
            <Animated.Text
                style={[
                    styles.placeholder,
                    isFocused
                        ? TextStyles.NUNITO_EXTRA_BOLD
                        : TextStyles.NUNITO_MEDIUM,
                    {
                        transform: [{translateY}],
                        fontSize: isFocused ? FS(15) : FS(18),
                        color: isFocused
                            ? COLORS.TEXT
                            : COLORS.PLACEHOLDER_COLOR,
                        top: isFocused ? VP(12) : VP(20),
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        // borderColor: COLORS.PRIMARY,
        // borderRadius: HP(70),
        height: VP(63),
        width: HP(294),
        borderBottomColor: "#A1A1A1",
    },
    input: {
        height: VP(63),
        width: HP(294),
        color: COLORS.PLACEHOLDER_COLOR,
        fontSize: FS(16),
        // paddingHorizontal: HP(30),
        // paddingVertical: HP(15),
    },
    placeholder: {
        position: 'absolute',
        left: HP(65),
        zIndex: 1,
        backgroundColor: 'transparent',
        textAlign: "center"
    },
});

export default ValidationTextInput;
