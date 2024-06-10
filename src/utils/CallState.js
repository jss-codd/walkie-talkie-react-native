import { NativeEventEmitter, NativeModules } from 'react-native';

const { CallState } = NativeModules;
const callStateEmitter = new NativeEventEmitter(CallState);

export const startListening = () => {
  callStateEmitter.addListener('onCallStateChange', (callState) => {
    console.log('Call State: ', callState);
  });
};

export const stopListening = () => {
  CallState.stopListening();
};
