import React, { ReactNode } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

interface RNTextProps {
    children: ReactNode;
    textStyle?: StyleProp<TextStyle>;
    numberOfLines?: number;
}

export const RNText: React.FC<RNTextProps> = ({
    children,
    textStyle,
    ...rest
}) => {
    return (
        <Text style={textStyle} {...rest} aria-expanded={true}>
            {children}
        </Text>
    );
};
