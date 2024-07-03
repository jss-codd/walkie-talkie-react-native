import React, { useContext, useEffect, useRef, useState, useTransition } from 'react';
import { View, StyleSheet, AppState, TextInput, Image, TouchableOpacity } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import SystemSetting from 'react-native-system-setting'

import { showAlert } from '../../utils/alert';
import { AlertMessages, BACKEND_URL } from '../../utils/constants';;
import { askInitialPermission, checkPermissions, hasLocationPermissionBG } from '../../utils/permissions';
import { clearWatch, getLocation, returnLocation, watchPosition } from '../../utils/location';
import VoiceRecorder from '../../components/VoiceRecorder';
import LocationAlertModal from '../../components/LocationAlertModal';
import { FS, HP, VP } from '../../utils/Responsive';
import { navigationString } from '../../utils/navigationString';
import { RNText } from '../../components/RNText';
import { TextStyles } from '../../utils/TextStyles';
import History from '../../assets/svgs/history.svg';
import Location from '../../assets/svgs/location.svg';
import { SettingContext } from '../../context/SettingContext';

export const LinearGradientComp = ({ children, status, style }: { status: boolean, children: any, style?: any }) => {
  return (
    <>
      {status ? (
        <LinearGradient
          colors={['#00FFFF', '#17C8FF', '#329BFF', '#4C64FF', '#6536FF', '#8000FF']}
          start={{ x: 0.0, y: 1.0 }} end={{ x: 1.0, y: 1.0 }}
          style={{ borderRadius: HP(50), paddingRight: HP(1), paddingTop: HP(1), ...style }}
        >
          {children}
        </LinearGradient>
      ) : children}
    </>
  )
}

