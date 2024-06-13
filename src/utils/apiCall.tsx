import axios from "axios";
import { BACKEND_URL } from "./constants";

const saveLocation = async (dataPayload: any) => {
  axios.post(BACKEND_URL + '/save-location', dataPayload)
    .then(response => {
      // console.log("response.data: ", response.data);
    })
    .catch(error => {
      console.error("Error sending data: ", error);
    });
}

export { saveLocation };