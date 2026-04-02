import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
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

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { createSaga, addBookToSaga } from "@/src/services/sagaService";
import { getAllBooks } from "@/src/services/bookService";
import { showApiError } from "@/src/services/apiError";
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
      <View className="flex-1 bg-white dark:bg-[#1E293B] px-2 py-1.5 justify-center">
        <Text
          className="text-[11px] font-bold text-[#111c2d] dark:text-[#F8FAFC]"
          numberOfLines={1}
        >
          {book.title}
        </Text>
        <Text
          className="text-[10px] text-[#494454] dark:text-[#94A3B8] mt-0.5"
          numberOfLines={1}
        >
          {book.author}
        </Text>
      </View>

      {/* Check badge */}
      {selected && (
        <View className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#6b38d4] dark:bg-[#A78BFA] items-center justify-center">
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
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(
    new Set()
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

  const resetForm = () => {
    setName("");
    setDescription("");
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
      const saga = await createSaga({
        name: name.trim(),
        description: description.trim() || undefined,
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}>
        <Pressable
          style={{ flex: 1 }}
          onPress={handleClose}
        />

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
          <View className="w-12 h-1.5 bg-[#cbc3d7]/30 dark:bg-[#334155] rounded-full self-center mt-3 mb-1" />

          {/* Header */}
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-[#cbc3d7]/10 dark:border-[#334155]/20">
            <View>
              <Text className="text-2xl font-bold text-[#111c2d] dark:text-[#F8FAFC]">
                Create New Saga
              </Text>
              <Text className="text-xs text-[#494454] dark:text-[#94A3B8] mt-0.5">
                Group your epic collections
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              className="w-10 h-10 rounded-full bg-[#f0f3ff] dark:bg-[#1E293B] items-center justify-center"
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
            {/* Name */}
            <View className="mt-6 mb-5">
              <Text className="text-[10px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest mb-2">
                Saga Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. The Lord of the Rings"
                placeholderTextColor={placeholderColor}
                className="bg-[#f0f3ff] dark:bg-[#1E293B] rounded-xl px-4 py-4 text-[15px] text-[#111c2d] dark:text-[#F8FAFC]"
                autoCapitalize="words"
              />
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-[10px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest mb-2">
                Description (optional)
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Talk about this saga..."
                placeholderTextColor={placeholderColor}
                className="bg-[#f0f3ff] dark:bg-[#1E293B] rounded-xl px-4 py-4 text-[15px] text-[#111c2d] dark:text-[#F8FAFC]"
                multiline
                textAlignVertical="top"
                style={{ height: 80 }}
              />
            </View>

            {/* Book Selection */}
            <View className="mb-8">
              <Text className="text-[10px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest mb-3">
                Select Books ({selectedBookIds.size})
              </Text>
              {books.length > 0 ? (
                <View className="flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
                  {books.map((book) => (
                    <View key={book.id} className="w-1/3 p-1.5">
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
                <View className="py-8 items-center justify-center bg-[#f0f3ff] dark:bg-[#1E293B] rounded-2xl border border-dashed border-[#cbc3d7] dark:border-[#334155]">
                  <Text className="text-sm text-[#494454] dark:text-[#94A3B8]">
                    No books found in your library yet.
                  </Text>
                </View>
              )}
            </View>

            {/* CTA */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={saving}
              className="w-full h-14 rounded-2xl items-center justify-center bg-[#6b38d4] dark:bg-[#8455ef]"
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
                <Text className="text-base font-bold text-white tracking-wide">
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
