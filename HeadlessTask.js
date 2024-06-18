import Sound from 'react-native-sound';

import { loadStorage } from './src/utils/storage';

Sound.setCategory('Playback');

const playSoundRemote = (remoteMessage) => {
  const sound = new Sound(remoteMessage.data.audio_url, null, (error) => {
    if (error) {
      console.log('Failed to load the sound', error);
      return;
    }
    sound.play((success) => {
      if (success) {
        console.log('Successfully played the sound');
      } else {
        console.log('Playback failed due to audio decoding errors');
      }
      sound.release();
    });
  });
}

async function HeadlessTask(remoteMessage) {
  const settings = await loadStorage("settings");
  if(settings?.audioPlayStatus && remoteMessage?.data?.audio_url) {
    playSoundRemote(remoteMessage)
  }
}

export default HeadlessTask;