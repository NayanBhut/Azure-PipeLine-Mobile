import React, {useCallback, useEffect, useState} from 'react';
import {Artifacts} from '../../APICall/APIModel/ArtifactModel'; // Import Artifact model for type
import RNFS from 'react-native-fs'; // React Native File System to handle file operations
import Share from 'react-native-share'; // Lets the user save/share the downloaded artifact
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'; // Import necessary React Native components
import {getAuthorizationHeader} from '../../Common/SecureStorage';
import {isTrustedAzureDevOpsUrl} from '../../Common/NetworkSecurity';
import {sanitizeFileName} from '../../Common/Validation';

const ArtifactsList = ({
  item,
  buildID,
}: {
  item: Artifacts;
  buildID: string | number;
}) => {
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

  // Artifacts are downloaded into app-scoped cache storage. No broad storage
  // permission (MANAGE_EXTERNAL_STORAGE) is required, and the files are not
  // backed up to iCloud/Google.
  const getDownloadDestination = useCallback(
    (fileName: string) => {
      const safeBuildId = sanitizeFileName(String(buildID), 'build');
      const safeName = sanitizeFileName(fileName, 'artifact');
      return `${RNFS.CachesDirectoryPath}/${safeBuildId}_${safeName}.zip`;
    },
    [buildID],
  );

  const shareDownloadedFile = async (filePath: string) => {
    try {
      await Share.open({
        url: `file://${filePath}`,
        type: 'application/zip',
        filename: filePath.split('/').pop(),
        failOnCancel: false,
      });
    } catch (error) {
      if (__DEV__) {
        console.error('Share failed', error);
      }
    }
  };

  // Function to handle file download
  const downloadFile = async (fileName: string, url: string) => {
    const downloadDest = getDownloadDestination(fileName);
    setIsDownloading(true); // Set downloading flag to true

    try {
      // Check if the file already exists
      const fileExists = await RNFS.exists(downloadDest);
      if (fileExists) {
        Alert.alert('Already downloaded', undefined, [
          {text: 'Close', style: 'cancel'},
          {
            text: 'Share / Save',
            onPress: () => shareDownloadedFile(downloadDest),
          },
        ]);
        return;
      }

      // Only attach the PAT to Azure DevOps hosts. Other URLs (for example
      // pre-signed blob URLs) are downloaded without credentials.
      const trustedHost = isTrustedAzureDevOpsUrl(url);
      const token = trustedHost ? await getAuthorizationHeader() : null;

      if (trustedHost && !token) {
        Alert.alert('Session expired', 'Please log in again.');
        return;
      }

      // Start the file download
      const download = RNFS.downloadFile({
        fromUrl: url, // URL of the file to download
        toFile: downloadDest, // Local path to save the downloaded file
        headers: token ? {Authorization: token} : {}, // Only send the token to trusted hosts
        background: true, // Allow background download
      });

      // Wait for the download to complete
      const result = await download.promise;

      // Check if the download was successful
      if (result.statusCode === 200) {
        Alert.alert(
          `${item.name} downloaded`,
          'The artifact is stored in the app’s private storage. Share or save it to your Files/Downloads.',
          [
            {text: 'Close', style: 'cancel'},
            {
              text: 'Share / Save',
              onPress: () => shareDownloadedFile(downloadDest),
            },
          ],
        );
      } else if (result.statusCode === 401 || result.statusCode === 403) {
        Alert.alert('Session expired', 'Please log in again.');
      } else {
        Alert.alert(`Download failed (${result.statusCode})`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Download error', error);
      }
      Alert.alert('Error downloading file');
    } finally {
      setIsDownloading(false); // Set downloading flag to false after operation
    }
  };

  // Function to check the download status of the file
  const getDownloadStatus = useCallback(
    async (fileName: string): Promise<string> => {
      const downloadDest = getDownloadDestination(fileName);

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
    [getDownloadDestination, isDownloading], // Dependency on buildID and downloading state
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
              await downloadFile(item.name, item.resource.downloadUrl); // Download into app-scoped storage
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
