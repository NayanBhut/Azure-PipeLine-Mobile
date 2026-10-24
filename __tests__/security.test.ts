import {base64Encode} from '../src/Common/Base64';
import {
  sanitizeFileName,
  validateOrganizationName,
  validatePersonalAccessToken,
} from '../src/Common/Validation';
import {isTrustedAzureDevOpsUrl} from '../src/Common/NetworkSecurity';
import {
  convertPatToBasicToken,
  convertToBasicToken,
} from '../src/screens/LoginForm/BasicToken';

const PAT = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJ';

describe('base64Encode', () => {
  it('matches known vectors', () => {
    expect(base64Encode('')).toBe('');
    expect(base64Encode('f')).toBe('Zg==');
    expect(base64Encode('fo')).toBe('Zm8=');
    expect(base64Encode('foo')).toBe('Zm9v');
    expect(base64Encode('foobar')).toBe('Zm9vYmFy');
  });

  it('encodes UTF-8 input', () => {
    expect(base64Encode('é')).toBe('w6k=');
  });
});

describe('validation', () => {
  it('accepts a normal Azure DevOps organization name', () => {
    expect(validateOrganizationName('my-org-123')).toBeNull();
  });

  it('rejects URL injection attempts in the organization name', () => {
    expect(validateOrganizationName('../other')).not.toBeNull();
    expect(validateOrganizationName('org?x=1')).not.toBeNull();
    expect(validateOrganizationName('')).not.toBeNull();
  });

  it('rejects short, empty and whitespace-containing tokens', () => {
    expect(validatePersonalAccessToken('')).not.toBeNull();
    expect(validatePersonalAccessToken('short')).not.toBeNull();
    expect(validatePersonalAccessToken(`${PAT} extra`)).not.toBeNull();
  });

  it('accepts a well-formed token', () => {
    expect(validatePersonalAccessToken(PAT)).toBeNull();
  });

  it('strips path traversal from artifact file names', () => {
    expect(sanitizeFileName('../../etc/passwd')).toBe('passwd');
    expect(sanitizeFileName('..\\..\\secret.txt')).toBe('secret.txt');
    expect(sanitizeFileName('')).toBe('artifact');
  });
});

describe('azure devops host allow-list', () => {
  it('accepts Azure DevOps HTTPS hosts', () => {
    expect(isTrustedAzureDevOpsUrl('https://dev.azure.com/')).toBe(true);
    expect(
      isTrustedAzureDevOpsUrl('https://vssps.dev.azure.com/my-org/_apis/'),
    ).toBe(true);
    expect(
      isTrustedAzureDevOpsUrl(
        'https://artprodcus3.artifacts.visualstudio.com/artifact.zip',
      ),
    ).toBe(true);
  });

  it('rejects look-alike, non-HTTPS and malformed URLs', () => {
    expect(isTrustedAzureDevOpsUrl('https://evil.example/')).toBe(false);
    expect(isTrustedAzureDevOpsUrl('https://dev.azure.com.evil.example/')).toBe(
      false,
    );
    expect(isTrustedAzureDevOpsUrl('http://dev.azure.com/')).toBe(false);
    expect(isTrustedAzureDevOpsUrl('not a url')).toBe(false);
  });
});

describe('basic auth header', () => {  it('builds a Basic header without the token appearing in clear text', () => {
    const header = convertPatToBasicToken(PAT);
    expect(header.startsWith('Basic ')).toBe(true);
    expect(header).not.toContain(PAT);
    expect(header).toBe(`Basic ${base64Encode(`:${PAT}`)}`);
  });

  it('includes the username when supplied', () => {
    expect(convertToBasicToken('user@example.com', PAT)).toBe(
      `Basic ${base64Encode(`user@example.com:${PAT}`)}`,
    );
  });

  it('rejects unsafe tokens before building a header', () => {
    expect(() => convertPatToBasicToken('bad token with spaces')).toThrow();
  });
});
