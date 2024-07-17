import { View, StyleSheet, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import { useState } from 'react';

import Menu from '../assets/svgs/menu.svg';
import { navigationString } from '../utils/navigationString';
import { TextStyles } from '../utils/TextStyles';
import { HP, VP } from '../utils/Responsive';
import RouteSelect from './RouteSelect';
import MyModal from './ProfileDrawer';

const RouteBox = (props: { route: any; setRoute: any; navigation: any }) => {
    const { route, setRoute, navigation } = props;

    const [modalVisible, setModalVisible] = useState(false);

    return (
        <>
            {
                route.hasOwnProperty('starting_loc_address') ? (
                    <>
                        <View style={styles.main}>
                            <View style={{ flexBasis: "10%", }}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate("ProfileDrawer")}
                                    style={{}}
                                >
                                    <Menu width={36} height={36} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexDirection: "column", flexBasis: "5%", }}>
                                <View style={{ gap: 5, alignItems: "center", }}>
                                    <Image source={require('../assets/icons/radio-fill.png')} style={{ height: 20, width: 20, }} />
                                    <Image source={require('../assets/icons/line.png')} style={{ height: 18, width: 6 }} />
                                    <Image source={require('../assets/icons/group-location.png')} style={{ height: 19, width: 14 }} />

                                    <View style={{ ...TextStyles.SOFIA_SEMI_BOLD, borderWidth: 1.5, borderColor: "#737373", borderRadius: 14, padding: 1, alignSelf: "baseline", top: 7 }}>
                                        <Image source={require('../assets/icons/plus.png')} style={{ height: 12, width: 12 }} />
                                    </View>
                                </View>
                            </View>

                            <View style={{ flexDirection: "column", flexBasis: "85%", }}>
                                <View style={{}}>
                                    <TextInput
                                        style={styles.input}
                                        value={route.starting_loc_address}
                                        readOnly={true}
                                    />
                                    <TextInput
                                        style={{ ...styles.input, }}
                                        value={route.destination_loc_address}
                                        readOnly={true}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setRoute({})}
                                        style={{ top: 6 }}
                                    >
                                        <Text style={styles.bottomText}>Exit To Channel Route</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{}}>

                                </View>
                                <View style={{}}>

                                </View>
                            </View>
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.main}>
                            <View style={{}}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate("ProfileDrawer")}
                                    style={{}}
                                >
                                    <Menu width={36} height={36} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexBasis: "90%", }}>
                                <RouteSelect route={route} setRoute={setRoute} />
                            </View>
                        </View>
                    </>
                )
            }
        </>
    );
};

const styles = StyleSheet.create({
    main: {
        marginVertical: 39,
        flexDirection: "row",
        marginHorizontal: 16,
        paddingHorizontal: 8,
        paddingVertical: 5,
        position: "absolute",
        borderRadius: 4,
        alignItems: 'center',
        backgroundColor: "#ffffff",
        zIndex: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 4,
        gap: 6,
        justifyContent: "space-evenly"
    },
    input: {
        ...TextStyles.SOFIA_REGULAR,
        height: VP(31),
        borderBottomWidth: 1,
        borderColor: "#D0CCFF",
        borderRadius: 8,
        color: "#4B4B4B",
        fontSize: HP(14),
        width: "100%",
        lineHeight: 10,
        top: 10
    },
    bottomText: {
        ...TextStyles.SOFIA_SEMI_BOLD,
        fontSize: HP(12),
        color: "#4B4B4B",
        alignSelf: "baseline",
        height: VP(30),
        left: 4,
        top: 10
    }
});

export default RouteBox;