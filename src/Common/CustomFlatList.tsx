import React, {memo} from 'react';
import {FlatList, StyleSheet, View, FlatListProps} from 'react-native';

const CustomFlatList = <T,>({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
  onEndReachedThreshold = 0.5,
  ListEmptyComponent,
  ListFooterComponent,
  ListHeaderComponent,
  ItemSeparatorComponent,
  style,
}: CustomFlatListProps<T>) => {
  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        ListHeaderComponent={ListHeaderComponent}
        ItemSeparatorComponent={ItemSeparatorComponent}
        style={styles.flatList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

type CustomFlatListProps<T> = {
  data: T[];
  renderItem: FlatListProps<T>['renderItem'];
  keyExtractor: FlatListProps<T>['keyExtractor'];
  onEndReached?: FlatListProps<T>['onEndReached'];
  onEndReachedThreshold?: FlatListProps<T>['onEndReachedThreshold'];
  ListEmptyComponent?: FlatListProps<T>['ListEmptyComponent'];
  ListFooterComponent?: FlatListProps<T>['ListFooterComponent'];
  ListHeaderComponent?: FlatListProps<T>['ListHeaderComponent'];
  ItemSeparatorComponent?: FlatListProps<T>['ItemSeparatorComponent'];
  style?: any;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
});

export default memo(CustomFlatList);
