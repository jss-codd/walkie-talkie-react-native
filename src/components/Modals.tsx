import { Dispatch, SetStateAction, useState } from "react";
import { View, Text, TouchableOpacity, Modal, Alert, StyleSheet } from "react-native";
import { TextStyles } from "../utils/TextStyles";
import { FS, VP } from "../utils/Responsive";
import { COLORS } from "../utils/constants";
import { ModalInterface, modalContent } from "../../types";

const ModalHeader = (props: modalContent) => {
    const { title, message } = props;
    return (
        <View style={styles.modalHeader}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.divider}></View>
        </View>
    )
}

const ModalBody = (props: modalContent) => {
    const { title, message } = props;
    return (
        <View style={styles.modalBody}>
            <Text style={styles.bodyText}>{message}</Text>
        </View>
    )
}

const ModalFooter = ({ setModalVisible }: { setModalVisible: Dispatch<SetStateAction<boolean>> }) => {
    return (
        <View style={styles.modalFooter}>
            <View style={styles.divider}></View>
            <View style={{ flexDirection: "row-reverse", margin: 10 }}>
                <TouchableOpacity style={{ ...styles.actions, backgroundColor: "#21ba45" }}
                    onPress={() => {
                        setModalVisible((pre: boolean) => !pre);
                    }}>
                    <Text style={styles.actionText}>OK</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity style={{ ...styles.actions, backgroundColor: "#21ba45" }}>
                    <Text style={styles.actionText}>Yes</Text>
                </TouchableOpacity> */}
            </View>
        </View>
    )
}

const ModalContainer = (props: ModalInterface) => {
    const { modalVisible, setModalVisible, content } = props;
    return (
        <View style={styles.modalContainer}>
            <ModalHeader {...content} />
            <ModalBody {...content} />
            <ModalFooter setModalVisible={setModalVisible} />
        </View>
    )
}

const Modals = (props: ModalInterface) => {

    const { modalVisible, setModalVisible, content } = props;

    return (
        <View style={styles.container}>
            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                }}>
                <View style={styles.modal}>
                    <View>
                        <ModalContainer {...props} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    bodyText: {
        ...TextStyles.SOFIA_REGULAR,
        fontSize: FS(16),
        lineHeight: VP(22),
        color: COLORS.PLACEHOLDER_COLOR
    },
    container: {
        // flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modal: {
        backgroundColor: "#00000099",
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        backgroundColor: "#f9fafb",
        width: "80%",
        borderRadius: 5,
    },
    modalHeader: {

    },
    title: {
        ...TextStyles.SOFIA_SEMI_BOLD,
        fontSize: FS(18),
        padding: 15,
    },
    divider: {
        width: "100%",
        height: 1,
        backgroundColor: "lightgray"
    },
    modalBody: {
        backgroundColor: "#fff",
        paddingVertical: 20,
        paddingHorizontal: 10
    },
    modalFooter: {
    },
    actions: {
        borderRadius: 5,
        marginHorizontal: 10,
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    actionText: {
        color: "#fff"
    }
});


export default Modals;