function HomeScreen({ navigation }: { navigation: any }): React.JSX.Element {
  const settings = useContext<any>(SettingContext);
  const [isPending, startTransition] = useTransition();

  const [location, setLocation] = useState<any>(null);
  const [locationRegion, setLocationRegion] = useState<any>(null);
  const [subscriptionId, setSubscriptionId] = useState<any>(null);

  const appState = useRef(AppState.currentState);
  const [backgroundListener, setBackgroundListener] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [locationState, setLocationState] = useState(false);
  const [markers, setMarkers] = useState([]);

  console.log(markers, 'markers')

  const fetchNearDevices = async () => {
    try {
      // return;
      const location = await returnLocation();

      const dataPayload = {
        location: JSON.stringify(location)
      };

      const response = await axios.post(BACKEND_URL + '/fetch-near-devices', dataPayload);

      console.log(response.data.data, 'fetchNearDevices')

      setMarkers(response.data.data || []);
    } catch (error: any) {
      console.warn("Error fetching data fetchNearDevices: ", error);
    }
  }

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

      getLocation(setLocation, setLocationRegion, locationRegion, setModalVisible);

      fetchNearDevices();
    })();
  }, [locationState]);

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
          getLocation(setLocation, setLocationRegion, locationRegion, () => void (0));
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

    // compareLocation({latitude: -36.3602234, longitude: 145.3786707}, {latitude: 22.6870259, longitude: 75.8712694});
  }, [])

  // fetchNearDevices setInterval
  useEffect(() => {
    const timer = setInterval(() => {
      fetchNearDevices();
    }, 60000)

    return () => clearInterval(timer);
  }, [])

  // location on/off addLocationListener
  useEffect(() => {
    const locationListener: any = SystemSetting.addLocationListener(
      (locationEnabled: boolean) => {
        startTransition(() => {
          setLocationState(locationEnabled);
        });
      },
    );

    return () => {
      // SystemSetting?.removeListener(locationListener);
    }
  }, []);

  // useEffect(() => {

  // }, [locationState]);

  const startTask = () => {
    console.log('Watcher started');
    hasLocationPermissionBG().then(function (res) {
      if (!res) {
        showAlert(AlertMessages.location_access_bg_error.title, AlertMessages.location_access_bg_error.message);
      }
      console.log(res, 'hasLocationPermissionBG');
      getLocation(setLocation, setLocationRegion, locationRegion, setModalVisible);
      setBackgroundListener(true);
      watchPosition(setLocation, setLocationRegion, setSubscriptionId);
    })
  };

  const stopTask = () => {
    console.log('Watcher stopped');
    setBackgroundListener(false);
    clearWatch(subscriptionId, setSubscriptionId);
  };

  return (
    <>
      <LocationAlertModal modalVisible={modalVisible} setModalVisible={setModalVisible} />

      <View style={styles.main}>
        <View style={{ flexDirection: "column", flexBasis: "5%" }}>
          <View style={{ gap: 5, alignItems: "center" }}>
            <Image source={require('../../assets/icons/radio-fill.png')} style={{ height: 20, width: 20 }} />
            <Image source={require('../../assets/icons/line.png')} style={{ height: 18, width: 6 }} />
            <Image source={require('../../assets/icons/group-location.png')} style={{ height: 19, width: 14 }} />
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 8, flexBasis: "70%", justifyContent: "center" }}>
          <View style={{ flexDirection: "row", }}>
            <View style={{ flexBasis: "100%" }}>
              <TextInput
                style={{ ...styles.input, color: "#000" }}
                value={""}
              />
            </View>
          </View>
          <View style={{ flexDirection: "row", }}>
            <View style={{ flexBasis: "100%" }}>
              <TextInput
                style={{ ...styles.input, color: "#000" }}
                value={""}
              />
            </View>
          </View>
        </View>
        <View style={{ flexBasis: "25%", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                navigationString.PROFILE_SCREEN,
              )}
            style={{}}
          >
            {settings.proflieDetails.profile_img ? (<><Image loadingIndicatorSource={require("../../assets/images/profile.png")} source={{ uri: settings.proflieDetails.profile_img }} style={styles.avatar} /></>) : (<Image source={require('../../assets/images/profile.png')} style={styles.avatar} />)}
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Div */}
      <View style={{ flex: 1, alignItems: 'center', backgroundColor: "#ffffff" }}>
        <View style={styles.container}>
          {location?.coords?.latitude && location?.coords?.longitude ? (
            <MapView
              style={styles.mapStyle}
              region={{
                latitude: locationRegion?.coords?.latitude || 22.6870138,
                longitude:
                  locationRegion?.coords?.longitude || 75.8712195,
                latitudeDelta: 0.01, // 0.0922 || 0.01
                longitudeDelta: 0.001, // 0.0421 || 0.0011
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
            // customMapStyle={mapStyle}
            >
              <Marker
                rotation={location?.coords?.heading || 0}
                // image={{ uri: require('../../assets/images/truck.png') }}
                coordinate={{
                  latitude: location?.coords?.latitude || 0,
                  longitude: location?.coords?.longitude || 0,
                }}
              >
                <Image
                  source={require('../../assets/images/truck.png')}
                  style={{ width: HP(25), height: VP(61) }}
                  resizeMode="contain"
                />
              </Marker>

              {markers &&
                markers.map((marker: any, index: number) => (
                  <Marker
                    rotation={+marker.heading || 0}
                    key={index.toString()}
                    coordinate={{
                      latitude: +marker.lat || 0,
                      longitude: +marker.lng || 0,
                    }}
                    title={`${marker.name || ""}`}
                  >
                    <Image
                      source={require('../../assets/images/truck.png')}
                      style={{ width: HP(25), height: VP(61) }}
                      resizeMode="contain"
                    />
                  </Marker>
                ))}
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

        <View style={{ bottom: 0, height: VP(123), position: "absolute", backgroundColor: "#ffffff", borderTopLeftRadius: 0, borderTopRightRadius: 0, flex: 1 }}>
          <View style={{
            flexDirection: "row", justifyContent: "space-between", width: "100%", margin: "auto", padding: "auto", paddingHorizontal: 16, paddingVertical: 12, alignItems: "center"
          }}>

            <TouchableOpacity style={{ alignItems: "center" }} onPress={() => navigation.navigate(navigationString.LAST_TALK)}>
              <View style={styles.iconContainer}>
                <History width={31} height={31} />
              </View>
              <RNText textStyle={styles.iconText}>Recent Audio</RNText>
            </TouchableOpacity>

            <VoiceRecorder iconContainer={styles.iconContainer} iconText={styles.iconText} />

            <View style={{ alignItems: "center" }}>
              <LinearGradientComp status={backgroundListener}>
                <TouchableOpacity style={{ ...styles.iconContainer }} onPress={() => !backgroundListener ? startTask() : stopTask()}>
                  <Location width={31} height={31} />
                </TouchableOpacity>
              </LinearGradientComp>
              <RNText textStyle={styles.iconText}>Location</RNText>
            </View>
          </View>
        </View>
      </View>
    </>
  )
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
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#e3cfd4" //
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
        "color": "#f8f1f1"//
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
];

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: VP(-20),
    left: 0,
    right: 0,
    bottom: VP(0),
    backgroundColor: "#e3cfd4",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    // zIndex: 999
  },
  mapStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: VP(123),
    borderCurve: "circular",
  },
  input: {
    height: VP(32),
    borderWidth: 1,
    borderColor: "#D0CCFF",
    borderRadius: 8,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 70
  },
  main: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 5,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: VP(32),
    paddingTop: VP(30),
    alignItems: 'center',
    backgroundColor: "#ffffff",
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,

  },
  iconText: {
    ...TextStyles.SOFIA_SEMI_BOLD,
    fontSize: FS(8),
    color: "#282828",
    marginTop: VP(9)
  },
  iconContainer: {
    padding: HP(14),
    backgroundColor: "#E5E5E5",
    borderRadius: HP(50)
  }
});

export default HomeScreen;