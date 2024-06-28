import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Button, AppState, TextInput, Image, TouchableOpacity, TouchableHighlight, Pressable } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { showAlert } from '../../utils/alert';
import { AlertMessages, BACKEND_URL, COLORS } from '../../utils/constants';;
import { askInitialPermission, checkPermissions } from '../../utils/permissions';
import { clearWatch, getLocation, returnLocation, watchPosition } from '../../utils/location';
import VoiceRecorder from '../../components/VoiceRecorder';
import LocationAlertModal from '../../components/LocationAlertModal';
import { FS, HP, VP } from '../../utils/Responsive';
import { navigationString } from '../../utils/navigationString';
import { RNText } from '../../components/RNText';
import { TextStyles } from '../../utils/TextStyles';
import History from '../../assets/svgs/history.svg';
import Location from '../../assets/svgs/location.svg';
import Microphone from '../../assets/svgs/microphone.svg';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { loadStorage } from '../../utils/storage';
import { getConfig } from '../../utils/axiosConfig';

function SplashScreen({ navigation }: { navigation: any }): React.JSX.Element {

  useEffect(() => {
    setTimeout(async () => {
      const userDetails = await loadStorage("userDetails");

      if (userDetails && userDetails.hasOwnProperty("jwt") && userDetails.hasOwnProperty("mobile")) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'PinLoginScreen',
            },
          ],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'RegisterScreen',
            },
          ],
        });
      }

    }, 1000)
  }, [])

  return (
    <>
      <LinearGradient
        colors={['rgba(54,231,244,.5)', '#ffffff', 'rgba(244,54,136,.5)']}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Image source={require('../../assets/images/logo.png')} style={styles.icon} />
      </LinearGradient>
    </>
  )
}

const styles = StyleSheet.create({
  icon: {
    width: HP(300),
    height: VP(230),
  },
});

export default SplashScreen;