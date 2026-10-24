/**
 * @format
 */

import 'react-native';
import React from 'react';
import {it, expect} from '@jest/globals';
import renderer, {act} from 'react-test-renderer';
import App from '../src/App';

it('renders the login screen', async () => {
  let tree: renderer.ReactTestRenderer | undefined;

  await act(async () => {
    tree = renderer.create(<App />);
  });

  expect(tree?.toJSON()).toBeTruthy();

  await act(async () => {
    tree?.unmount();
  });
});
