import React, { useEffect } from 'react';
import { StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { HP, VP } from '../../utils/Responsive';
import { loadStorage } from '../../utils/storage';

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