import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {RepositoryDetail} from '../../../APICall/APIModel/RepositoryModel'; // Import the RepositoryDetail type

// Define the props expected by the ReposistoryList component
type ReposistoryListProps = {
  repositories: RepositoryDetail[]; // List of repositories to display
  selectedRepository: RepositoryDetail | null; // Currently selected repository (if any)
  onSelectRepo: (repo: RepositoryDetail) => void; // Function to handle repository selection
  editSelectedRepo: boolean; // Boolean to control if editing is allowed or not
};

const ReposistoryList = (props: ReposistoryListProps) => {
  // Function to render each repository item in the list
  const renderRepositoryItem = ({item}: {item: RepositoryDetail}) => (
    <TouchableOpacity
      // Apply different styles if the repository is selected
      style={[
        styles.listItem,
        props.selectedRepository?.id === item.id && styles.selectedItem, // Highlight the selected repository
      ]}
      onPress={() => {
        // Call onSelectRepo when a repository item is clicked
        props.onSelectRepo(item);
      }}>
      <Text style={styles.itemText}>{item.name}</Text>{' '}
      {/* Display repository name */}
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={props.repositories} // List of repositories passed in as props
      renderItem={renderRepositoryItem} // Function to render each repository item
      keyExtractor={item => item.id} // Use repository id as the unique key for each item
      style={[
        styles.listContainer,
        props.editSelectedRepo ? {} : styles.zeroHeight,
      ]} // Conditionally adjust the height of the list based on editSelectedRepo prop
    />
  );
};

export default ReposistoryList; // Export the component for use elsewhere

// Define styles using StyleSheet.create
const styles = StyleSheet.create({
  listContainer: {
    width: '100%', // Make the list container take up the full width
    maxHeight: 100, // Set a maximum height for the list container
    minHeight: 0, // Allow the list container to shrink to a minimum height of 0
    flexGrow: 0, // Prevent the list from growing beyond its maximum height
    marginBottom: 10, // Add space below the list container
  },
  listItem: {
    flexDirection: 'row', // Arrange the items in a row
    justifyContent: 'space-between', // Space out items evenly within the row
    alignItems: 'center', // Vertically align items in the center
    paddingVertical: 10, // Add vertical padding to the list item
    borderBottomWidth: 1, // Add a bottom border to separate list items
    borderBottomColor: '#ccc', // Light gray color for the bottom border
  },
  selectedItem: {
    backgroundColor: '#e0e0e0', // Highlight the selected item with a gray background
  },
  itemText: {
    fontSize: 16, // Set font size for the repository name
    color: 'black', // Set the text color to black
  },
  zeroHeight: {
    height: 0, // If `editSelectedRepo` is false, set the list height to 0 to hide it
  },
});
