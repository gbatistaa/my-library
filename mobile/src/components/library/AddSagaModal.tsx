import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { createSaga, addBookToSaga } from "@/src/services/sagaService";
import { getAllBooks } from "@/src/services/bookService";
import { showApiError } from "@/src/services/apiError";
import { persistLibraryImage } from "@/src/utils/media";
import type { BookDTO } from "@/src/types/book";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.92;

function BookSelectCard({
  book,
  selected,
  onToggle,
  mode,
}: {
  book: BookDTO;
  selected: boolean;
  onToggle: () => void;
  mode: string;
}) {
  return (
    <Pressable
      onPress={onToggle}
      className={`aspect-[3/4] rounded-2xl overflow-hidden ${
        selected
          ? "border-2 border-[#6b38d4] dark:border-[#A78BFA]"
          : "border border-[#cbc3d7]/20 dark:border-[#334155]"
      }`}
    >
      {/* Cover */}
      {book.coverUrl ? (
        <Image
          source={{ uri: book.coverUrl }}
          className="w-full h-[72%]"
          resizeMode="cover"
          style={{ opacity: selected ? 1 : 0.65 }}
        />
      ) : (
        <View
          className={`w-full h-[72%] items-center justify-center ${
            selected
              ? "bg-[#e9ddff] dark:bg-[#334155]"
              : "bg-[#f0f3ff] dark:bg-[#1E293B]"
          }`}
        >
          <Text className="text-3xl">📖</Text>
        </View>
      )}

      {/* Info strip */}
      <View className="flex-1 justify-center bg-white dark:bg-[#1E293B] px-2 py-1.5">
        <Text
          className="font-bold text-[#111c2d] text-[11px] dark:text-[#F8FAFC]"
          numberOfLines={1}
        >
          {book.title}
        </Text>
        <Text
          className="mt-0.5 text-[#494454] text-[10px] dark:text-[#94A3B8]"
          numberOfLines={1}
        >
          {book.author}
        </Text>
      </View>

      {/* Check badge */}
      {selected && (
        <View className="top-2 right-2 absolute justify-center items-center bg-[#6b38d4] dark:bg-[#A78BFA] rounded-full w-7 h-7">
          <Feather name="check" size={14} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

export function AddSagaModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(
    new Set(),
  );
  const [saving, setSaving] = useState(false);

  const { data: allBooks } = useQuery({
    queryKey: ["books", "all"],
    queryFn: () => getAllBooks(),
  });
  const books: BookDTO[] = Array.isArray(allBooks) ? allBooks : [];

  const toggleBook = (id: string) => {
    const next = new Set(selectedBookIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedBookIds(next);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const mime = asset.mimeType ?? "";
      if (
        mime === "image/svg+xml" ||
        asset.uri?.toLowerCase().endsWith(".svg")
      ) {
        Alert.alert("Format not supported", "SVG files are not allowed.");
        return;
      }
      setCoverUri(asset.uri);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCoverUri(null);
    setSelectedBookIds(new Set());
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Saga name is required.");
      return;
    }

    setSaving(true);
    try {
      let finalCoverUrl: string | undefined;
      if (coverUri) {
        finalCoverUrl = await persistLibraryImage(coverUri);
      }

      const saga = await createSaga({
        name: name.trim(),
        description: description.trim() || undefined,
        coverUrl: finalCoverUrl,
      });

      // Add selected books to saga
      for (const bookId of selectedBookIds) {
        await addBookToSaga(saga.id, bookId);
      }

      await queryClient.invalidateQueries({ queryKey: ["sagas"] });
      handleClose();
    } catch (err: unknown) {
      showApiError("Failed to create saga", err);
    } finally {
      setSaving(false);
    }
  };

  const closeIconColor = mode === "dark" ? "#94A3B8" : "#494454";
  const placeholderColor = mode === "dark" ? "#475569" : "#94A3B8";
  const iconColor = mode === "dark" ? "#A78BFA" : "#6b38d4";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}>
        <Pressable style={{ flex: 1 }} onPress={handleClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{
            height: SHEET_HEIGHT,
            backgroundColor: mode === "dark" ? "#0F172A" : "#FFFFFF",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 24,
          }}
        >
          {/* Drag handle decoration */}
          <View className="self-center bg-[#cbc3d7]/30 dark:bg-[#334155] mt-3 mb-1 rounded-full w-12 h-1.5" />

          {/* Header */}
          <View className="flex-row justify-between items-center px-6 py-4 border-[#cbc3d7]/10 dark:border-[#334155]/20 border-b">
            <View>
              <Text className="font-bold text-[#111c2d] dark:text-[#F8FAFC] text-2xl">
                Create New Saga
              </Text>
              <Text className="mt-0.5 text-[#494454] dark:text-[#94A3B8] text-xs">
                Group your epic collections
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              className="justify-center items-center bg-[#f0f3ff] dark:bg-[#1E293B] rounded-full w-10 h-10"
            >
              <Feather name="x" size={20} color={closeIconColor} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: insets.bottom + 40,
            }}
            keyboardShouldPersistTaps="handled"
            className="flex-1"
          >
            {/* Cover image picker */}
            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.85}
              className="justify-center items-center bg-[#e9ddff]/20 dark:bg-[#1E293B] mt-6 mb-6 border border-[#6b38d4]/30 dark:border-[#A78BFA]/20 border-dashed rounded-2xl w-full overflow-hidden"
              style={{ aspectRatio: 16 / 9 }}
            >
              {coverUri ? (
                <>
                  <Image
                    source={{ uri: coverUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 justify-center items-center bg-black/30">
                    <Feather name="camera" size={24} color="#fff" />
                    <Text className="mt-2 font-bold text-white text-xs uppercase tracking-widest">
                      Change Cover
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Feather name="camera" size={28} color={iconColor} />
                  <Text className="mt-2 font-bold text-[#6b38d4] text-[11px] dark:text-[#A78BFA] uppercase tracking-widest">
                    Upload Cover Image
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Name */}
            <View className="mb-5">
              <Text className="mb-2 font-bold text-[#494454] text-[10px] dark:text-[#94A3B8] uppercase tracking-widest">
                Saga Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. The Lord of the Rings"
                placeholderTextColor={placeholderColor}
                className="bg-[#f0f3ff] dark:bg-[#1E293B] px-4 py-4 rounded-xl text-[#111c2d] text-[15px] dark:text-[#F8FAFC]"
                autoCapitalize="words"
              />
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="mb-2 font-bold text-[#494454] text-[10px] dark:text-[#94A3B8] uppercase tracking-widest">
                Description (optional)
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Talk about this saga..."
                placeholderTextColor={placeholderColor}
                className="bg-[#f0f3ff] dark:bg-[#1E293B] px-4 py-4 rounded-xl text-[#111c2d] text-[15px] dark:text-[#F8FAFC]"
                multiline
                textAlignVertical="top"
                style={{ height: 80 }}
              />
            </View>

            {/* Book Selection */}
            <View className="mb-8">
              <Text className="mb-3 font-bold text-[#494454] text-[10px] dark:text-[#94A3B8] uppercase tracking-widest">
                Select Books ({selectedBookIds.size})
              </Text>
              {books.length > 0 ? (
                <View
                  className="flex-row flex-wrap"
                  style={{ marginHorizontal: -6 }}
                >
                  {books.map((book) => (
                    <View key={book.id} className="p-1.5 w-1/3">
                      <BookSelectCard
                        book={book}
                        selected={selectedBookIds.has(book.id!)}
                        onToggle={() => toggleBook(book.id!)}
                        mode={mode}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <View className="justify-center items-center bg-[#f0f3ff] dark:bg-[#1E293B] py-8 border border-[#cbc3d7] dark:border-[#334155] border-dashed rounded-2xl">
                  <Text className="text-[#494454] dark:text-[#94A3B8] text-sm">
                    No books found in your library yet.
                  </Text>
                </View>
              )}
            </View>

            {/* CTA */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={saving}
              className="justify-center items-center bg-[#6b38d4] dark:bg-[#8455ef] rounded-2xl w-full h-14"
              style={{
                shadowColor: "#6b38d4",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="font-bold text-white text-base tracking-wide">
                  Create Saga
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
