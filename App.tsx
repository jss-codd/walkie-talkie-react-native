/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import NetInfo from '@react-native-community/netinfo';
import messaging from '@react-native-firebase/messaging';
import Geolocation from 'react-native-geolocation-service';
import ReactNativeForegroundService from "@supersami/rn-foreground-service";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import HeadlessTask from './HeadlessTask';
import { AlertMessages } from './src/utils/constants';
import { loadStorage, recordingStorage } from './src/utils/storage';
import RecordingList from './src/components/RecordingList';
import { saveLocation } from './src/utils/apiCall';
import { showAlert } from './src/utils/alert';
import { hasLocationPermission, askInitialPermission } from './src/utils/permissions';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [isConnected, setConnected] = useState(false);
  const [messageReceiveCount, setMessageReceiveCount] = useState(0);
  const [location, setLocation] = useState<any>(null);

  const getLocation = async () => {
    Geolocation.getCurrentPosition(
      (position) => {
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

  // check internet
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      setConnected(state.isConnected);
      if (!state.isConnected) {
        showAlert(AlertMessages.no_internet.title, AlertMessages.no_internet.message);
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
        showAlert(AlertMessages.location_access_error.title, AlertMessages.location_access_error.message);
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
      delay: 60000,
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
        showAlert(AlertMessages.location_access_error.title, AlertMessages.location_access_error.message);
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
  // console.log(location, 'location')
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
        {/* <Text>
          {location?.coords?.latitude}
        </Text>
        <Text>
          {location?.coords?.longitude}
        </Text> */}
        <Button onPress={startTask} title="Start Live Tracking" />
        <Button onPress={stopTask} color="#dc3545" title="Stop Live Tracking" />
      </View>

      <View style={styles.container}>
        <MapView
          style={styles.mapStyle}
          region={{
            latitude: (location?.coords?.latitude || 22.6870138),
            longitude: (location?.coords?.longitude || 75.8712195),
            latitudeDelta: 0.0100,
            longitudeDelta: 0.0011
          }}
          showsUserLocation={true}
          onUserLocationChange={(e: any) => setLocation({ coords: { latitude: e.nativeEvent.coordinate.latitude, longitude: e.nativeEvent.coordinate.longitude } })}
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
    top: 375,
    // top: 415,
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