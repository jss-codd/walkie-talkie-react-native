import {StyleSheet} from 'react-native';
import { FS, HP, VP } from '../../../utils/Responsive';
import { TextStyles } from '../../../utils/TextStyles';
import { COLORS } from '../../../utils/constants';

export const styles = StyleSheet.create({
    //
    container: {
        flex: 1,
        // justifyContent: "center",
        // alignItems: "center",
        // flexDirection: "row"
    },
    //
    formContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: VP(45),
        // paddingBottom: VP(60),

    },
    //
    containerStyle: {
        backgroundColor: COLORS.BACKGROUND,
    },
    //
    startContainer: {
        // marginLeft: HP(49),
        marginTop: VP(95),
        alignSelf: 'center',
    },
    //
    paraContainer: {
        // marginHorizontal: HP(49),
        marginTop: VP(40),
        marginBottom: VP(11),
        alignSelf: 'center',
    },
    //
    paraHeadingStyle: {
        ...TextStyles.SOFIA_SEMI_BOLD,
        fontSize: FS(24),
        color: COLORS.BLACK,
        lineHeight: 28.8,
    },
    //
    paraStyle: {
        ...TextStyles.SOFIA_SEMI_LIGHT,
        fontSize: FS(16),
        color: COLORS.TEXT,
        lineHeight: 20,
        textAlign: "center"
    },
    //
    paraBold: {
        ...TextStyles.SOFIA_BOLD,
        fontSize: FS(16),
        color: COLORS.TEXT,
        lineHeight: 19,
        textAlign: "center"
    },
    paraTitle: {
        ...TextStyles.SOFIA_REGULAR,
        fontSize: FS(16),
        color: COLORS.TEXT,
        lineHeight: 25,
        textAlign: "center"
    },
    //
    inputContainer: {
        marginBottom: VP(11),
    },
    //
    buttonStyle: {
        ...TextStyles.SOFIA_MEDIUM,
        fontSize: FS(16),
        color: COLORS.WHITE,
    },
    //
    signInTextContainer: {
        marginTop: VP(15),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        display: "flex",
        padding: 14
    },
    //
    signInTextStyle: {
        ...TextStyles.NUNITO_REGULAR,
        fontSize: FS(14),
        color: COLORS.TEXT,
        textAlign: "center",
        width: HP(120)
    }
});
