import React, { useState } from 'react';
import RecordingList from '../../components/RecordingList';
import OuterLayout from '../../components/OuterLayout';
import InnerBlock from '../../components/InnerBlock';
import { COLORS } from '../../utils/constants';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { RNText } from '../../components/RNText';
import { TextStyles } from '../../utils/TextStyles';
import { FS, VP } from '../../utils/Responsive';
import { Button } from '../../components/Button';
import { navigationString } from '../../utils/navigationString';
import { removeStorage } from '../../utils/storage';

function RecordingListScreen({ navigation }: { navigation: any }): React.JSX.Element {
    const [reload, setReload] = useState(0);

    const clearNotification = () => {
        removeStorage("recordingList");
        setReload((pre) => (++pre));
    }

    return (
        <OuterLayout containerStyle={{ backgroundColor: COLORS.BACKGROUND }}>
            <InnerBlock>
                <View style={styles.container}>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate(
                                navigationString.HOME_SCREEN,
                            )}
                        style={{}}
                    >
                        <Image source={require('../../assets/icons/arrow-left.png')} style={styles.icon} />
                    </TouchableOpacity>
                </View>
                <View style={{ ...styles.container, marginTop: VP(10), paddingVertical: 0 }}>
                    <RNText textStyle={styles.heading}>
                        last 5 talks
                    </RNText>
                </View>
                <RecordingList reload={reload} />
                <View style={{ margin: "auto", paddingHorizontal: 0, paddingVertical: 12 }}>
                    <Button
                        text={'Clear Notifications'}
                        onPress={clearNotification}
                        textStyle={styles.buttonStyle}
                    />
                </View>
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
    },
    buttonStyle: {
        ...TextStyles.SOFIA_MEDIUM,
        fontSize: FS(16),
        color: COLORS.WHITE,
    },
    icon: {
        width: 20,
        height: 20,
    },
});

export default RecordingListScreen;