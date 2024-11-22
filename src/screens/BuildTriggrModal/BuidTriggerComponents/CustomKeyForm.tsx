import React from 'react';
import {
  TextInput,
  Button,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  View,
} from 'react-native';
import {CustomKeyModel} from '../BuildTriggerModal'; // Import type for custom key model

// Define the props expected by CustomKeyForm component
type CustomKeyFormProps = {
  keyName: string; // Current value of the key name input
  keyValue: string; // Current value of the key value input
  setKeyName: React.Dispatch<React.SetStateAction<string>>; // Setter function for keyName
  setKeyValue: React.Dispatch<React.SetStateAction<string>>; // Setter function for keyValue
  saveKey: () => void; // Function to save the key (either add or update)
  editingKey: boolean; // Boolean to determine if we are editing an existing key
  customKeys: CustomKeyModel[]; // Array of custom keys
  editCustomKey: (keyModel: CustomKeyModel) => void; // Function to trigger editing a custom key
  deleteCustomKey: (keyId: string) => void; // Function to delete a custom key
};

// Functional component that renders the custom key form
const CustomKeyForm = ({
  keyName,
  keyValue,
  setKeyName,
  setKeyValue,
  saveKey,
  editingKey,
  customKeys,
  editCustomKey,
  deleteCustomKey,
}: CustomKeyFormProps) => {
  // Function to render each custom key item in the list
  const renderCustomKeyItem = ({item}: {item: CustomKeyModel}) => (
    <View style={styles.listItem}>
      <Text style={styles.itemText}>
        {item.keyName}: {item.keyValue}
      </Text>
      <View style={styles.listItemActions}>
        {/* Edit button */}
        <TouchableOpacity
          onPress={() => editCustomKey(item)} // Trigger the edit function for the selected key
          style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        {/* Delete button */}
        <TouchableOpacity
          onPress={() => deleteCustomKey(item.id)} // Trigger delete for the selected key
          style={[styles.editButton, styles.redBgColor]}>
          <Text style={styles.editButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <React.Fragment>
      {/* Section title */}
      <Text style={styles.title}>Custom Pipeline Params</Text>

      {/* Inputs for entering key name and key value */}
      <View style={styles.pipeLineParamInput}>
        <TextInput
          style={styles.input}
          placeholder="Key Name"
          value={keyName} // Bind input to the keyName value
          onChangeText={setKeyName} // Update keyName when the text changes
          autoCapitalize="none" // Disable auto capitalization
        />
        <TextInput
          style={styles.input}
          placeholder="Key Value"
          value={keyValue} // Bind input to the keyValue value
          onChangeText={setKeyValue} // Update keyValue when the text changes
          autoCapitalize="none" // Disable auto capitalization
        />
      </View>

      {/* Button to save the key (either add or update) */}
      <Button
        title={editingKey ? 'Save Param' : 'Add Param'} // Change button text depending on editing mode
        onPress={saveKey} // Trigger the saveKey function when pressed
      />

      {/* Render the list of custom keys if available */}
      {customKeys.length > 0 && (
        <View style={styles.width100}>
          <Text style={styles.sectionTitle}>Custom Params</Text>
          <FlatList
            data={customKeys} // Pass the array of custom keys
            renderItem={renderCustomKeyItem} // Use renderCustomKeyItem to display each item
            keyExtractor={item => item.id} // Use the keyId as the unique key for each item
            style={styles.listContainer} // Apply styles to the list container
          />
        </View>
      )}
    </React.Fragment>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
    color: 'black',
  },
  pipeLineParamInput: {
    flexDirection: 'row', // Display the inputs in a row
    justifyContent: 'space-evenly', // Space the inputs evenly
    alignItems: 'flex-end', // Align inputs to the bottom
    gap: 5, // Add some space between the inputs
  },
  input: {
    width: '50%', // Set each input to take up half of the available width
    height: 40,
    borderColor: '#ccc', // Light gray border color
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10, // Add some padding inside the input
    color: 'black', // Set text color to black
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'flex-start', // Align the section title to the left
  },
  listItem: {
    flexDirection: 'row', // Arrange item text and actions in a row
    justifyContent: 'space-between', // Space them apart
    alignItems: 'center', // Align items vertically in the center
    paddingVertical: 10, // Add vertical padding
    borderBottomWidth: 1, // Add a bottom border to each list item
    borderBottomColor: '#ccc', // Light gray bottom border color
  },
  itemText: {
    fontSize: 16,
    color: 'black', // Set text color to black
  },
  listItemActions: {
    flexDirection: 'row', // Arrange action buttons (edit, delete) in a row
  },
  editButton: {
    marginLeft: 10, // Add space between buttons
    padding: 5, // Add padding inside the button
    backgroundColor: '#007BFF', // Blue background for the edit button
    borderRadius: 5, // Rounded corners for the button
  },
  editButtonText: {
    color: 'white', // White text for the button
    fontSize: 14,
  },
  redBgColor: {
    backgroundColor: 'red', // Red background for the delete button
  },
  listContainer: {
    width: '100%', // Make the list take up full width
    maxHeight: 100, // Limit the list's height to 100px
    minHeight: 0,
    flexGrow: 0,
    marginBottom: 10, // Add space below the list
  },
  width100: {
    width: '100%', // Ensure the container takes up the full width
  },
});

export default CustomKeyForm; // Export the component for use elsewhere
