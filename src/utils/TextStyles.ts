import {TextStyle} from 'react-native';
import { FS } from './Responsive';
import { COLORS } from './constants';

export const TextStyles: Record<string, TextStyle> = {
    SOFIA_SEMI_BOLD: {
        fontFamily: 'SofiaSans-SemiBold',
        color: COLORS.BLACK,
        fontSize: FS(24),
        fontWeight: '600',
    },
    SOFIA_SEMI_LIGHT: {
        fontFamily: 'SofiaSans-Light',
        color: COLORS.BLACK,
        fontSize: FS(16),
        fontWeight: '300',
    },
    SOFIA_BOLD: {
        fontFamily: 'SofiaSans-Bold',
        color: COLORS.BLACK,
        fontSize: FS(16),
        fontWeight: '700',
    },
    SOFIA_REGULAR: {
        fontFamily: 'SofiaSans-Regular',
        color: COLORS.BLACK,
        fontSize: FS(16),
        fontWeight: '400',
    },
    SOFIA_MEDIUM: {
        fontFamily: 'SofiaSans-Regular',
        color: COLORS.BLACK,
        fontSize: FS(16),
        fontWeight: '500',
    }
};
