import { View, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';

import { navigationString } from '../utils/navigationString';
import { VP } from '../utils/Responsive';

const RouteBoxOld = (props: { settings: any; navigation: any; }) => {
    const { settings, navigation } = props;

    return (
        <>
            <View style={styles.main}>
                <View style={{ flexDirection: "column", flexBasis: "5%" }}>
                    <View style={{ gap: 5, alignItems: "center" }}>
                        <Image source={require('../assets/icons/radio-fill.png')} style={{ height: 20, width: 20 }} />
                        <Image source={require('../assets/icons/line.png')} style={{ height: 18, width: 6 }} />
                        <Image source={require('../assets/icons/group-location.png')} style={{ height: 19, width: 14 }} />
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
                        {settings.proflieDetails.profile_img ? (<><Image loadingIndicatorSource={require("../assets/images/profile.png")} source={{ uri: settings.proflieDetails.profile_img }} style={styles.avatar} /></>) : (<Image source={require('../assets/images/profile.png')} style={styles.avatar} />)}
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
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
});

export default RouteBoxOld;