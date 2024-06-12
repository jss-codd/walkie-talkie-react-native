/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useRef, useState } from 'react';
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
  NativeModules,
  AppState,
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
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import messaging from '@react-native-firebase/messaging';
import Geolocation from 'react-native-geolocation-service';
import ReactNativeForegroundService from "@supersami/rn-foreground-service";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import HeadlessTask from './HeadlessTask';
import VoiceRecorder from './src/components/VoiceRecorder';
import { BACKEND_URL } from './src/utils/constants';
import { loadStorage, saveStorage } from './src/utils/storage';
import RecordingList from './src/components/RecordingList';

const saveLocation = async (dataPayload: any) => {
  // return;
  axios.post(BACKEND_URL + '/save-location', dataPayload)
    .then(response => {
      // console.log("response.data: ", response.data);
    })
    .catch(error => {
      console.error("Error sending data: ", error);
    });
}

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

const hasLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    return true;
  }

  const granted1 = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location Access Required',
      message: 'This app needs to access your location',
      buttonPositive: 'OK',
    },
  );

  const granted2 = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
    {
      title: 'Background Location Permission',
      message:
        'We need access to your location ' +
        'so you can get live quality updates.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    },
  );

  return granted1 === PermissionsAndroid.RESULTS.GRANTED && granted2 === PermissionsAndroid.RESULTS.GRANTED;
};

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
        // console.log("response.data token: ", response.data);
        saveStorage({ "token": token });
      })
      .catch(error => {
        console.error("Error sending data: ", error);
      });
  } catch (error: any) {
    console.log('Permission or Token retrieval error:', error.message);
  }
};

const askInitialPermission = async () => {
  const grantedLocation = await hasLocationPermission();

  if (Platform.OS === "android") {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );

    if (granted == PermissionsAndroid.RESULTS.GRANTED || granted == PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      const grantedNotification = true;
      requestUserPermission();
      return grantedLocation && grantedNotification;
    }
  } else if (Platform.OS === "ios") {
    // iOS - Requesting permissions
    const grantedNotification = true;
    requestUserPermission();
    return grantedLocation && grantedNotification;
  }
}

