/**
 * @format
 */

import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';
import { loadStorage, saveStorage } from './src/utils/storage';
import HeadlessTask from './HeadlessTask';

const recordingStorage = async (message) => {
  if (message?.data?.audio_url) {
    const list = await loadStorage('recordingList');
  
    if (Array.isArray(list)) {
      saveStorage([message, ...list], 'recordingList');
    } else {
      saveStorage([message], 'recordingList');
    }
  }
}

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Message handled in the background!');
  HeadlessTask(remoteMessage);
  recordingStorage(remoteMessage);
});

function HeadlessCheck({ isHeadless }) {
    if (isHeadless) {
      // App has been launched in the background by iOS, ignore
      return null;
    }
  
    return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);

AppRegistry.registerHeadlessTask('HeadlessTask', () => HeadlessTask);