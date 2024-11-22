import React, {useRef, useEffect, useState} from 'react';
import {FlatList, Modal, Pressable, StyleSheet, Text, View} from 'react-native';

// Define the props for FullLogModal component
interface FullLogModalProps {
  logs: string; // The logs to be displayed in the modal
  visible: boolean; // Boolean to control visibility of the modal
  onClose: () => void; // Function to close the modal
}

const FullLogModal = (props: FullLogModalProps) => {
  // State to store log chunks (split by newline)
  const [logChunks, setLogChunks] = useState<string[]>([]);

  // Reference to the FlatList for automatic scrolling
  const flatListRef = useRef<FlatList>(null);

  // Effect to split the logs into chunks whenever props.logs changes
  useEffect(() => {
    const chunks = props.logs.split('\n'); // Split logs by newline character
    setLogChunks(chunks); // Update state with the new log chunks
    console.log(chunks.length); // Log the number of chunks (for debugging)
  }, [props.logs]); // Only re-run the effect when logs prop changes

  // Scroll to the bottom whenever the log chunks change (new logs added)
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true}); // Scroll to the end of the list
    }
  }, [logChunks]); // This effect is triggered when logChunks state is updated

  return (
    <Modal visible={props.visible} animationType="none" transparent={true}>
      {/* Modal overlay that darkens the background */}
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Close button to close the modal */}
          <View style={styles.buttonContainer}>
            <Pressable style={styles.closeButton} onPress={props.onClose}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>

          {/* FlatList to display log chunks */}
          <FlatList
            ref={flatListRef} // Attach reference to FlatList
            data={logChunks} // Data for the FlatList, the log chunks
            renderItem={({item}) => (
              <View>
                <Text>{item}</Text> {/* Render each log chunk as text */}
              </View>
            )}
            decelerationRate="fast"
            keyExtractor={(item, index) => index.toString()} // Key each item by its index
            showsVerticalScrollIndicator={false} // Hide vertical scroll indicator
            contentContainerStyle={{paddingBottom: 0}} // Adjust container padding if needed
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1, // Take up the full screen
    justifyContent: 'center', // Center the modal vertically
    alignItems: 'center', // Center the modal horizontally
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background overlay
  },
  modalContainer: {
    width: '90%', // Modal width is 90% of the screen
    maxHeight: '70%', // Maximum height is 70% of the screen
    padding: 20, // Padding inside the modal
    backgroundColor: 'white', // White background for the modal content
    borderRadius: 10, // Rounded corners for the modal
    alignItems: 'center', // Center the content horizontally
    flexDirection: 'column', // Arrange children elements in a column
  },
  buttonContainer: {
    width: '100%', // Button container takes full width
  },
  closeButton: {
    alignSelf: 'flex-end', // Align the close button to the right
  },
  closeText: {
    color: 'red', // Red text for the close button
    height: 40, // Set the height of the close button
  },
});

export default FullLogModal; // Export the component for use elsewhere
