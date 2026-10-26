import * as Keychain from 'react-native-keychain';
import {base64Encode} from './Base64';

/**
 * The Azure DevOps personal access token (PAT) is a long-lived credential that
 * grants access to the user's organization. It must never be written to
 * AsyncStorage, logs, or any other plain-text location. It is stored in the
 * platform secure store instead:
 *
 *  - iOS: Keychain, accessible only while the device is unlocked and never
 *    migrated to another device through backups.
 *  - Android: Keystore-backed encrypted storage via react-native-keychain.
 */
const PAT_SERVICE = 'com.azurepipeline.azure-devops-pat';
const PAT_USERNAME = 'azure-devops-pat';

export async function savePersonalAccessToken(token: string): Promise<void> {
  const result = await Keychain.setGenericPassword(PAT_USERNAME, token, {
    service: PAT_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });

  if (!result) {
    throw new Error(
      'Unable to store the token securely on this device. Check that a device passcode is configured and try again.',
    );
  }
}

export async function getPersonalAccessToken(): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: PAT_SERVICE,
    });

    return credentials ? credentials.password : null;
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to read the stored token', error);
    }
    return null;
  }
}

export async function clearPersonalAccessToken(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({service: PAT_SERVICE});
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to clear the stored token', error);
    }
  }
}

/**
 * Returns the ready-to-use Authorization header for Azure DevOps requests.
 *
 * Azure DevOps ignores the username part of Basic authentication, so the
 * canonical empty-username form is used.
 */
export async function getAuthorizationHeader(): Promise<string | null> {
  const token = await getPersonalAccessToken();
  return token ? `Basic ${base64Encode(`:${token}`)}` : null;
}
