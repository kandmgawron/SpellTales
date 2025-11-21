import { Alert, Platform } from 'react-native';

export const confirmDialog = (message, title = 'Confirm') => {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      resolve(confirm(message));
    } else {
      Alert.alert(
        title,
        message,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'OK', onPress: () => resolve(true) }
        ]
      );
    }
  });
};