function App(): React.JSX.Element {
  const appState = useRef(AppState.currentState);
  const isDarkMode = useColorScheme() === 'dark';
  const [isConnected, setConnected] = useState(false);
  const [messageReceiveCount, setMessageReceiveCount] = useState(0);
  const [location, setLocation] = useState<any>(null);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  const getLocation = async () => {
    Geolocation.getCurrentPosition(
      (position) => {
        // console.log(appStateVisible, 'appState.current------')
        setLocation(position);
        // return;
        // if (appState.current == 'background') {
        if (1 == 1) {
          const latitude = position?.coords?.latitude;
          const longitude = position?.coords?.longitude;

          loadStorage().then((token) => {
            const dataPayload = {
              "latitude": latitude,
              "longitude": longitude,
              "token": token?.token || ""
            };

            console.log(dataPayload, 'dataPayload1')

            saveLocation(dataPayload);
          }, (err) => {
            console.error(err, 'token error'); // Error!
          });
        }
      },
      (error) => {
        console.log(`Code ${error.code}`, error.message)
        // Alert.alert(`Code ${error.code}`, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1
  };

  // update App state
  useEffect(() => {
    // const subscription = AppState.addEventListener('change', nextAppState => {
    //   if (
    //     appState.current.match(/inactive|background/) &&
    //     nextAppState === 'active'
    //   ) {
    //     console.log('App has come to the foreground!');
    //   }

    //   appState.current = nextAppState;
    //   setAppStateVisible(appState.current);

    //   if (appState.current == 'active') {
    //     stopTask();
    //   }
    //   console.log('AppState', appState.current);
    // });

    // return () => {
    //   subscription.remove();
    // };
  }, []);

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

  // location update watcher
  useEffect(() => {
    (async () => {
      const granted = await askInitialPermission();

      if (!granted) {
        Alert.alert(`We can not access your location. Position will not work properly`);
      }

      getLocation();
      return;
      const watchId = Geolocation.watchPosition(
        (position) => {
          setLocation(position);

          const latitude = position?.coords?.latitude;
          const longitude = position?.coords?.longitude;

          loadStorage().then((token) => {
            const dataPayload = {
              "latitude": latitude,
              "longitude": longitude,
              "token": token?.token || ""
            };

            console.log(dataPayload, 'dataPayload2')

            saveLocation(dataPayload);
          }, (err) => {
            console.error(err, 'token error'); // Error!
          });
        },
        (error) => {
          Alert.alert(`Code ${error.code}`, error.message);
        },
        { enableHighAccuracy: true, distanceFilter: 0, interval: 5000, fastestInterval: 5000 }
      );

      return () => {
        Geolocation.clearWatch(watchId);
      };
    })();
  }, []);

  // add background task
  useEffect(() => {
    ReactNativeForegroundService.add_task(() => getLocation(), {
      delay: 5000,
      onLoop: true,
      taskId: 'taskid',
      onError: e => console.log(`Error logging:`, e),
      // onSuccess: () => console.log(`Success Task Run`),
    });
  }, []);

  const startTask = () => {
    hasLocationPermission().then((hasPermission) => {
      if (hasPermission) {
        ReactNativeForegroundService.start({
          id: 1244,
          title: 'Live Location Update Running',
          message: 'To stop go to App and click stop live tracking',
          icon: 'ic_launcher',
          button: true,
          button2: true,
          buttonText: 'Open App',
          // button2Text: 'Anther Button',
          setOnlyAlertOnce: "true",
          buttonOnPress: 'cray',
          color: '#000000',
          progress: {
            max: 100,
            curr: 50,
          },
        });
      } else {
        Alert.alert(`We can not access your location. Position will not work properly`);
      }
    });
  };

  const stopTask = () => {
    console.log('Task stopped');
    ReactNativeForegroundService.stopAll();
  };

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

      <View style={{ maxHeight: 300 }}>
        <RecordingList messageReceiveCount={messageReceiveCount} />
      </View>
      <View>
        <Text>
          {location?.coords?.latitude}
        </Text>
        <Text>
          {location?.coords?.longitude}
        </Text>
        <Button onPress={startTask} title="Start Live Tracking" />
        <Button onPress={stopTask} color="#dc3545" title="Stop Live Tracking" />
      </View>

      <View style={styles.container}>
        <MapView
          style={styles.mapStyle}
          // initialRegion={{
          //   latitude: (location?.coords?.latitude || -37.020100),
          //   longitude: (location?.coords?.longitude || 144.964600),
          //   latitudeDelta: 0.0122,
          //   longitudeDelta: 0.0121,
          //   latitudeDelta: 0.0922,
          //   longitudeDelta: 0.0421
          // }}
          region={{
            latitude: (location?.coords?.latitude || -37.020100),
            longitude: (location?.coords?.longitude || 144.964600),
            latitudeDelta: 0.0122,
            longitudeDelta: 0.0121
          }}
          showsUserLocation={true}
          // showsTraffic={true}
          loadingEnabled={true}
          // minZoomLevel={15}
          customMapStyle={mapStyle}>
          <Marker
            draggable
            // image={require('./assets/images/custom_pin.png')}
            coordinate={{
              latitude: location?.coords?.latitude || 0,
              longitude: location?.coords?.longitude || 0,
            }}
          // onDragEnd={
          //   (e) => alert(JSON.stringify(e.nativeEvent.coordinate))
          // }
          // title={'Test Marker'}
          // description={'This is a description of the marker'}
          />
        </MapView>
      </View>

    </SafeAreaView>
  );
}

const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dadada"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  }
]

const styles = StyleSheet.create({
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
  container: {
    position: 'absolute',
    // top: 375,
    top: 415,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  mapStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
});

export default App;