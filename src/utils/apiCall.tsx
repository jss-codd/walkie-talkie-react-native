import axios from "axios";

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

const getProfileDetails = async (settings: { setProflieDetails: (arg0: (pre: any) => any) => void; }) => {
  try {
    const res = await axios.get(BACKEND_URL + '/profile-details');
    saveStorage(res.data.data, "userProfile");
    settings.setProflieDetails((pre: any) => ({ ...pre, ...res?.data?.data }))
    console.log(res.data, '---------------getProfileDetails');
    return res.data;
  } catch (error: any) {
    return {};
    console.error("Error getProfileDetails: ", error.response.data.error || error);
  }
}

const submitProfileDetails = async (dataPayload: any, settings: { setProflieDetails: (arg0: (pre: any) => any) => void; }) => {
  try {
    const res = await axios.post(BACKEND_URL + '/profile-details', dataPayload);
    saveStorage(res.data.data, "userProfile");
    settings.setProflieDetails((pre: any) => ({ ...pre, ...res?.data?.data }))
    return res.data;
  } catch (error: any) {
    console.error("Error submitProfileDetails: ", error);
    throw new Error('Failed to submit, ' + error.response.data.message || error.message);
  }
}

const reportUserCall = async (id: any) => {
  try {
    const res = await axios.post(BACKEND_URL + '/report-user/' + id);

    console.log(res.data, '---------------submitProfileDetails');
    return res.data;
  } catch (error: any) {
    console.error("Error reportUser: ", error);
    throw new Error('Failed to submit, ' + error.message);
  }
}

export { saveLocation, refreshAuthToken, getProfileDetails, submitProfileDetails, reportUserCall };