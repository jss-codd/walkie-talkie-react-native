import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = new Storage({
  // maximum capacity, default 1000 key-ids
  size: 1000,

  // Use AsyncStorage for RN apps, or window.localStorage for web apps.
  // If storageBackend is not set, data will be lost after reload.
  storageBackend: AsyncStorage, // for web: window.localStorage

  // expire time, default: 1 day (1000 * 3600 * 24 milliseconds).
  // can be null, which means never expire.
  defaultExpires: 1000 * 3600 * 24
});

export const saveStorage = (data: any, key = 'fcm') => {
  storage.save({
    key, // Note: Do not use underscore("_") in key!
    data
  });
}

export const loadStorage = async (key = 'fcm') => {
  try {
    const token = await storage.load({ key });
    return token;
  } catch (err: any) {
    console.log(err.message, key + ' load error');
    return {};
  }
}

export const removeStorage = async (key = 'signupMobile') => {
  storage.remove({
    key: key
  });
}

export const recordingStorage = async (message: any) => {
  if (message?.data?.audio_url) {
    const list: any = await loadStorage('recordingList');

    if (Array.isArray(list)) {
      saveStorage([message, ...list], 'recordingList');
    } else {
      saveStorage([message], 'recordingList');
    }
  }
}