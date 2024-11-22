import React, {useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {BranchModel} from '../../../APICall/APIModel/BranchDataModel'; // Model for Branch data
import {RepositoryDetail} from '../../../APICall/APIModel/RepositoryModel'; // Model for Repository data

// Type definitions for the component props
type BranchListAndSearchProps = {
  selectedBranch: BranchModel | null; // The currently selected branch
  selectedRepository: RepositoryDetail | null; // The currently selected repository
  branches: BranchModel[]; // List of branches to display
  filterBranch: string | null; // The search/filter text for branches
  onchangeText: (text: string) => void; // Function to handle text input changes
  loadMoreBranches: () => void; // Function to load more branches (pagination)
  onSelectBranch: (selectedBranch: BranchModel) => void; // Function to handle branch selection
};

// Enum for managing UI status states
enum UIStatus {
  repoNull, // Repository is not selected
  branchNull, // Branch is not selected
  bothSelected, // Both repository and branch are selected
}

const BranchListAndSearch = (props: BranchListAndSearchProps) => {
  // State to manage the UI status based on repository and branch selection
  const [branchUIStatus, setBranchUIStatus] = useState<UIStatus>(
    UIStatus.repoNull, // Initial status is repository not selected
  );

  // Render each branch item in the list
  const renderBranchItem = ({item}: {item: BranchModel}) => (
    <TouchableOpacity
      style={[
        styles.listItem, // Base styling for each list item
        props.selectedBranch?.objectId === item.objectId && styles.selectedItem, // Highlight selected branch
      ]}
      onPress={() => {
        // Handle branch selection
        props.onSelectBranch(item);
      }}>
      <Text style={styles.itemText}>
        {/* Display branch name, stripping the 'refs/heads/' prefix */}
        {item.name.replace('refs/heads/', '')}
      </Text>
    </TouchableOpacity>
  );

  // Determines what UI should be shown based on the selection of repository and branch
  function hideBranchView(): UIStatus {
    if (props.selectedRepository === null) {
      return UIStatus.repoNull; // No repository selected
    } else {
      if (props.selectedBranch === null) {
        return UIStatus.branchNull; // Repository selected, but no branch selected
      } else {
        return UIStatus.bothSelected; // Both repository and branch are selected
      }
    }
  }

  // Function to render the branch list and search input
  const showBranchUI = () => {
    return (
      <View>
        {/* Text input for filtering/searching branches */}
        <TextInput
          style={styles.input}
          placeholder="Search Branch Name"
          value={props.filterBranch ?? ''} // Bind the input value to the filterBranch prop
          autoCapitalize="none" // Disable auto-capitalization
          onChangeText={value => {
            props.onchangeText(value); // Pass the input text back to the parent component
          }}
        />
        {/* FlatList for rendering the list of branches */}
        <FlatList
          data={props.branches} // List of branches to display
          renderItem={renderBranchItem} // Render each branch item using the renderBranchItem function
          keyExtractor={item => item.name} // Use branch name as a unique key for each item
          style={styles.listContainer} // Apply styles to the list container
          onEndReached={props.loadMoreBranches} // Trigger load more branches when reaching the end of the list
          onEndReachedThreshold={0.1} // Load more when 10% of the list is visible
        />
      </View>
    );
  };

  // Effect to update the branch UI status whenever the selected repository or branch changes
  useEffect(() => {
    const data = hideBranchView(); // Get the current UI status
    setBranchUIStatus(data); // Update the branch UI status state
  }, [props.selectedRepository, props.selectedBranch]); // Re-run effect when repository or branch changes

  return (
    <View style={[styles.width100]}>
      {/* Conditionally render the branch UI if branch is selected */}
      {branchUIStatus === UIStatus.branchNull && showBranchUI()}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    width: '100%',
    maxHeight: 100, // Limit the height of the branch list
    minHeight: 0,
    flexGrow: 0, // Prevent flex-grow behavior for the list container
    marginBottom: 10, // Add margin below the list
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, // Vertical padding for each list item
    borderBottomWidth: 1, // Border between list items
    borderBottomColor: '#ccc', // Light gray border color
  },
  selectedItem: {
    backgroundColor: '#e0e0e0', // Background color for the selected branch
  },
  itemText: {
    fontSize: 16,
    color: 'black', // Text color for the branch name
  },
  input: {
    width: '100%', // Full width for the input field
    height: 40, // Set a fixed height for the input field
    borderColor: '#ccc', // Light gray border color for the input
    borderWidth: 1, // Border width
    borderRadius: 5, // Rounded corners for the input field
    marginBottom: 10, // Margin below the input field
    paddingLeft: 10, // Padding inside the input field
    color: 'black', // Text color inside the input
  },
  width100: {width: '100%'}, // Utility class to set width to 100%
});

export default BranchListAndSearch;
