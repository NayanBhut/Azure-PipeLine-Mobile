import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';

// Define types for props expected by BuildTriggerButton
type BuildTriggerButtonProps = {
  triggerBuild: () => void; // Function to trigger the build
  cancel: (status: boolean) => void; // Function to cancel the build with a status
};

// Functional component to render the buttons
const BuildTriggerButton = (props: BuildTriggerButtonProps) => {
  return (
    // Container for the buttons with horizontal layout
    <View style={styles.actionButtonContainer}>
      {/* Cancel button */}
      <TouchableOpacity
        onPress={() => props.cancel(false)} // Call cancel with false status when pressed
        style={styles.cancelButton}>
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>

      {/* Trigger Build button */}
      <TouchableOpacity
        onPress={props.triggerBuild} // Call triggerBuild function when pressed
        style={styles.triggerButton}>
        <Text style={styles.buttonText}>Trigger Build</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BuildTriggerButton; // Export the component for use in other parts of the app

// StyleSheet for button container and individual button styles
const styles = StyleSheet.create({
  actionButtonContainer: {
    flexDirection: 'row', // Align buttons horizontally
    justifyContent: 'center', // Center buttons within the container
    marginTop: 20, // Add top margin for spacing
  },
  cancelButton: {
    marginRight: 20, // Space between cancel and trigger buttons
    padding: 10, // Padding inside the button
    backgroundColor: '#6c757d', // Gray background color for cancel button
    borderRadius: 5, // Rounded corners for the button
  },
  triggerButton: {
    padding: 10, // Padding inside the button
    backgroundColor: '#007BFF', // Blue background color for trigger button
    borderRadius: 5, // Rounded corners for the button
  },
  buttonText: {
    color: 'white', // White text color
    fontSize: 16, // Font size of the text
    textAlign: 'center', // Center align text inside the button
  },
});
