// src/utils/permissions.ts
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import {
    openSettings,
    PERMISSIONS,
    request,
    RESULTS
} from 'react-native-permissions';

export async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Accès au microphone',
        message:
          'VoiceScope a besoin du microphone pour enregistrer et analyser les séances.',
        buttonNeutral: 'Plus tard',
        buttonNegative: 'Annuler',
        buttonPositive: 'Autoriser',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  const status = await request(PERMISSIONS.IOS.MICROPHONE);
  return status === RESULTS.GRANTED;
}

export async function ensureMicrophonePermission(): Promise<boolean> {
  const granted = await requestMicrophonePermission();
  if (!granted) {
    Alert.alert(
      'Microphone requis',
      'Autorisez l\'accès au microphone dans les réglages pour enregistrer vos séances.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Ouvrir les réglages', onPress: () => openSettings() },
      ],
    );
  }
  return granted;
}