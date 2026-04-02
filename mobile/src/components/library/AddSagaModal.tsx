import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Animated as RNAnimated,
  PanResponder,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQueryClient, useQuery } from "@tanstack/react-query";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { createSaga, addBookToSaga } from "@/src/services/sagaService";
import { getAllBooks } from "@/src/services/bookService";
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

  const sheetY = useRef(new RNAnimated.Value(SHEET_HEIGHT)).current;
  const overlayAnim = useRef(new RNAnimated.Value(0)).current;

  const { data: allBooks } = useQuery({
    queryKey: ["books", "all"],
    queryFn: getAllBooks,
  });
  const books: BookDTO[] = Array.isArray(allBooks) ? allBooks : [];

  useEffect(() => {
    if (visible) {
      RNAnimated.parallel([
        RNAnimated.spring(sheetY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 200,
        }),
        RNAnimated.timing(overlayAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      RNAnimated.parallel([
        RNAnimated.timing(sheetY, {
          toValue: SHEET_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        RNAnimated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 0,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) sheetY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 100 || gs.vy > 1) {
          onClose();
        } else {
          RNAnimated.spring(sheetY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 200,
          }).start();
        }
      },
    })
  ).current;

  const resetForm = () => {
    setName("");
    setDescription("");
    setSelectedBookIds(new Set());
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleBook = (id: string) => {
    setSelectedBookIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    if (trimmedName.length < 3) {
      Alert.alert("Error", "Saga name must be at least 3 characters.");
      return;
    }
    if (trimmedDesc.length < 3) {
      Alert.alert("Error", "Description must be at least 3 characters.");
      return;
    }

    setSaving(true);
    try {
      const saga = await createSaga({
        name: trimmedName,
        description: trimmedDesc,
      });

      // Attach selected books sequentially
      for (const bookId of selectedBookIds) {
        await addBookToSaga(saga.id, bookId);
      }

      await queryClient.invalidateQueries({ queryKey: ["sagas"] });
      resetForm();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create saga. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  const placeholderColor = mode === "dark" ? "#475569" : "#94A3B8";
  const closeIconColor = mode === "dark" ? "#94A3B8" : "#494454";
  const selectedCount = selectedBookIds.size;

  // Input style: saga modal uses white/light inputs per design system
  const inputClass =
    "bg-white dark:bg-[#1E293B] rounded-2xl px-5 py-4 text-[15px] text-[#111c2d] dark:text-[#F8FAFC] border border-[#E2E8F0]/80 dark:border-[#334155]";

  return (
    <View
      style={{ ...StyleSheet.absoluteFillObject, zIndex: 999 }}
      pointerEvents={visible ? "auto" : "none"}
    >
      {/* Backdrop */}
      <RNAnimated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.65)",
          opacity: overlayAnim,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={handleClose} />
      </RNAnimated.View>

      {/* Sheet */}
      <RNAnimated.View
        className="absolute bottom-0 left-0 right-0 bg-[#f9f9ff] dark:bg-[#0F172A] overflow-hidden"
        style={{
          height: SHEET_HEIGHT,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          transform: [{ translateY: sheetY }],
        }}
      >
        {/* Drag handle */}
        <View
          className="items-center pt-4 pb-2"
          {...panResponder.panHandlers}
        >
          <View className="w-12 h-1.5 rounded-full bg-[#cbc3d7]/40 dark:bg-[#475569]/50" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 32,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="flex-row justify-between items-center pt-3 pb-6">
            <Text className="text-[24px] font-extrabold text-[#111c2d] dark:text-[#F8FAFC] tracking-[-0.5px]">
              Create New Saga
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              className="w-10 h-10 rounded-full bg-[#f0f3ff] dark:bg-[#1E293B] items-center justify-center"
            >
              <Feather name="x" size={18} color={closeIconColor} />
            </TouchableOpacity>
          </View>

          {/* Saga name */}
          <View className="mb-5">
            <Text className="text-[10px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest mb-2">
              Saga Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. The Chronicles of Aethelgard"
              placeholderTextColor={placeholderColor}
              className={inputClass}
              autoCapitalize="words"
              maxLength={50}
            />
          </View>

          {/* Description */}
          <View className="mb-8">
            <Text className="text-[10px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest mb-2">
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Define the scope and theme of this literary journey…"
              placeholderTextColor={placeholderColor}
              className={inputClass}
              multiline
              textAlignVertical="top"
              style={{ height: 110 }}
            />
          </View>

          {/* Select books header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[10px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest">
              Select Books
            </Text>
            {selectedCount > 0 && (
              <Text className="text-[10px] font-bold text-[#6b38d4] dark:text-[#A78BFA] uppercase tracking-wider">
                {selectedCount} {selectedCount === 1 ? "book" : "books"} selected
              </Text>
            )}
          </View>

          {/* Book grid */}
          {books.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-sm text-[#494454] dark:text-[#94A3B8] text-center">
                No books in your library yet.{"\n"}Add books first to include them in a saga.
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-3 mb-8">
              {books.map((book) => (
                <View key={book.id} className="w-[48%]">
                  <BookSelectCard
                    book={book}
                    selected={selectedBookIds.has(book.id)}
                    onToggle={() => toggleBook(book.id)}
                    mode={mode}
                  />
                </View>
              ))}
            </View>
          )}

          {/* CTA */}
          <Pressable
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
          </Pressable>
        </ScrollView>
      </RNAnimated.View>
    </View>
  );
}
