import React, {useCallback, useEffect, useState} from 'react';
import {Artifacts} from '../../APICall/APIModel/ArtifactModel'; // Import Artifact model for type
import RNFS from 'react-native-fs'; // React Native File System to handle file operations
import {
  ActivityIndicator,
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'; // Import necessary React Native components
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing/retrieving data locally

const ArtifactsList = ({item, buildID}: {item: Artifacts; buildID: string}) => {
  // State to track the download process
  const [isDownloading, setIsDownloading] = useState(false);

  // Helper function to format the file size into human-readable format
  const formatSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) {
      return '0 Byte';
    }
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  // Function to handle file download
  const downloadFile = async (fileName: string, url: string) => {
    setIsDownloading(true); // Set downloading flag to true

    console.log(`Downloading ${url}`);

    // Determine the local destination for the file based on platform (Android/iOS)
    const fileUrl = url; // The URL to download the file from
    let downloadDest =
      RNFS.DownloadDirectoryPath + `/${buildID}_${fileName}.zip`; // Default path for Android
    if (Platform.OS === 'ios') {
      downloadDest = RNFS.DocumentDirectoryPath + `/${buildID}_${fileName}.zip`; // Path for iOS
    }

    console.log(downloadDest);

    try {
      // Check if the file already exists
      const fileExists = await RNFS.exists(downloadDest);
      if (fileExists) {
        Alert.alert('File already exists'); // Alert user if the file already exists
        return;
      }

      // Retrieve the authentication token from AsyncStorage
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        console.error('Token is missing.'); // If no token, log and return
        return;
      }

      const headers = {
        Authorization: token, // Attach token to the request header
      };

      // Start the file download
      const download = RNFS.downloadFile({
        fromUrl: fileUrl, // URL of the file to download
        toFile: downloadDest, // Local path to save the downloaded file
        headers: headers, // Request headers (with Authorization)
        background: true, // Allow background download
      });

      // Wait for the download to complete
      const result = await download.promise;

      // Check if the download was successful
      if (result.statusCode === 200) {
        Alert.alert(`${item.name} Downloaded successfully`);
      } else {
        Alert.alert(`Download failed ${result.statusCode}`);
      }
    } catch (error) {
      console.error('Download error:', error); // Log download errors
      Alert.alert('Error downloading file'); // Alert on error
    } finally {
      setIsDownloading(false); // Set downloading flag to false after operation
    }
  };

  // Function to open settings for permission changes
  const openSettings = () => {
    Linking.openSettings(); // Opens device settings to manage permissions
  };

  // Function to handle permissions on Android
  const getPermission = async (fileName: string, url: string) => {
    if (Platform.OS === 'android') {
      const releaseVersion = parseFloat(Platform.constants.Release);

      if (!isNaN(releaseVersion) && releaseVersion >= 13) {
        downloadFile(fileName, url); // If version >= 13, proceed with download directly
        return;
      }

      try {
        // Request permission to manage external storage (for Android below version 13)
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message:
              'This app needs access to all files on your device to save and read data.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        // Check if permission was granted
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permission granted');
          downloadFile(fileName, url); // Proceed with the download if permission granted
        } else {
          // If permission is denied, show an alert with an option to open settings
          Alert.alert(
            'Permission Denied',
            'This app requires access to all files. Please enable it in settings.',
            [{text: 'Open Settings', onPress: openSettings}],
          );
        }
      } catch (err) {
        console.warn('Permission error:', err); // Log permission errors
      }
    } else {
      downloadFile(fileName, url); // For iOS or other platforms, directly call download
    }
  };

  // Function to check the download status of the file
  const getDownloadStatus = useCallback(
    async (fileName: string): Promise<string> => {
      let downloadDest =
        RNFS.DownloadDirectoryPath + `/${buildID}_${fileName}.zip`; // Default path for Android
      if (Platform.OS === 'ios') {
        downloadDest =
          RNFS.DocumentDirectoryPath + `/${buildID}_${fileName}.zip`; // Path for iOS
      }

      // Check if the file exists at the download destination
      const fileExists = await RNFS.exists(downloadDest);
      if (fileExists) {
        return 'Downloaded'; // If file exists, return 'Downloaded' status
      } else {
        if (isDownloading) {
          return 'Downloading'; // If currently downloading, return 'Downloading' status
        } else {
          return 'Download'; // If not downloading and file doesn't exist, return 'Download'
        }
      }
    },
    [buildID, isDownloading], // Dependency on buildID and downloading state
  );

  // State to hold the download status of the file (Download, Downloaded, or Downloading)
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  // Effect hook to fetch the download status when the component mounts or changes
  useEffect(() => {
    const fetchDownloadStatus = async () => {
      const status = await getDownloadStatus(item.name);
      setDownloadStatus(status); // Set the download status in state
    };

    fetchDownloadStatus(); // Call the function to fetch download status
  }, [getDownloadStatus, item.name]); // Trigger effect when download status function or item name changes

  return (
    <View style={styles.card}>
      <View style={styles.mainContent}>
        <View style={styles.headerSection}>
          <Text style={styles.nameText}>{item.name}</Text>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.detailText}>
            Size:{' '}
            {formatSize(parseInt(item.resource.properties.artifactsize, 10))}{' '}
            {/* Format the size of the artifact */}
          </Text>
          <Text style={styles.detailText}>Type: {item.resource.type}</Text>{' '}
          {/* Display the type of the artifact */}
        </View>
        <View style={styles.downloadSection}>
          <Pressable
            style={({pressed}) => [
              styles.downloadButton,
              pressed && styles.downloadButtonPressed,
            ]}
            onPress={async () => {
              getPermission(item.name, item.resource.downloadUrl); // Request permission and trigger download
            }}>
            <Text style={styles.downloadText}>
              {downloadStatus !== null ? downloadStatus : 'Loading...'}{' '}
              {/* Display current download status */}
            </Text>
          </Pressable>
          {isDownloading && (
            <ActivityIndicator
              size="small"
              color="#0066cc"
              style={styles.loader}
            /> // Show loading indicator during download
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 300,
    marginRight: 20,
  },
  mainContent: {
    flex: 1,
    marginRight: 0,
  },
  headerSection: {
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  idText: {
    fontSize: 14,
    color: '#666666',
  },
  detailsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
    marginRight: 16,
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  downloadButtonPressed: {
    backgroundColor: '#0056B3',
  },
  downloadText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  downloadSection: {
    paddingTop: 15,
    paddingBottom: 10,
    flexDirection: 'row',
  },
  loader: {paddingLeft: 10},
});

export default ArtifactsList;
