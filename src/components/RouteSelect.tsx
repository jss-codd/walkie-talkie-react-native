import { useEffect, useState } from 'react';
import SelectDropdown from 'react-native-select-dropdown'
import { View, StyleSheet, Text } from 'react-native';

import { getChannelList } from '../utils/apiCall';
import Arrow from '../assets/svgs/arrow-narrow-right.svg';
import { roomJoin } from '../utils/socketEvents';

const RouteSelect = (props: { route: any; setRoute: any; }) => {
    const { route, setRoute } = props;

    const [items, setItems] = useState([]);

    const fetchChannels = async () => {
        const response = await getChannelList();

        if (response?.list) {
            setItems(response?.list?.map((d: { starting_loc_address: string; destination_loc_address: string; id: number; }) => { return { starting_loc_address: d.starting_loc_address, destination_loc_address: d.destination_loc_address, value: d.id } }))
        }
    }

    const selectRouteHandler = (selectedItem: any) => {
        setRoute(selectedItem);
        
        roomJoin(selectedItem.value);
    }

    useEffect(() => {
        (async () => {
            fetchChannels();
        })()
    }, [])

    return (
        <>
            <SelectDropdown
                data={items}
                onSelect={(selectedItem, index) => {
                    selectRouteHandler(selectedItem)
                }}
                renderButton={(selectedItem, isOpened) => {
                    return (
                        <View style={styles.dropdownButtonStyle}>
                            <Text style={{ ...styles.dropdownButtonTxtStyle, justifyContent: "center", alignItems: "center" }}>
                                {selectedItem ? (
                                    <>
                                        {selectedItem.starting_loc_address}
                                        {` `}
                                        <Arrow width={16} height={16} />
                                        {` `}
                                        {selectedItem.destination_loc_address}
                                    </>

                                ) : 'Select a Channel Route'}
                            </Text>
                        </View>
                    );
                }}
                renderItem={(item, index, isSelected) => {
                    return (
                        <View style={{ ...styles.dropdownItemStyle, ...(isSelected && { backgroundColor: '#D2D9DF' }) }}>
                            <Text style={{ ...styles.dropdownItemTxtStyle }}>
                                {item.starting_loc_address}
                            </Text>

                            <Arrow width={16} height={16} />

                            <Text style={{ ...styles.dropdownItemTxtStyle, paddingLeft: 10 }}>{item.destination_loc_address}</Text>
                        </View>
                    );
                }}
                showsVerticalScrollIndicator={false}
                dropdownStyle={styles.dropdownMenuStyle}
            />
        </>
    );
};

const styles = StyleSheet.create({
    dropdownButtonStyle: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 14,
        color: '#666',
    },
    dropdownMenuStyle: {
        backgroundColor: '#E9ECEF',
        borderRadius: 8,
    },
    dropdownItemStyle: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },
    dropdownItemTxtStyle: {
        flex: 1,
        fontSize: 14,
        color: '#151E26',
    },
});

export default RouteSelect;