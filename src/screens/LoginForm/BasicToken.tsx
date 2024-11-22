import base64 from 'base-64'; // Used for encoding the username and password in base64 for Basic Auth

/**
 * Converts the provided username and password into a Basic Auth token.
 *
 * @param username - The username to be encoded.
 * @param password - The password to be encoded.
 * @returns A Basic Auth token string in the format "Basic <encodedCredentials>".
 * @throws Will throw an error if username, password are missing or if encoding fails.
 */
// Helper function to convert username and password to Basic Auth token
export function convertToBasicToken(
  username: string,
  password: string,
): string {
  try {
    if (!username || !password) {
      throw 'Username and password are required'; // Throw error if username or password is empty
    }

    const credentials = `${username}:${password}`; // Concatenate username and password
    const base64Credentials = base64.encode(credentials); // Encode credentials in base64

    if (!base64Credentials) {
      throw 'Failed to encode credentials'; // Throw error if encoding fails
    }

    return `Basic ${base64Credentials}`; // Return the Basic Auth token
  } catch (error) {
    throw 'Failed to create Basic Auth token'; // Handle token creation failure
  }
}