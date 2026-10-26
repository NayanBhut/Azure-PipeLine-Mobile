import {base64Encode} from '../../Common/Base64';
import {
  normalizePersonalAccessToken,
  validatePersonalAccessToken,
} from '../../Common/Validation';

/**
 * Builds the HTTP Basic authorization header expected by Azure DevOps.
 *
 * Azure DevOps ignores the username portion of Basic authentication and
 * validates the personal access token supplied as the password. Only the
 * token itself is treated as a secret.
 */
export function convertToBasicToken(
  username: string,
  password: string,
): string {
  const token = normalizePersonalAccessToken(password);
  const validationError = validatePersonalAccessToken(token);

  if (validationError) {
    throw new Error(validationError);
  }

  const basicToken = `Basic ${base64Encode(`${username}:${token}`)}`;

  if (!basicToken) {
    throw new Error('Failed to create Basic Auth token');
  }

  return basicToken;
}

/**
 * Canonical form for a personal access token: an empty username with the token
 * as the password. Prefer this when a username is not explicitly required.
 */
export function convertPatToBasicToken(personalAccessToken: string): string {
  return convertToBasicToken('', personalAccessToken);
}
