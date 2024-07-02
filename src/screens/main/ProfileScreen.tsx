import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import OuterLayout from '../../components/OuterLayout';
import InnerBlock from '../../components/InnerBlock';
import { COLORS, emailRegex, errorMessage, nameRegex } from '../../utils/constants';
import { TextStyles } from '../../utils/TextStyles';
import { FS } from '../../utils/Responsive';
import Profile from '../../components/Profile';
import ProfileEdit from '../../components/ProfileEdit';
import { getProfileDetails, submitProfileDetails } from '../../utils/apiCall';
import Loader from '../../components/Loader';
import { SettingContext } from '../../context/SettingContext';

function ProfileScreen({ navigation }: { navigation: any }): React.JSX.Element {
    const settings = useContext<any>(SettingContext);

    const isFocused = useIsFocused();

    const [loading, setLoading] = useState(false);
    const [editScreen, setEditScreen] = useState(false);
    const [profile, setProfile] = useState<any>({});
    const [error, setError] = useState({ status: false, text: "" });
    const [loader, setLoader] = useState(false);

    const inputChange = (key: any, value: any) => {
        setProfile((pre: any) => ({ ...pre, [key]: value }));
    }

    const profileSubmitHandler = async () => {
        try {
            if (profile.name == null || profile.email == null || profile.mobile == null || profile.location == null) {
                throw new Error('All fields are required!');
            }

            if (profile.name.trim() == "" || profile.email.trim() == "" || profile.mobile.trim() == "" || profile.location.trim() == "") {
                throw new Error('All fields are required!');
            }

            if (nameRegex.test(profile.name) === false) {
                throw new Error(errorMessage.name);
            }

            if (emailRegex.test(profile.email) === false) {
                throw new Error(errorMessage.email);
            }

            // if (mobileRegex.test(profile.mobile) === false) {
            //     throw new Error(errorMessage.mobile_no);
            // }

            if (nameRegex.test(profile.location) === false) {
                throw new Error(errorMessage.location);
            }

            setLoading(true);
            setError({ status: false, text: "" });

            const dataPayload = {
                ...profile
            };

            const res = await submitProfileDetails(dataPayload, settings);

            setLoading(false);

            screenChangeHandler();
        } catch (err: any) {
            setError((pre) => ({ status: true, text: err.message }))
        }
    }

    const screenChangeHandler = (): void => {
        setEditScreen((pre) => !pre);
    }

    useEffect(() => {
        if (isFocused) {
            setEditScreen(false);
        }
    }, [isFocused])

    const setProfileDetails = async () => {
        setLoader(true);
        const data: any = await getProfileDetails(settings);
        setProfile(data?.data || {});
        setLoader(false);
    }

    useEffect(() => {
        setProfileDetails();
    }, [])

    return (
        <OuterLayout containerStyle={{ backgroundColor: COLORS.BACKGROUND }}>
            <InnerBlock>
                <Loader loading={loader} />
                {editScreen ? (<ProfileEdit error={error} loading={loading} submitHandler={profileSubmitHandler} inputChange={inputChange} handler={screenChangeHandler} profile={profile} />) : (<Profile navigation={navigation} handler={screenChangeHandler} profile={profile} />)}
            </InnerBlock>
        </OuterLayout>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 12
    },
    heading: {
        ...TextStyles.SOFIA_SEMI_BOLD,
        fontSize: FS(14)
    }
});

export default ProfileScreen;