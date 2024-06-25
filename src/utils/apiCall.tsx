import axios from "axios";

import { BACKEND_URL } from "./constants";
import { saveStorage } from "./storage";
import { getConfig } from "./axiosConfig";

const saveLocation = async (dataPayload: any) => {
  const { latitude, longitude } = dataPayload;

  const getAxiosConfig = await getConfig();

  axios.post(BACKEND_URL + '/save-location', dataPayload, getAxiosConfig)
    .then(response => {
      saveStorage({ latitude, longitude }, "savedLocation");
      // console.log("response.data: ", response.data);
    })
    .catch(error => {
      console.error("Error sending data: ", error);
    });
}

export { saveLocation };