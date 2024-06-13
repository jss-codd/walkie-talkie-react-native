import { Alert } from "react-native";

const showAlert = (title: string, message: string) => {
    Alert.alert(
        title,
        message,
        [{ text: "Okay" }]
    );
};

export { showAlert };