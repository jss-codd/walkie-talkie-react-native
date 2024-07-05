import React, { useEffect } from 'react';
import { StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { HP, VP } from '../../utils/Responsive';
import { loadStorage } from '../../utils/storage';
import { refreshAuthToken } from '../../utils/apiCall';

function SplashScreen({ navigation }: { navigation: any }): React.JSX.Element {
  useEffect(() => {
    setTimeout(async () => {
      try {
        const userDetails = await loadStorage("userDetails");
        const tokenGet = await loadStorage();

        if (userDetails && userDetails.hasOwnProperty("jwt") && userDetails.hasOwnProperty("mobile") && userDetails.hasOwnProperty("pin")) {
          // get user details
          const dataPayload = {
            "pin": userDetails.pin,
            "mobile": userDetails.mobile
          };

          const response: any = await refreshAuthToken(dataPayload);

          if (response.data.success && response.data.jwt && response.data.mobile && response.data.token) {
            if (tokenGet.token !== response.data.token) {
              throw new Error('Logged Out User');
            }
          } else {
            throw new Error('Logged Out User');
          }

          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'PinLoginScreen',
              },
            ],
          });
        } else {
          throw new Error('Logged Out User');
        }
      } catch (err) {
        console.warn(err, 'err');
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