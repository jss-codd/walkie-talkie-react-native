import React, { ReactNode } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';

interface InnerBlockProps {
    children: ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
}

const InnerBlock: React.FC<InnerBlockProps> = ({ children, containerStyle }) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <KeyboardAvoidingView
                style={[styles.container, containerStyle]}
                behavior={Platform.select({ ios: 'padding', android: undefined })}
            >
                {children}
            </KeyboardAvoidingView>
        </View>
    );
};

export default InnerBlock;

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
    },
});
