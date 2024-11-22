import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ApiService from '../../APICall/APIService'; // Service to make API calls
import AsyncStorage from '@react-native-async-storage/async-storage'; // For accessing the device storage
import {BuildRecord} from '../../APICall/APIModel/BuildLogModel'; // Import model for build records

import getDateDiff from '../../Common/Functions'; // Utility function to calculate time differences

// Task Card Component
const TaskCard = ({
  task, // The task object passed to the component
  logs, // Logs to be displayed (used for task logs)
  showFullLog, // Function to trigger full log display
  setFullLog, // Function to set the full log text
}: {
  task: BuildRecord;
  logs: string;
  showFullLog: () => void;
  setFullLog: (fullLog: string) => void;
}) => {
  // Local states to handle loading, task logs and log visibility
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [tasklogs, setTaskLogs] = useState<string | null>(null);

  // Function to handle view of logs (full log or brief log)
  const handleViewLogs = async (isFullLog: boolean) => {
    if (!showLogs && !tasklogs) {
      // If logs haven't been fetched yet
      setIsLoadingLogs(true); // Set loading state to true
      try {
        if (!task.log?.url) {
          // Check if log URL exists
          throw new Error('Log URL not available');
        }
        getLogs().then(() => {
          if (isFullLog) {
            // Show full log if requested
            showFullLog();
          }else {
            setShowLogs(true);
          }
        });
      } catch (error) {
        Alert.alert(
          'Error',
          `Failed to fetch logs. Please try again. ${error}`,
        );
      } finally {
        setIsLoadingLogs(false); // Stop loading after attempt
      }
    } else {
      // If logs are already fetched, toggle log visibility or show full log
      if (isFullLog) {
        showFullLog(); // Show full log in modal
      } else {
        setShowLogs(!showLogs); // Toggle the visibility of brief logs
      }
    }
  };

  // Function to fetch logs from the server
  const getLogs = () => {
    return new Promise<void>((resolve, reject) => {
      AsyncStorage.getItem('token') // Get token from AsyncStorage
        .then(token => {
          if (!token) {
            reject('Token or organization URL is missing.'); // Handle missing token
            return;
          }

          setIsLoadingLogs(true); // Set loading state while fetching logs

          const apiService = new ApiService(task.log?.url ?? ''); // API service to fetch logs

          // Make the API request to fetch logs
          apiService
            .get('', {
              'content-type': 'application/json',
              Authorization: token, // Pass token in authorization header
            })
            .then(response => {
              setTaskLogs(response.data as string); // Store the fetched logs
              setFullLog(response.data as string); // Pass full log data to parent component
              setIsLoadingLogs(false); // Stop loading
              resolve(); // Resolve the promise after data is processed
            })
            .catch(error => {
              console.error(error);
              setTaskLogs(null); // Reset task logs if an error occurs
              setIsLoadingLogs(false); // Stop loading
              reject(error); // Reject the promise if the request fails
            });
        })
        .catch(error => {
          console.error('Error getting token:', error); // Log any error with AsyncStorage
          reject(error); // Reject if token retrieval fails
        });
    });
  };

  // Function to get the last 15 lines from the logs
  const getlast15Lines = () => {
    const lines = logs.trim().split('\n'); // Split the log into lines
    return lines.slice(-15).join('\n'); // Return the last 15 lines
  };

  return (
    <View>
      <View style={styles.itemContainer}>
        {/* Type indicator for the task (Job or Task) */}
        <View
          style={[
            styles.typeIndicator,
            task.type === 'Job' ? styles.jobBGColor : styles.taskBGColor,
          ]}>
          <Text style={styles.typeText}>{task.type}</Text>
        </View>

        {/* Task details */}
        <View style={styles.contentContainer}>
          <Text style={styles.itemName}>{task.name}</Text>

          <View style={styles.detailsContainer}>
            {/* Display time difference between start and finish */}
            <Text style={styles.timeText}>
              {getDateDiff(task.finishTime, task.startTime)}
            </Text>

            {/* Display result (succeeded or failed) */}
            <Text
              style={[
                styles.resultText,
                task.result === 'succeeded'
                  ? styles.successResultColor
                  : styles.otherResultColor,
              ]}>
              {task.result}
            </Text>
          </View>

          {/* Display error details if there are errors */}
          {task.errorCount > 0 && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorCount}>Errors: {task.errorCount}</Text>
              {task.issues?.map((issue, indexIssue) => (
                <Text key={indexIssue} style={styles.errorMessage}>
                  • {issue.message}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Log URL exists, render buttons to show/hide logs */}
      {task.log?.url != null && (
        <View>
          <View style={[styles.itemContainer, styles.logsButtonView]}>
            {/* Button to toggle visibility of brief logs */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleViewLogs(false)}>
              <Text style={styles.buttonText}>
                {showLogs ? 'Hide Logs' : 'View Logs'}
              </Text>
            </TouchableOpacity>

            {/* Button to show full log in a modal */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleViewLogs(true)}>
              <Text style={styles.buttonText}>Show Full Log</Text>
            </TouchableOpacity>

            {/* Display loading indicator while fetching logs */}
            {isLoadingLogs && (
              <ActivityIndicator
                size="small"
                color="#0066cc"
                style={styles.logsLoader}
              />
            )}
          </View>

          {/* Display logs if showLogs is true */}
          {showLogs && logs && (
            <View style={styles.logsContainer}>
              <Text style={styles.logsText}>{getlast15Lines()}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Style definitions for different parts of the card component
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  typeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
    height: 25,
  },
  taskBGColor: {backgroundColor: '#4CAF50'},
  jobBGColor: {backgroundColor: '#0066cc'},
  successResultColor: {color: '#4CAF50'},
  otherResultColor: {color: '#f44336'},
  typeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  resultText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 4,
  },
  errorCount: {
    color: '#f44336',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  errorMessage: {
    color: '#d32f2f',
    fontSize: 12,
    marginLeft: 8,
  },
  separator: {
    height: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
  },
  logsText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
  logsLoader: {
    marginTop: 12,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 5,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logsButtonView: {flexDirection: 'row', justifyContent: 'center', gap: 10},
});

export default TaskCard;
