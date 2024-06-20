import React from 'react';
import RecordingList from '../../components/RecordingList';
import OuterLayout from '../../components/OuterLayout';
import InnerBlock from '../../components/InnerBlock';
import { COLORS } from '../../utils/constants';
import { View, Text, StyleSheet } from 'react-native';
import { RNText } from '../../components/RNText';
import { TextStyles } from '../../utils/TextStyles';
import { FS, VP } from '../../utils/Responsive';
import { Button } from '../../components/Button';

function RecordingListScreen(): React.JSX.Element {
    return (
        <OuterLayout containerStyle={{ backgroundColor: COLORS.BACKGROUND }}>
            <InnerBlock>
                <View style={styles.container}>
                    <RNText textStyle={styles.heading}>
                        last 5 talks
                    </RNText>
                </View>
                <RecordingList />
                <View style={{ margin: "auto" }}>
                    <Button
                        text={'Clear Notifications'}
                        onPress={() => void (0)
                            // navigation.navigate(
                            //     navigationString.VERIFY_CODE,
                            // )
                        }
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
});

export default RecordingListScreen;