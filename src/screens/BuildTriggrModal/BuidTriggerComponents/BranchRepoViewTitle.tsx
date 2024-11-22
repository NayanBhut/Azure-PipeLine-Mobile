import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';

// Functional component for rendering a repository or branch title with an optional "Edit" button
const BranchRepoViewTitle = ({
  item, // Title text (e.g., repository or branch name)
  callback, // Callback function triggered when "Edit" is pressed
  hide, // Flag to determine whether to hide the "Edit" button
}: {
  item: string; // The title to display (e.g., repository or branch name)
  callback: () => void; // The function to call when "Edit" button is pressed
  hide: boolean; // A boolean flag to determine if the "Edit" button should be hidden
}) => (
  // The view that wraps the title and the optional "Edit" button
  <View style={styles.repoView}>
    {/* Display the title */}
    <Text style={[styles.sectionTitle, styles.flexone]}>{item}</Text>

    {/* Conditionally render the "Edit" button if hide is false */}
    {!hide && (
      <Pressable
        onPress={() => {
          callback(); // Trigger the callback function when the "Edit" button is pressed
        }}>
        {/* "Edit" text displayed as a clickable button */}
        <Text style={styles.blueColor}>Edit</Text>
      </Pressable>
    )}
  </View>
);

const styles = StyleSheet.create({
  // Styles for the container view that holds the title and the button
  repoView: {
    flexDirection: 'row', // Arrange items in a horizontal row
    alignItems: 'center', // Vertically center the items
    justifyContent: 'space-between', // Space out title and button (if visible)
  },
  // Styles for the title text
  sectionTitle: {
    fontSize: 16, // Font size for the title
    fontWeight: 'bold', // Make the title bold
    marginTop: 10, // Margin at the top
    marginBottom: 10, // Margin at the bottom
    alignSelf: 'flex-start', // Align the title to the start of the container
  },
  // Style to allow the title to take remaining space
  flexone: {
    flex: 1, // Ensures the title takes up all available space in the row, pushing the button to the right
  },
  // Style for the "Edit" button text, making it blue
  blueColor: {
    color: 'blue', // Color of the "Edit" text
  },
});

export default BranchRepoViewTitle;
