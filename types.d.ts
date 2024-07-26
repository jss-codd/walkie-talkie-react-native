import { Dispatch, SetStateAction } from "react";
interface ProfileDetailsInterface {
    name: string;
    email: string;
    mobile: string;
    location: string;
    profile_img: string;
    id?: number;
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

interface mapActionIconComponents {
    policeman: Policeman;
    traffic: TrafficLight
}