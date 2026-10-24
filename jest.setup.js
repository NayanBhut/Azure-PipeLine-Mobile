/* eslint-env jest */

jest.mock('@react-native-async-storage/async-storage', () => {
  let mockStore = {};

  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async key =>
        key in mockStore ? mockStore[key] : null,
      ),
      setItem: jest.fn(async (key, value) => {
        mockStore[key] = value;
      }),
      removeItem: jest.fn(async key => {
        delete mockStore[key];
      }),
      getMany: jest.fn(async keys =>
        Object.fromEntries(
          keys.map(key => [key, key in mockStore ? mockStore[key] : null]),
        ),
      ),
      setMany: jest.fn(async entries => {
        Object.assign(mockStore, entries);
      }),
      removeMany: jest.fn(async keys => {
        keys.forEach(key => delete mockStore[key]);
      }),
      getAllKeys: jest.fn(async () => Object.keys(mockStore)),
      clear: jest.fn(async () => {
        mockStore = {};
      }),
    },
  };
});

jest.mock('react-native-keychain', () => ({
  ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
  },
  setGenericPassword: jest.fn(async () => ({service: 'test'})),
  getGenericPassword: jest.fn(async () => false),
  resetGenericPassword: jest.fn(async () => true),
}));

jest.mock('react-native-share', () => ({
  __esModule: true,
  default: {open: jest.fn(async () => ({success: true}))},
}));

jest.mock('react-native-fs', () => ({
  CachesDirectoryPath: '/tmp/caches',
  DocumentDirectoryPath: '/tmp/documents',
  exists: jest.fn(async () => false),
  downloadFile: jest.fn(() => ({promise: Promise.resolve({statusCode: 200})})),
}));
