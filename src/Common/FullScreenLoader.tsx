import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

type FullScreenLoaderProps = {
  isLoading: boolean;
  backgroundColor: Object | null;
};

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  isLoading,
  backgroundColor,
}) => {
  return (
    isLoading && (
      <View style={[styles.loaderView, backgroundColor === null ? {} : backgroundColor ]}>
        <ActivityIndicator size="large" color="#ff6f61" />
      </View>
    )
  );
};

export default FullScreenLoader;

const styles = StyleSheet.create({
  loaderView: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
  },
});
