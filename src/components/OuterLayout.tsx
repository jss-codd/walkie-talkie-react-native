import React, { ReactNode } from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';

import { COLORS } from '../utils/constants';

interface OuterLayoutProps {
    children: ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
}

const OuterLayout: React.FC<OuterLayoutProps> = ({
    children,
    containerStyle,
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <StatusBar barStyle={'default'} />
            <SafeAreaView>{children}</SafeAreaView>
        </View>
    );
};

export default OuterLayout;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.TEXT,
    },
});
