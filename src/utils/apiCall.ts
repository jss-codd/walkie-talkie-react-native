import axios from "axios";

import { apiEndpoints, BACKEND_URL } from "./constants";
import { saveStorage } from "./storage";
import { setProflieDetails } from "../redux/features/profile";
import { Dispatch, UnknownAction } from "@reduxjs/toolkit";

const saveLocation = async (dataPayload: any) => {
  const { latitude, longitude } = dataPayload;

  axios.post(BACKEND_URL + apiEndpoints.saveLocation, dataPayload)
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
      const res = await axios.post(BACKEND_URL + apiEndpoints.pinLogin, dataPayload);
      resolve(res);
    } catch (error: any) {
      console.log('API ERROR (refreshAuthToken)', (error?.response?.data?.message || error?.message));
      reject(error);
    }
  });
}

const submitProfileDetails = async (dataPayload: any, settings: { setProflieDetails: (arg0: (pre: any) => any) => void; }) => {
  try {
    const res = await axios.post(BACKEND_URL + apiEndpoints.profileDetails, dataPayload);
    saveStorage(res.data.data, "userProfile");
    settings.setProflieDetails((pre: any) => ({ ...pre, ...res?.data?.data }))
    return res.data;
  } catch (error: any) {
    console.error("Error submitProfileDetails: ", error);
    throw new Error('Failed to submit, ' + (error.response.data.message || error.message));
  }
}

const submitEmailDetails = async (dataPayload: any, dispatch: Dispatch<UnknownAction>) => {
  try {
    const res = await axios.post(BACKEND_URL + apiEndpoints.emailSubmit, dataPayload);
    saveStorage(res.data.data, "userProfile");
    dispatch(setProflieDetails(res.data.data));
    return res.data;
  } catch (error: any) {
    console.error("Error submitEmailDetails: ", error);
    throw new Error('Failed to submit, ' + (error.response.data.message || error.message));
  }
}

const submitLocationDetails = async (dataPayload: any, dispatch: Dispatch<UnknownAction>) => {
  try {
    const res = await axios.post(BACKEND_URL + apiEndpoints.locationSubmit, dataPayload);
    saveStorage(res.data.data, "userProfile");
    dispatch(setProflieDetails(res.data.data));
    return res.data;
  } catch (error: any) {
    console.error("Error submitLocationDetails: ", error);
    throw new Error('Failed to submit, ' + (error.response.data.message || error.message));
  }
}

const submitNameDetails = async (dataPayload: any, dispatch: Dispatch<UnknownAction>) => {
  try {
    const res = await axios.post(BACKEND_URL + apiEndpoints.nameSubmit, dataPayload);
    saveStorage(res.data.data, "userProfile");
    dispatch(setProflieDetails(res.data.data));
    return res.data;
  } catch (error: any) {
    console.error("Error submitNameDetails: ", error);
    throw new Error('Failed to submit, ' + (error.response.data.message || error.message));
  }
}

const reportUserCall = async (id: any) => {
  try {
    const res = await axios.post(BACKEND_URL + apiEndpoints.reportUser + '/' + id);

    console.log(res.data, '---------------submitProfileDetails');
    return res.data;
  } catch (error: any) {
    console.error("Error reportUser: ", error);
    throw new Error('Failed to submit, ' + error.message);
  }
}

const getChannelList = async () => {
  try {
    const res = await axios.get(BACKEND_URL + apiEndpoints.channelList);
    return res.data;
  } catch (error: any) {
    console.error("Error getChannelList: ", (error.response.data.error || error));
    return {};
  }
}

const iconTapSubmit = async (dataPayload: any) => {
  try {
    const res = await axios.post(BACKEND_URL + apiEndpoints.iconTapAction, dataPayload);

    return res.data;
  } catch (error: any) {
    console.error("Error cameraTapAction: ", error.message);
    throw new Error('Failed to submit, ' + (error.response.data.message || error.message));
  }
}

const getCameraList = async (route: number) => {
  try {
    const res = await axios.get(BACKEND_URL + apiEndpoints.cameraList + '/' + route);
    return res.data;
  } catch (error: any) {
    console.error("Error getCameraList: ", (error.response.data.error || error));
    return [];
  }
}

const getActionIconList = async (route: number) => {
  try {
    const res = await axios.get(BACKEND_URL + apiEndpoints.actionIconList + '/' + route);
    return res.data;
  } catch (error: any) {
    console.error("Error getCameraList: ", (error.response.data.error || error));
    return [];
  }
}

export { saveLocation, refreshAuthToken, submitProfileDetails, reportUserCall, getChannelList, submitEmailDetails, submitLocationDetails, submitNameDetails, iconTapSubmit, getCameraList, getActionIconList };