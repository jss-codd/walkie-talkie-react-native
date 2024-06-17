import React, { createContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import messaging from '@react-native-firebase/messaging';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Header, getHeaderTitle } from '@react-navigation/elements';
import axios from 'axios';

import HeadlessTask from './HeadlessTask';
import { showAlert } from './src/utils/alert';
import { AlertMessages, BACKEND_URL } from './src/utils/constants';
import { loadStorage, recordingStorage, saveStorage } from './src/utils/storage';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import RecordingListScreen from './src/screens/RecordingListScreen';
import Home from './src/assets/svgs/home.svg';
import Settings from './src/assets/svgs/settings.svg';
import Clock from './src/assets/svgs/clock-check.svg';
import { SettingContext } from './src/context/SettingContext';

const Tab = createBottomTabNavigator();

function LogoTitle(props: any) {
  return (
    <Image
      style={{ width: 300, height: 80 }}
      source={require('./src/icons/logo.png')}
    />
  );
}

function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: ({ options, route }) => (
          <Header headerTitle={(props) => <LogoTitle {...props} />} headerTitleAlign="center" {...options} title={getHeaderTitle(options, route.name)} />
        ),
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <Home height={32} width={32} />;
          } else if (route.name === 'Settings') {
            return <Settings height={32} width={32} />;
          } else {
            return <Clock height={32} width={32} />;
          }

        },
        tabBarActiveTintColor: 'orange',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { fontSize: 12, fontWeight: 600 },
        headerStyle: {
          height: 100,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Last Talks" component={RecordingListScreen} />
    </Tab.Navigator>
  );
}

const settingsDefault = {
  notificationStatus: true,
  audioPlayStatus: true
}

function App(): React.JSX.Element {
  const [isConnected, setConnected] = useState(false);
  const [settings, setSettings] = useState(settingsDefault);

  
  const settingHandler = (key: any, data: any) => {
    saveStorage({ ...settings, [key]: data }, "settings");
    setSettings((pre) => ({ ...pre, [key]: data }));
  }
  
  const contextData = { ...settings, handler: settingHandler };

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
    fetchSettings();
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
        <MyTabs />
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
