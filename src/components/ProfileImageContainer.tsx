import { View, FlatList, Text, StyleSheet, Image, TextInput, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { Asset, launchImageLibrary } from 'react-native-image-picker';
import { useContext, useEffect, useState } from 'react';

import Pencil from '../assets/svgs/pencil.svg';
import { HP, VP } from '../utils/Responsive';
import { BACKEND_URL } from '../utils/constants';
import User from '../assets/svgs/user.svg';
import Loader from './Loader';
import axios from 'axios';
import { showAlert } from '../utils/alert';
import { SettingContext } from '../context/SettingContext';
import { saveStorage } from '../utils/storage';

const createFormData = (photo: { fileName: any; type: any; uri: string; }, body: any = {}) => {
    const data: any = new FormData();

    data.append('photo', {
        name: photo.fileName,
        type: photo.type,
        uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri,
    });

    Object.keys(body).forEach((key) => {
        data.append(key, body[key]);
    });

    return data;
};

function ProfileImageContainer(props: any) {
    const settings = useContext<any>(SettingContext);

    const { profile } = props;

    const [photo, setPhoto] = useState<any>(null);
    const [loader, setLoader] = useState(false);

    const handleChoosePhoto = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0 }, (response) => {
            console.log(response, 'response');

            if (response?.assets && response?.assets[0] && response?.assets[0]['uri']) {
                setPhoto(response?.assets[0]);
                handleUploadPhoto(response?.assets[0]);
            } else {
                setPhoto(null);
            }
        });
    };

    const handleUploadPhoto = async (photo: any) => {
        try {
            const formData = createFormData(photo);

            setLoader(true);

            const res = await axios.post(BACKEND_URL + '/profile-upload', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    'accept': 'application/json',
                }
            });
            saveStorage(res.data.data, "userProfile");
            settings.setProflieDetails((pre: any) => ({ ...pre, ...res.data.data }))
            setLoader(false);
        } catch (error: any) {
            setLoader(false);
            setPhoto(null);
            showAlert("Failed to upload", error.message);
        }
    };

    useEffect(() => {
        const profile_img = profile.profile_img ? { uri: profile.profile_img } : null;
        setPhoto(profile_img);
    }, [profile])

    return (
        <>
            <Loader loading={loader} />
            {photo ? (
                <>
                    <Image
                        source={{ uri: photo.uri }}
                        style={styles.avatar}
                    />
                </>
            ) : (<Image source={require('../assets/images/profile.png')} style={styles.avatar} />)}

            <TouchableOpacity
                onPress={handleChoosePhoto}
                style={{ position: "absolute", top: VP(120), right: HP(115) }}
            >
                <Pencil height={40} width={40} />
            </TouchableOpacity>
        </>
    );
}

const styles = StyleSheet.create({
    avatar: {
        width: 125,
        height: 125,
        borderRadius: 125,
        marginRight: 12,
        flexDirection: 'row',
        justifyContent: "center",
        marginTop: VP(40),
        borderColor: "#FFFFFF",
        borderWidth: 3
    },
});

export default ProfileImageContainer;