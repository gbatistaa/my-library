import { Directory, File, Paths } from "expo-file-system";

/**
 * Saves an image from a temporary URI (cache) to a permanent application storage directory.
 * @param tempUri The URI of the image in the temp/cache directory.
 * @returns The persistent URI of the saved image.
 */
export async function persistLibraryImage(tempUri: string): Promise<string> {
  if (!tempUri) return "";

  try {
    // Ensure the directory exists
    const coversDir = new Directory(Paths.document, "covers");
    if (!coversDir.exists) {
      coversDir.create();
    }

    // Generate a unique filename
    const filename = `cover_${Date.now()}.jpg`;
    
    // Create File instances for origin and destination
    const srcFile = new File(tempUri);
    const destFile = new File(coversDir, filename);

    // Copy the file using the new class-based method
    srcFile.copy(destFile);

    return destFile.uri;
  } catch (error) {
    console.error("Error persisting image:", error);
    return tempUri; // Fallback to temp URI if it fails
  }
}

