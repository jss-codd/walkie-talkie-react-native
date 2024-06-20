/*
FS = Font Size
VP = Vertical Pixel
HP = Horizontal Pixel
*/

import {scale, verticalScale, moderateScale} from 'react-native-size-matters';

export const FS = (value: number) => scale(value);
export const VP = (value: number) => verticalScale(value);
export const HP = (value: number) => moderateScale(value);
