import React, { useEffect, useState } from 'react';
import RecordingList from '../../components/RecordingList';
import OuterLayout from '../../components/OuterLayout';
import InnerBlock from '../../components/InnerBlock';
import { COLORS } from '../../utils/constants';
import { View, Text, StyleSheet } from 'react-native';
import { RNText } from '../../components/RNText';
import { TextStyles } from '../../utils/TextStyles';
import { FS, VP } from '../../utils/Responsive';
import { Button } from '../../components/Button';
import Profile from '../../components/Profile';
import ProfileEdit from '../../components/ProfileEdit';
import { useIsFocused } from '@react-navigation/native';

function ProfileScreen({ navigation }: { navigation: any }): React.JSX.Element {
    const isFocused = useIsFocused();

    const [editScreen, setEditScreen] = useState(false);

    const screenChangeHandler = (): void => {
        setEditScreen((pre) => !pre);
    }

    useEffect(() => {
        if (isFocused) {
            setEditScreen(false);
        }
    }, [isFocused])

    return (
        <OuterLayout containerStyle={{ backgroundColor: COLORS.BACKGROUND }}>
            <InnerBlock>
                {editScreen ? (<ProfileEdit handler={screenChangeHandler} />) : (<Profile navigation={navigation} handler={screenChangeHandler} />)}
            </InnerBlock>
        </OuterLayout>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 12
    },
    heading: {
        ...TextStyles.SOFIA_SEMI_BOLD,
        fontSize: FS(14)
    }
});

export default ProfileScreen;