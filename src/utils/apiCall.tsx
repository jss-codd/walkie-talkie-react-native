import axios, { AxiosResponse } from "axios";

import { BACKEND_URL } from "./constants";
import { saveStorage } from "./storage";

const saveLocation = async (dataPayload: any) => {
  const { latitude, longitude } = dataPayload;

  axios.post(BACKEND_URL + '/save-location', dataPayload)
    .then(response => {
      saveStorage({ latitude, longitude }, "savedLocation");
    })
    .catch(error => {
      console.error("Error sending data: ", error);
    });
}

const refreshAuthToken = async (dataPayload: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await axios.post(BACKEND_URL + '/pin-login', dataPayload);
      console.log(res.data, '---------res refreshAuthToken');
      resolve(res);
    } catch (error: any) {
      console.log('API ERROR (refreshAuthToken)', error?.response?.data?.message);
      reject(error);
    }
  });
}

const getProfileDetails = async () => {
  try {
    const res = await axios.get<ProfileDetails>(BACKEND_URL + '/profile-details');
    console.log(res.data, '---------------getProfileDetails');
    return res.data;
  } catch (error) {
    console.error("Error getProfileDetails: ", error);
  }
}

const submitProfileDetails = async (dataPayload: any) => {
  try {
    const res = await axios.post<ProfileDetails>(BACKEND_URL + '/profile-details', dataPayload);
    console.log(res.data, '---------------submitProfileDetails');
    return res.data;
  } catch (error: any) {
    console.error("Error submitProfileDetails: ", error);
    throw new Error('Failed to submit, ' + error.message);
  }
}

export { saveLocation, refreshAuthToken, getProfileDetails, submitProfileDetails };