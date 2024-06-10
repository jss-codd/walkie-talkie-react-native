import Sound from 'react-native-sound';

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
    });
  });
}

async function HeadlessTask(remoteMessage) {
  if(remoteMessage?.data?.audio_url) {
    playSoundRemote(remoteMessage)
  }
}

export default HeadlessTask;