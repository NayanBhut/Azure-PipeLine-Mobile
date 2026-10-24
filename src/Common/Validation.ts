/**
 * Input validation helpers.
 *
 * Values entered by the user are interpolated into Azure DevOps REST URLs and
 * HTTP headers, so they must be validated before use. This prevents path
 * traversal / URL injection through the organization name and header
 * injection through the token value.
 */

const ORGANIZATION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{0,63}$/;
// Printable ASCII without spaces. Azure DevOps PATs and Microsoft Entra tokens
// are both covered by this character set.
const TOKEN_PATTERN = /^[\x21-\x7E]+$/;

export function validateOrganizationName(value: string): string | null {
  const organization = value.trim();

  if (organization.length === 0) {
    return 'Organization name is required';
  }

  if (!ORGANIZATION_PATTERN.test(organization)) {
    return 'Use letters, numbers and hyphens only (max 64 characters)';
  }

  return null;
}

export function validatePersonalAccessToken(value: string): string | null {
  const token = value.trim();

  if (token.length === 0) {
    return 'Personal access token is required';
  }

  if (token.length < 20) {
    return 'The token looks too short. Copy the full personal access token.';
  }

  if (token.length > 512 || !TOKEN_PATTERN.test(token)) {
    return 'The token contains invalid characters';
  }

  return null;
}

export function normalizeOrganizationName(value: string): string {
  return value.trim();
}

export function normalizePersonalAccessToken(value: string): string {
  return value.trim();
}

/**
 * Artifact names come from the Azure DevOps API and are used to build a local
 * file path. Strip any directory components and unsafe characters so a crafted
 * artifact name cannot escape the app's sandbox.
 */
export function sanitizeFileName(value: string, fallback = 'artifact'): string {
  const baseName = value.split(/[/\\]/).pop() ?? '';
  const sanitized = baseName
    // eslint-disable-next-line no-control-regex -- intentional control-char stripping
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[^A-Za-z0-9._-]/g, '_')
    .replace(/^\.+/, '')
    .slice(0, 120);

  return sanitized.length > 0 ? sanitized : fallback;
}
