import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, LogBox } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import messaging from '@react-native-firebase/messaging';
import { NavigationContainer } from '@react-navigation/native';
import axios from 'axios';

import HeadlessTask from './HeadlessTask';
import { showAlert } from './src/utils/alert';
import { AlertMessages, BACKEND_URL } from './src/utils/constants';
import { loadStorage, recordingStorage, saveStorage } from './src/utils/storage';
import { SettingContext } from './src/context/SettingContext';
import MainStackNavigator from './src/navigations/MainStackNavigator';
import { refreshAuthToken } from './src/utils/apiCall';
import { onDisplayNotification } from './src/utils/notifeeHelper';

const settingsDefault = {
  notificationStatus: true,
  audioPlayStatus: true
}

const profileDefault = {
  name: "",
  email: "",
  mobile: "",
  location: "",
  profile_img: ""
}

axios.interceptors.request.use(
  async config => {
    const userDetails = await loadStorage("userDetails");
    const token = userDetails.jwt;
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    // config.headers['Content-Type'] = 'application/json';
    return config
  },
  error => {
    Promise.reject(error)
  }
)

axios.interceptors.response.use(
  response => {
    return response
  },
  async function (error) {
    const originalRequest = error.config;

    if (error.response.status === 401 || error.response.status === 403) {
      console.log('------------------unauthorized');
      originalRequest._retry = true;

      const userDetails = await loadStorage("userDetails");

      console.log(userDetails, '-----------------userDetails');

      const dataPayload = {
        "pin": userDetails.pin,
        "mobile": userDetails.mobile
      };

      const response: any = await refreshAuthToken(dataPayload);

      if (response.data.success && response.data.jwt && response.data.mobile) {
        saveStorage({ ...userDetails, "jwt": response.data.jwt, "mobile": response.data.mobile }, "userDetails");
        axios.defaults.headers.common['Authorization'] =
          'Bearer ' + response.data.jwt
      }

      return axios(originalRequest)
    }

    return Promise.reject(error)
  }
)

LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications

function App(): React.JSX.Element {
  const [isConnected, setConnected] = useState(true);
  const [settings, setSettings] = useState(settingsDefault);
  const [proflieDetails, setProflieDetails] = useState(profileDefault);
  const [route, setRoute] = useState({});

  const settingHandler = (key: any, data: any) => {
    saveStorage({ ...settings, [key]: data }, "settings");
    setSettings((pre) => ({ ...pre, [key]: data }));
  }

  const contextData = { ...settings, handler: settingHandler, proflieDetails, setProflieDetails, route, setRoute };

  const fetchSettings = async () => {
    // setLoader(true);
    const token: any = await loadStorage();

    const dataPayload = {
      "token": token?.token || ""
    };

    axios.post(BACKEND_URL + '/fetch-settings', dataPayload)
      .then(response => {
        console.log(response.data, 'response.data');
        const res = { audioPlayStatus: response.data.play_audio, notificationStatus: response.data.status };
        saveStorage(res, "settings");
        setSettings(res);
      })
      .catch(error => {
        // setLoader(false);
        showAlert('Error to fetch', "");
        console.error("Error fetch data: ", error);
      });
  }

  // check internet
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      setConnected(state.isConnected);
      if (!state.isConnected) {
        showAlert(
          AlertMessages.no_internet.title,
          AlertMessages.no_internet.message,
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // handleForegroundNotification
  useEffect(() => {
    const handleForegroundNotification = messaging().onMessage(
      (message: any) => {
        console.log('Foreground notification:');
        HeadlessTask(message);

        recordingStorage(message);

        onDisplayNotification(message.notification.title, message.notification.body);
      },
    );

    return handleForegroundNotification;
  }, []);

  // handleBackgroundNotification
  useEffect(() => {
    const handleBackgroundNotification =
      messaging().setBackgroundMessageHandler(message => {
        console.log('Background notification:');

        HeadlessTask(message);

        recordingStorage(message);
        // Customize the handling of the notification based on your app's requirements
        return Promise.resolve();
      });

    return handleBackgroundNotification;
  }, []);

  // fetch settings
  useEffect(() => {
    (async () => {
      const settingsData = await loadStorage("settings");
      const userProfile = await loadStorage("userProfile");

      if (!settingsData || !settingsData.hasOwnProperty("notificationStatus")) {
        saveStorage(settings, "settings");
      } else {
        setSettings((pre) => ({ ...settingsData }));
      }

      if (!userProfile || !userProfile.hasOwnProperty("name")) {
        saveStorage(proflieDetails, "userProfile");
      } else {
        setProflieDetails((pre) => ({ ...userProfile }));
      }

      // fetchSettings();
    })()
  }, [])

  if (isConnected === false) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>
          Please turn on the Internet to use App.
        </Text>
      </View>
    );
  }

  return (
    <SettingContext.Provider value={contextData}>
      <NavigationContainer>
        <MainStackNavigator />
      </NavigationContainer>
    </SettingContext.Provider>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

export default App;
