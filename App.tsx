/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TextInput,
  Button,
  FlatList,
  NativeModules, AppState,
  Platform,
  PermissionsAndroid
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import messaging from '@react-native-firebase/messaging';
import HeadlessTask from './HeadlessTask';
import VoiceRecorder from './src/components/VoiceRecorder';
import { BACKEND_URL } from './src/utils/constants';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { loadStorage, saveStorage } from './src/utils/storage';
import RecordingList from './src/components/RecordingList';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [isConnected, setConnected] = useState(false);
  const [messageReceiveCount, setMessageReceiveCount] = useState(0);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const showAlert = () => {
    Alert.alert(
      "No Internet! ❌",
      "Sorry, we need an Internet connection for App to run correctly.",
      [{ text: "Okay" }]
    );
  };

  const recordingStorage = async (message: any) => {
    const list: any = await loadStorage('recordingList');

    // message.uuid = uuid.v4();

    if (Array.isArray(list)) {
      saveStorage([message, ...list], 'recordingList');
    } else {
      saveStorage([message], 'recordingList');
    }
  }

  // fetch token
  const requestUserPermission = async () => {
    try {
      await messaging().requestPermission();
      const token = await messaging().getToken();

      const dataPayload = {
        "token": token
      };

      axios.post(BACKEND_URL + '/device-token', dataPayload)
        .then(response => {
          console.log("response.data token: ", response.data);
          saveStorage({ "token": token });
        })
        .catch(error => {
          console.error("Error sending data: ", error);
        });
    } catch (error: any) {
      console.log('Permission or Token retrieval error:', error.message);
    }
  };

  // check internet
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      setConnected(state.isConnected);
      if (!state.isConnected) {
        showAlert();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // handleForegroundNotification
  useEffect(() => {
    const handleForegroundNotification = messaging().onMessage((message: any) => {
      console.log('Foreground notification:');
      HeadlessTask(message);

      recordingStorage(message);

      setMessageReceiveCount(pre => ++pre);
    });

    return handleForegroundNotification;
  }, []);

  // handleBackgroundNotification
  useEffect(() => {
    const handleBackgroundNotification = messaging().setBackgroundMessageHandler((message) => {
      console.log('Background notification:');

      HeadlessTask(message);

      recordingStorage(message);

      setMessageReceiveCount(pre => ++pre);
      // Customize the handling of the notification based on your app's requirements
      return Promise.resolve();
    });

    return handleBackgroundNotification;
  }, []);

  // permission for POST_NOTIFICATIONS
  useEffect(() => {
    if (Platform.OS === "android") {
      // Android - Requesting permissions
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      )
        .then((response) => {
          if (response === PermissionsAndroid.RESULTS.GRANTED) {
            requestUserPermission();
          } else if (response === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            requestUserPermission();
          } else if (response === PermissionsAndroid.RESULTS.DENIED) {
            console.log("permission android", response);
          }
        })
        .catch((error) => {
          console.log("PermissionsAndroid", error);
        });
    } else if (Platform.OS === "ios") {
      // iOS - Requesting permissions
      requestUserPermission();
    }
  }, [])

  const requestPermissions = async () => {
    try {
      const permissions = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      ]);
      console.log('Permissions are:', permissions);
    } catch (err) {
      console.log(err);
    }
  };

  // permission for READ_PHONE_STATE
  useEffect(() => {
    requestPermissions();
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
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />

      <View style={backgroundStyle}>
        <RecordingList messageReceiveCount={messageReceiveCount} />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  centered: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default App;