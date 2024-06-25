import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, FlatList, Text, StyleSheet, Image, Button, Alert, Switch } from 'react-native';
import axios from 'axios';

import { loadStorage } from '../../utils/storage';
import { BACKEND_URL, COLORS } from '../../utils/constants';
import { showAlert } from '../../utils/alert';
import Loader from '../../components/Loader';
import { SettingContext } from '../../context/SettingContext';
import OuterLayout from '../../components/OuterLayout';
import InnerBlock from '../../components/InnerBlock';
import { HP, VP } from '../../utils/Responsive';
import { RNText } from '../../components/RNText';
import { TextStyles } from '../../utils/TextStyles';
import { getConfig } from '../../utils/axiosConfig';

function SettingsScreen(): React.JSX.Element {
    const settings = useContext<any>(SettingContext);

    const notificationStatus = settings.notificationStatus;
    const audioPlayStatus = settings.audioPlayStatus;

    const [loader, setLoader] = useState(false);
    const [tokenShow, setTokenShow] = useState("");

    const toggleNotification = async (e: boolean) => {
        setLoader(true);

        const getAxiosConfig = await getConfig();

        const dataPayload = {
            "status": e
        };

        axios.put(BACKEND_URL + '/notification-status', dataPayload, getAxiosConfig)
            .then(response => {
                console.log("response.data: ", response.data);
                settings.handler('notificationStatus', e)
                setLoader(false)
            })
            .catch(error => {
                setLoader(false);
                showAlert('Error to change', "");
                console.warn("Error sending data: ", error);
            });
    }

    const togglePlayAudio = async (e: boolean) => {
        setLoader(true)
        const getAxiosConfig = await getConfig();

        const dataPayload = {
            "status": e
        };

        axios.put(BACKEND_URL + '/audio-play-status', dataPayload, getAxiosConfig)
            .then(response => {
                console.log("response.data: ", response.data);
                settings.handler('audioPlayStatus', e)
                setLoader(false)
            })
            .catch(error => {
                setLoader(false);
                showAlert('Error to change', "");
                console.warn("Error sending data: ", error);
            });
    }

    useEffect(() => {
        loadStorage().then(
            token => {
                setTokenShow(token?.token || '')
            },
            err => {
                console.error(err, 'token error'); // Error!
            },
        );
    }, [])

    return (
        <OuterLayout containerStyle={{ backgroundColor: COLORS.BACKGROUND }}>
            <InnerBlock>
                <View style={{
                    paddingHorizontal: HP(16), paddingVertical: VP(12), justifyContent: "flex-start",
                    marginTop: VP(30)
                }}>
                    <Loader loading={loader} />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ flexBasis: 0, flexGrow: 1 }}>
                            <RNText textStyle={styles.heading}>
                                Receive Notification:
                            </RNText>
                        </View>
                        <View style={{ flexBasis: 0, flexGrow: 1 }}>
                            <Switch
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={notificationStatus ? '#f5dd4b' : '#f4f3f4'}
                                ios_backgroundColor="#3e3e3e"
                                value={notificationStatus}
                                onValueChange={toggleNotification}
                            />
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: VP(20) }}>
                        <View style={{ flexBasis: 0, flexGrow: 1 }}>
                            <RNText textStyle={styles.heading}>
                                Play Audio:
                            </RNText>
                        </View>
                        <View style={{ flexBasis: 0, flexGrow: 1 }}>
                            <Switch
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={audioPlayStatus ? '#f5dd4b' : '#f4f3f4'}
                                ios_backgroundColor="#3e3e3e"
                                value={audioPlayStatus}
                                onValueChange={togglePlayAudio}
                            />
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: HP(10), marginTop: VP(20) }}>
                        <RNText textStyle={{color: "#000"}}>
                            Token: {tokenShow}
                        </RNText>
                    </View>
                </View>
            </InnerBlock>
        </OuterLayout>
    )
}

const styles = StyleSheet.create({
    heading: {
        ...TextStyles.SOFIA_BOLD,
        color: "#000000"
    }
});

export default SettingsScreen;