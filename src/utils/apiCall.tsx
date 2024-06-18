import axios from "axios";

import { BACKEND_URL } from "./constants";
import { saveStorage } from "./storage";

const saveLocation = async (dataPayload: any) => {
  const { latitude, longitude } = dataPayload;
  // return;
  axios.post(BACKEND_URL + '/save-location', dataPayload)
    .then(response => {
      saveStorage({ latitude, longitude }, "savedLocation");
      // console.log("response.data: ", response.data);
    })
    .catch(error => {
      console.error("Error sending data: ", error);
    });
}

export { saveLocation };