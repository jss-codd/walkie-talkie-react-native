import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Button, AppState } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { showAlert } from '../utils/alert';
import { AlertMessages } from '../utils/constants';;
import { askInitialPermission, checkPermissions } from '../utils/permissions';
import { clearWatch, getLocation, watchPosition } from '../utils/location';
import VoiceRecorder from '../components/VoiceRecorder';
import LocationAlertModal from '../components/LocationAlertModal';

function HomeScreen(): React.JSX.Element {
  const [location, setLocation] = useState<any>(null);
  const [subscriptionId, setSubscriptionId] = useState<any>(null);

  const appState = useRef(AppState.currentState);
  const [backgroundListener, setBackgroundListener] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // location update on initial load
  useEffect(() => {
    (async () => {
      const granted = await askInitialPermission();

      if (!granted) {
        showAlert(
          AlertMessages.location_access_error.title,
          AlertMessages.location_access_error.message,
        );
      }

      getLocation(setLocation, setModalVisible);
    })();
  }, []);

  // clear watch
  useEffect(() => {
    return () => {
      clearWatch(subscriptionId, setSubscriptionId);
    };
  }, []);

  // backgroundListener for location
  useEffect(() => {
    if (!backgroundListener) {
      return;
    }

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        BackgroundTimer.runBackgroundTimer(() => {
          getLocation(setLocation, () => void (0));
        }, 5000);

        console.log('App has come to the foreground!');
      } else {
        BackgroundTimer.stopBackgroundTimer();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [backgroundListener]);

  // checkPermissions
  useEffect(() => {
    checkPermissions();
  }, [])

  const startTask = () => {
    console.log('Watcher started');
    getLocation(setLocation, setModalVisible);
    setBackgroundListener(true);
    watchPosition(setLocation, setSubscriptionId);
  };

  const stopTask = () => {
    console.log('Watcher stopped');
    setBackgroundListener(false);
    clearWatch(subscriptionId, setSubscriptionId);
  };

  return (
    <>
      <LocationAlertModal modalVisible={modalVisible} setModalVisible={setModalVisible} />
      <View style={{ flex: 1, alignItems: 'center' }}>
        <View>
          <VoiceRecorder>
            <View>
              {!backgroundListener ? (<Button onPress={startTask} title="Start Live Tracking" />) : (<Button onPress={stopTask} color="#dc3545" title="Stop Live Tracking" />)}
            </View>
          </VoiceRecorder>
        </View>

        <View style={styles.container}>
          {location?.coords?.latitude && location?.coords?.longitude ? (
            <MapView
              style={styles.mapStyle}
              region={{
                latitude: location?.coords?.latitude || 22.6870138,
                longitude:
                  location?.coords?.longitude || 75.8712195,
                latitudeDelta: 0.01,
                longitudeDelta: 0.0011,
              }}
              showsUserLocation={true}
              // onUserLocationChange={(e: any) => {
              //   setLocation({
              //     coords: {
              //       latitude: e.nativeEvent.coordinate.latitude,
              //       longitude:
              //         e.nativeEvent.coordinate.longitude,
              //     },
              //   });
              // }}
              loadingEnabled={true}
              customMapStyle={mapStyle}
            >
              <Marker
                draggable
                // image={require('./assets/images/custom_pin.png')}
                coordinate={{
                  latitude: location?.coords?.latitude || 0,
                  longitude: location?.coords?.longitude || 0,
                }}
              />
            </MapView>
          ) : null}

          {/* <MapView
            style={styles.mapStyle}
            initialRegion={{
              latitude: 37.8025259,
              longitude: -122.4351431,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}>
            <Polyline
              coordinates={[
                { latitude: 37.8025259, longitude: -122.4351431 },
                { latitude: 37.7896386, longitude: -122.421646 },
              ]}
              strokeColor="blue" // fallback for when `strokeColors` is not supported by the map-provider
              strokeColors={[
                '#7F0000',
                '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
                '#B24112',
                '#E5845C',
                '#238C23',
                '#7F0000',
              ]}
              strokeWidth={6}
            />
          </MapView> */}
        </View>
      </View>
    </>
  )
}

const mapStyle = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#f5f5f5',
      },
    ],
  },
  {
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#616161',
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#f5f5f5',
      },
    ],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#bdbdbd',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      {
        color: '#eeeeee',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#757575',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      {
        color: '#e5e5e5',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9e9e9e',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#ffffff',
      },
    ],
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#757575',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      {
        color: '#dadada',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#616161',
      },
    ],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9e9e9e',
      },
    ],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [
      {
        color: '#e5e5e5',
      },
    ],
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [
      {
        color: '#eeeeee',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#c9c9c9',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9e9e9e',
      },
    ],
  },
];

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: "#666",
    borderCurve: "circular"
  },
  mapStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
});

export default HomeScreen;