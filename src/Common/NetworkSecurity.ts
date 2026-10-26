/**
 * Azure DevOps host allow-list.
 *
 * The app attaches an Authorization header to requests it makes. URLs can also
 * come back from the API (log and artifact download URLs), so they must be
 * checked before the token is sent to them. This prevents a compromised or
 * spoofed API response from exfiltrating the personal access token.
 */
const TRUSTED_HOST_SUFFIXES = ['dev.azure.com', 'visualstudio.com'];

export function isTrustedAzureDevOpsUrl(value: string): boolean {
  try {
    const url = new URL(value);

    if (url.protocol !== 'https:') {
      return false;
    }

    const host = url.hostname.toLowerCase();
    return TRUSTED_HOST_SUFFIXES.some(
      suffix => host === suffix || host.endsWith(`.${suffix}`),
    );
  } catch {
    return false;
  }
}
