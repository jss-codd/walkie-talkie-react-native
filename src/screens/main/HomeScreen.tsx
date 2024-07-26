import React, { useContext, useEffect, useRef, useState, useTransition } from 'react';
import { View, StyleSheet, AppState, Image, TouchableOpacity } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import MapView, { Marker } from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import SystemSetting from 'react-native-system-setting'

import { showAlert } from '../../utils/alert';
import { AlertMessages } from '../../utils/constants';;
import { askInitialPermission, checkPermissions, hasLocationPermissionBG } from '../../utils/permissions';
import { clearWatch, getLocation, watchPosition } from '../../utils/location';
import { FS, HP, VP } from '../../utils/Responsive';
import { RNText } from '../../components/RNText';
import { TextStyles } from '../../utils/TextStyles';
import Location from '../../assets/svgs/location.svg';
import { SettingContext } from '../../context/SettingContext';
import Modals from '../../components/Modals';
import { RouteBoxMemo } from '../../components/RouteBox';
import ToggleNotification from '../../components/ToggleNotification';
import VoiceRecorder from '../../components/VoiceRecorder';
import MapIconsAction from '../../components/MapIconsAction';
import { useIsFocused } from '@react-navigation/native';
import { roomJoin } from '../../utils/socketEvents';
import { TimeAgo } from '../../utils/timeAgo';

export const LinearGradientComp = ({ children, status, onOffer, style }: { status: boolean, onOffer: boolean, children: any, style?: any }) => {
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

  const { markers, proflieDetails, cameraMarkers, route, actionIconMarkers } = settings;

  const isFocused = useIsFocused();

  const [isPending, startTransition] = useTransition();

  const [location, setLocation] = useState<any>(null);
  const [locationRegion, setLocationRegion] = useState<any>(null);
  const [subscriptionId, setSubscriptionId] = useState<any>(null);

  const appState = useRef(AppState.currentState);
  const [backgroundListener, setBackgroundListener] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [locationState, setLocationState] = useState(false);

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
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     fetchNearDevices();
  //   }, 60000)

  //   return () => clearInterval(timer);
  // }, [])

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

  useEffect(() => {
    if (route?.value) {
      roomJoin(route.value);
    }
  }, [isFocused]);

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

  const modalProps = {
    modalVisible, setModalVisible, content: AlertMessages.location_turn_on
  }

  return (
    <>
      <Modals {...modalProps} />
      {/* Top Div */}

      <RouteBoxMemo navigation={navigation} />

      {/* Map Div & Bottom Icons */}
      <View style={{ flex: 1, alignItems: 'center', backgroundColor: "#ffffff" }}>
        {/* Map Div */}
        <View style={styles.container}>
          {location?.coords?.latitude && location?.coords?.longitude ? (
            <MapView
              style={styles.mapStyle}
              region={{
                latitude: locationRegion?.coords?.latitude || 0,
                longitude:
                  locationRegion?.coords?.longitude || 0,
                latitudeDelta: 0.006, // 0.0922 || 0.01
                longitudeDelta: 0.001, // 0.0421 || 0.0011
              }}
              showsUserLocation={true}
              loadingEnabled={true}
            >
              <Marker
                rotation={location?.coords?.heading || 0}
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

              {/* markers for other route users */}
              {markers && markers?.map((marker: any, index: number) => (
                <React.Fragment key={index.toString()}>
                  {proflieDetails.id !== marker.id && (
                    <Marker
                      rotation={+marker.heading || 0}
                      coordinate={{
                        latitude: +marker.latitude || 0,
                        longitude: +marker.longitude || 0,
                      }}
                      title={`${marker.name || ""}`}
                      zIndex={(index + 1)}
                    // tracksViewChanges={false}
                    >
                      <View style={{}}>
                        <Image
                          source={require('../../assets/images/truck.png')}
                          style={{ width: HP(25), height: VP(61) }}
                          resizeMode="contain"
                        />
                      </View>
                    </Marker>
                  )}
                </React.Fragment>
              ))}

              {/* {console.log(cameraMarkers, '------------cameraMarkers')} */}

              {/* markers for cameras for selected route */}
              {cameraMarkers && cameraMarkers?.map((marker: any, index: number) => (
                <React.Fragment key={(Math.random() + index).toString()}>
                  <Marker
                    coordinate={{
                      latitude: +marker.lat || 0,
                      longitude: +marker.lng || 0,
                    }}
                    zIndex={999}
                  >
                    <View>
                      <Image
                        source={require('../../assets/icons/camera-marker.png')}
                        style={{ width: HP(35), height: VP(41) }} // 35, 41 || 30, 35
                        resizeMode="contain"
                      />
                    </View>
                  </Marker>
                </React.Fragment>
              ))}

              {/* {console.log(actionIconMarkers, '---------actionIconMarkers')} */}

              {/* markers for other icon action for selected route */}
              {actionIconMarkers && actionIconMarkers?.map((marker: any, index: number) => (
                <React.Fragment key={(Math.random() + index).toString()}>
                  <Marker
                    coordinate={{
                      latitude: +marker.lat || 0,
                      longitude: +marker.lng || 0,
                    }}
                    zIndex={999}
                  >
                    <View>
                      <View style={{ bottom: VP(-8) }}>
                        <View style={{ backgroundColor: "#341049", flexDirection: "row", borderRadius: 50, borderWidth: 1, borderColor: "#341049", alignItems: "center", padding: 2, justifyContent: "space-around" }}>

                          {marker?.createdAt && (
                            <RNText textStyle={{ ...TextStyles.SOFIA_SEMI_BOLD, fontSize: FS(10), color: "#fff", paddingHorizontal: 5 }}>
                              {TimeAgo.inWords(new Date(marker.createdAt).getTime())}
                            </RNText>
                          )}
                        </View>

                        <Image resizeMode="contain" source={require("../../assets/icons/down.png")} style={{ width: HP(13), height: VP(8), left: 8, top: -2 }} />
                      </View>

                      {marker.type === 'policeman' && (
                        <Image
                          source={require('../../assets/icons/policeman.png')}
                          style={{ width: HP(35), height: VP(41) }}
                          resizeMode="contain"
                        />
                      )}
                      {marker.type === 'traffic' && (
                        <Image
                          source={require('../../assets/icons/traffic.png')}
                          style={{ width: HP(35), height: VP(41) }}
                          resizeMode="contain"
                        />
                      )}
                    </View>

                  </Marker>
                </React.Fragment>
              ))}
            </MapView>
          ) : null}
        </View>

        {/* Side action icons */}
        <MapIconsAction />

        {/* Bottom Bar */}
        <View style={{ bottom: 0, height: VP(123), position: "absolute", backgroundColor: "#ffffff", borderTopLeftRadius: 0, borderTopRightRadius: 0, flex: 1 }}>
          <View style={{
            flexDirection: "row", justifyContent: "space-between", width: "100%", margin: "auto", padding: "auto", paddingHorizontal: 16, paddingVertical: 12, alignItems: "center"
          }}>

            <ToggleNotification />

            <VoiceRecorder iconContainer={styles.iconContainer} iconText={styles.iconText} navigation={navigation} />

            <View style={{ alignItems: "center" }}>
              <LinearGradientComp onOffer={false} status={backgroundListener}>
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
    top: VP(-50),
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
    top: VP(40),
    left: 0,
    right: 0,
    bottom: VP(123),
    borderCurve: "circular",
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