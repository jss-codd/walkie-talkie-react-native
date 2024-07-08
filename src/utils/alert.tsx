import { Alert, Platform, ToastAndroid } from "react-native";

const showAlert = (title: string, message: string) => {
    Alert.alert(
        title,
        message,
        [{ text: "Okay" }]
    );
};

const showFadeAlert = (message: string) => {
    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT)
    } else {
        Alert.alert(
            message,
            '',
            [{ text: "Okay" }]
        );
    }
};

export { showAlert, showFadeAlert };