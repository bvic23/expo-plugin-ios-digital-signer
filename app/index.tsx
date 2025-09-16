import { digitalSignFileAsync } from "digital-signer";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const HomeScreen = () => {
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [selectedPrivateKey, setSelectedPrivateKey] =
    useState<DocumentPicker.DocumentPickerResult | null>(null);

  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const pickDocument = async () => {
    try {
      setLastError(null);
      setSignature(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setSelectedFile(result);
      }
    } catch (error) {
      console.error("Document picker error:", error);
      setLastError("Failed to select file. Please try again.");
    }
  };

  const pickPrivateKey = async () => {
    try {
      setLastError(null);
      setSignature(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setSelectedPrivateKey(result);
      }
    } catch (error) {
      console.error("Document picker error:", error);
      setLastError("Failed to select private key. Please try again.");
    }
  };

  const handleSign = async () => {
    if (!selectedFile?.assets?.[0] || !selectedPrivateKey?.assets?.[0]) {
      return;
    }

    setIsSigning(true);
    setLastError(null);
    setSignature(null);

    try {
      const fileUri = selectedFile.assets[0].uri;
      const keyUri = selectedPrivateKey.assets[0].uri;

      const result = await digitalSignFileAsync(fileUri, keyUri);
      setSignature(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setLastError(`Signing error: ${errorMessage}`);
    } finally {
      setIsSigning(false);
    }
  };

  const signEnabled =
    selectedFile &&
    !selectedFile.canceled &&
    selectedFile.assets[0] &&
    selectedPrivateKey &&
    !selectedPrivateKey.canceled &&
    selectedPrivateKey.assets[0];

  return (
    <View style={styles.content}>
      <Text style={styles.title}>Document Signer</Text>

      <View style={styles.fileInfo}>
        {selectedFile && !selectedFile.canceled ? (
          <View style={styles.selectedFileContainer}>
            <Text style={styles.fileLabel}>Selected File:</Text>
            <Text style={styles.fileName}>{selectedFile.assets[0].name}</Text>
            <Text style={styles.fileSize}>
              Size: {(selectedFile.assets[0].size! / 1024).toFixed(2)} KB
            </Text>
          </View>
        ) : (
          <Text style={styles.noFileText}>No file selected</Text>
        )}

        {selectedPrivateKey && !selectedPrivateKey.canceled ? (
          <View style={styles.selectedFileContainer}>
            <Text style={styles.fileLabel}>Selected Private Key:</Text>
            <Text style={styles.fileName}>
              {selectedPrivateKey.assets[0].name}
            </Text>
            <Text style={styles.fileSize}>
              Size: {(selectedPrivateKey.assets[0].size! / 1024).toFixed(2)} KB
            </Text>
          </View>
        ) : (
          <Text style={styles.noFileText}>No private key selected</Text>
        )}
      </View>

      {signature && (
        <View style={styles.signatureContainer}>
          <Text style={styles.signatureLabel}>Digital Signature:</Text>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureText} numberOfLines={3}>
              {signature}
            </Text>
          </View>
        </View>
      )}

      {lastError && (
        <View style={styles.statusContainer}>
          <Text style={styles.errorText}>{lastError}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.chooseFileButton}
          onPress={pickDocument}
        >
          <Text style={styles.buttonText}>Choose File</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.choosePrivateKeyButton}
          onPress={pickPrivateKey}
        >
          <Text style={styles.buttonText}>Choose Private Key</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.signButton,
            (!signEnabled || isSigning) && styles.disabledButton,
          ]}
          onPress={handleSign}
          disabled={!signEnabled || isSigning}
        >
          {isSigning ? (
            <View style={styles.signingButtonContent}>
              <ActivityIndicator
                size="small"
                color="white"
                style={styles.buttonLoader}
              />
              <Text style={styles.buttonText}>Signing...</Text>
            </View>
          ) : (
            <Text
              style={[
                styles.buttonText,
                (!signEnabled || isSigning) && styles.disabledButtonText,
              ]}
            >
              Sign
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  statusContainer: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dee2e6",
    marginBottom: 20,
    minHeight: 60,
    justifyContent: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#dc3545",
    marginTop: 8,
    fontStyle: "italic",
  },
  fileInfo: {
    marginBottom: 40,
    minHeight: 80,
    justifyContent: "center",
  },
  selectedFileContainer: {
    backgroundColor: "#e8f5e8",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4caf50",
  },
  fileLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2e7d32",
    marginBottom: 5,
  },
  fileName: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  fileSize: {
    fontSize: 12,
    color: "#666",
  },
  noFileText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
  signatureContainer: {
    backgroundColor: "#e8f5e8",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4caf50",
    marginBottom: 20,
  },
  signatureLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2e7d32",
    marginBottom: 10,
  },
  signatureBox: {
    backgroundColor: "#f1f8e9",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c8e6c9",
    marginBottom: 8,
  },
  signatureText: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#333",
    lineHeight: 16,
  },
  buttonContainer: {
    gap: 20,
  },
  chooseFileButton: {
    backgroundColor: "#2196f3",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  choosePrivateKeyButton: {
    backgroundColor: "#ff9800",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  disabledButtonText: {
    color: "#999",
  },
  signingButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLoader: {
    marginRight: 8,
  },
});
