import { Alert } from "react-native";
import { useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { useAtom } from "jotai";
import { useQueryClient } from "@tanstack/react-query";

import { userAtom } from "@/src/store/auth";
import { updateProfile } from "@/src/services/profileService";
import { persistProfileImage } from "@/src/utils/media";
import { showApiError } from "@/src/services/apiError";

export function useProfilePicture() {
  const [, setUser] = useAtom(userAtom);
  const queryClient = useQueryClient();

  const handlePicked = useCallback(
    async (tempUri: string) => {
      try {
        const localUri = await persistProfileImage(tempUri);
        const updated = await updateProfile({ profilePicPath: localUri });
        setUser(updated);
        queryClient.setQueryData(["currentUser"], updated);
      } catch (err) {
        showApiError("Failed to update profile picture", err);
      }
    },
    [setUser, queryClient],
  );

  const pickFromCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Camera access is needed to take a photo.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      await handlePicked(result.assets[0].uri);
    }
  }, [handlePicked]);

  const pickFromGallery = useCallback(async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Gallery access is needed to choose a photo.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      await handlePicked(result.assets[0].uri);
    }
  }, [handlePicked]);

  const openPicker = useCallback(() => {
    Alert.alert("Change Profile Picture", undefined, [
      { text: "Take Photo", onPress: pickFromCamera },
      { text: "Choose from Gallery", onPress: pickFromGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  }, [pickFromCamera, pickFromGallery]);

  return openPicker;
}
