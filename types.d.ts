import { Dispatch, SetStateAction } from "react";
interface ProfileDetails {
    name: string;
    email: string;
}

interface ModalInterface {
    modalVisible: boolean;
    setModalVisible: Dispatch<SetStateAction<boolean>>;
    content: modalContent
}

interface modalContent {
    title: string;
    message: string;
}