import React from 'react';
import {ActivityIndicator} from 'react-native';

interface ListFooterComponentProps {
  isLoading: boolean;
}

const ListFooterComponent: React.FC<ListFooterComponentProps> = ({
  isLoading,
}) => {
  return isLoading ? <ActivityIndicator size="large" color="#ff6f61" /> : null;
};


export default ListFooterComponent;
