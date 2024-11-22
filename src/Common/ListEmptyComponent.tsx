import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface ListEmptyComponentProps {
  isLoading: boolean;
}

const ListEmptyComponent: React.FC<ListEmptyComponentProps> = ({isLoading}) => {
  return !isLoading ? (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No builds available.</Text>
    </View>
  ) : (
    <View />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
});

export default ListEmptyComponent;
