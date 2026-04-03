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
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { useQueryClient, useQuery } from "@tanstack/react-query";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { createBook } from "@/src/services/bookService";
import { getCategories, createCategory } from "@/src/services/categoryService";
import { showApiError } from "@/src/services/apiError";
import { persistLibraryImage } from "@/src/utils/media";
import type { BookStatus } from "@/src/types/book";

function randomHexColor(): string {
  const hex = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
  return `#${hex.toUpperCase()}`;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.92;

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: "TO_READ", label: "To Read" },
  { value: "READING", label: "Reading" },
  { value: "COMPLETED", label: "Done" },
  { value: "DROPPED", label: "Dropped" },
];

export function AddBookModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");
  const [status, setStatus] = useState<BookStatus>("TO_READ");
  const [categoryInput, setCategoryInput] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isbn, setIsbn] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const filteredCategories = categoryInput.trim().length > 0
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(categoryInput.toLowerCase())
      )
    : categories;

  const isNewCategory = selectedCategoryId === null && categoryInput.trim().length > 0;

  const resetForm = () => {
    setCoverUri(null);
    setTitle("");
    setAuthor("");
    setPages("");
    setStatus("TO_READ");
    setCategoryInput("");
    setSelectedCategoryId(null);
    setShowSuggestions(false);
    setIsbn("");
    setRating(null);
    setNotes("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const pickImage = async () => {
    const { status: permStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permStatus !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library to upload a cover.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const mime = asset.mimeType ?? "";
      const uri = asset.uri ?? "";
      if (mime === "image/svg+xml" || uri.toLowerCase().endsWith(".svg")) {
        Alert.alert(
          "Format not supported",
          "SVG files are not supported. Please choose a JPEG, PNG, WEBP, or other photo format.",
        );
        return;
      }
      setCoverUri(uri);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Book title is required.");
      return;
    }
    if (!author.trim()) {
      Alert.alert("Error", "Author is required.");
      return;
    }
    const pagesNum = parseInt(pages, 10);
    if (!pages || isNaN(pagesNum) || pagesNum < 1) {
      Alert.alert("Error", "Enter a valid page count (min 1).");
      return;
    }
    if (!categoryInput.trim()) {
      Alert.alert("Error", "Category is required.");
      return;
    }
    const isbnClear = isbn.trim();
    if (!isbnClear) {
      Alert.alert("Error", "ISBN is required.");
      return;
    }
    const isbnRegex = /^(97[89])?\d{9}[\dX]$/i;
    if (!isbnRegex.test(isbnClear)) {
      Alert.alert(
        "Error",
        "Please enter a valid ISBN-10 or ISBN-13 (must start with 978 or 979).",
      );
      return;
    }

    setSaving(true);
    try {
      let catId: string;
      if (selectedCategoryId) {
        catId = selectedCategoryId;
      } else {
        const newCat = await createCategory({
          name: categoryInput.trim(),
          color: randomHexColor(),
        });
        catId = newCat.id;
        await queryClient.invalidateQueries({ queryKey: ["categories"] });
      }

      let finalCoverUrl = undefined;
      if (coverUri) {
        finalCoverUrl = await persistLibraryImage(coverUri);
      }

      await createBook({
        title: title.trim(),
        author: author.trim(),
        pages: pagesNum,
        isbn: isbnClear,
        categoryId: catId,
        status,
        rating: rating ?? undefined,
        notes: notes.trim() || undefined,
        coverUrl: finalCoverUrl,
      });
      await queryClient.invalidateQueries({ queryKey: ["books"] });
      resetForm();
      onClose();
    } catch (err: unknown) {
      showApiError("Failed to add book", err);
    } finally {
      setSaving(false);
    }
  };

  const iconColor = mode === "dark" ? "#A78BFA" : "#6b38d4";
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
                Add New Book
              </Text>
              <Text className="mt-0.5 text-[#494454] dark:text-[#94A3B8] text-xs">
                Build your personal universe
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
              className="justify-center items-center bg-[#e9ddff]/30 dark:bg-[#1E293B] mt-6 mb-8 rounded-2xl w-full h-44 overflow-hidden"
            >
              {coverUri ? (
                <>
                  <Image
                    source={{ uri: coverUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 justify-center items-center bg-black/30">
                    <Feather name="camera" size={28} color="#fff" />
                    <Text className="mt-2 font-bold text-white text-xs uppercase tracking-widest">
                      Change Cover
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Feather name="camera" size={32} color={iconColor} />
                  <Text className="mt-3 font-bold text-[#6b38d4] text-[11px] dark:text-[#A78BFA] uppercase tracking-widest">
                    Upload Cover Image
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Title */}
            <View className="mb-5">
              <Text className="mb-2 font-bold text-[#494454] text-[10px] dark:text-[#94A3B8] uppercase tracking-widest">
                Book Title
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. The Secret History"
                placeholderTextColor={placeholderColor}
                className="bg-[#f0f3ff] dark:bg-[#1E293B] px-4 py-4 rounded-xl text-[#111c2d] text-[15px] dark:text-[#F8FAFC]"
                autoCapitalize="words"
              />
            </View>

            {/* Author */}
            <View className="mb-5">
              <Text className="mb-2 font-bold text-[#494454] text-[10px] dark:text-[#94A3B8] uppercase tracking-widest">
                Author
              </Text>
              <TextInput
                value={author}
                onChangeText={setAuthor}
                placeholder="e.g. Donna Tartt"
                placeholderTextColor={placeholderColor}
                className="bg-[#f0f3ff] dark:bg-[#1E293B] px-4 py-4 rounded-xl text-[#111c2d] text-[15px] dark:text-[#F8FAFC]"
                autoCapitalize="words"
              />
            </View>

            {/* Pages row */}
            <View className="flex-row gap-4 mb-5">
              <View className="flex-1">
                <Text className="mb-2 font-bold text-[#494454] text-[10px] dark:text-[#94A3B8] uppercase tracking-widest">
                  Total Pages
                </Text>
                <TextInput
                  value={pages}
                  onChangeText={(t) => setPages(t.replace(/[^0-9]/g, ""))}
                  placeholder="559"
                  placeholderTextColor={placeholderColor}
                  className="bg-[#f0f3ff] dark:bg-[#1E293B] px-4 py-4 rounded-xl text-[#111c2d] text-[15px] dark:text-[#F8FAFC]"
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className="mb-2 font-bold text-[#494454] text-[10px] dark:text-[#94A3B8] uppercase tracking-widest">
                  ISBN
                </Text>
                <TextInput
                  value={isbn}
                  onChangeText={(t) => setIsbn(t.replace(/[^0-9X]/gi, ""))}
                  placeholder="9780525559474"
                  placeholderTextColor={placeholderColor}
                  className="bg-[#f0f3ff] dark:bg-[#1E293B] px-4 py-4 rounded-xl text-[#111c2d] text-[15px] dark:text-[#F8FAFC]"
                  keyboardType="numeric"
                  maxLength={13}
                />
              </View>
            </View>

            {/* Category */}
            <View className="mb-5">
              <Text className="mb-2 font-bold text-[#494454] text-[10px] dark:text-[#94A3B8] uppercase tracking-widest">
                Category
              </Text>
              <TextInput
                value={categoryInput}
                onChangeText={(t) => {
                  setCategoryInput(t);
                  setSelectedCategoryId(null);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="e.g. Fiction, Mystery, Sci-Fi"
                placeholderTextColor={placeholderColor}
                autoCapitalize="words"
                className="bg-[#f0f3ff] dark:bg-[#1E293B] px-4 py-4 rounded-xl text-[#111c2d] text-[15px] dark:text-[#F8FAFC]"
                style={{
                  borderWidth: 1.5,
                  borderColor: selectedCategoryId
                    ? (mode === "dark" ? "#A78BFA" : "#6b38d4")
                    : mode === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(107, 56, 212, 0.08)",
                }}
              />

              {showSuggestions && filteredCategories.length > 0 && (
                <View
                  className="bg-white dark:bg-[#1E293B] rounded-xl mt-1 overflow-hidden"
                  style={{ borderWidth: 1, borderColor: mode === "dark" ? "#334155" : "#E2E8F0" }}
                >
                  {filteredCategories.slice(0, 6).map((cat, i) => (
                    <Pressable
                      key={cat.id}
                      onPress={() => {
                        setCategoryInput(cat.name);
                        setSelectedCategoryId(cat.id);
                        setShowSuggestions(false);
                      }}
                      className={`flex-row items-center px-4 py-3 gap-3 ${
                        i < Math.min(filteredCategories.length, 6) - 1
                          ? "border-b border-[#E2E8F0] dark:border-[#334155]"
                          : ""
                      }`}
                    >
                      {cat.color ? (
                        <View
                          style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: cat.color }}
                        />
                      ) : null}
                      <Text className="text-[14px] text-[#111c2d] dark:text-[#F8FAFC]">
                        {cat.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {isNewCategory && (
                <View className="flex-row items-center gap-1.5 mt-2">
                  <Feather name="plus-circle" size={13} color="#10b981" />
                  <Text className="text-[12px] font-semibold text-[#10b981]">New category</Text>
                </View>
              )}
            </View>

            {/* Status */}
            <View className="mb-5">
              <Text className="mb-3 font-bold text-[#494454] text-[10px] dark:text-[#94A3B8] uppercase tracking-widest">
                Status
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setStatus(opt.value)}
                    className={`rounded-full px-4 py-2 ${
                      status === opt.value
                        ? "bg-[#6b38d4] dark:bg-[#A78BFA]"
                        : "bg-[#f0f3ff] dark:bg-[#1E293B] border border-[#cbc3d7]/40 dark:border-[#334155]"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        status === opt.value
                          ? "text-white"
                          : "text-[#494454] dark:text-[#94A3B8]"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Rating */}
            <View className="mb-5">
              <Text className="mb-3 font-bold text-[#494454] text-[10px] dark:text-[#94A3B8] uppercase tracking-widest">
                Rating (optional)
              </Text>
              <View className="flex-row gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setRating(rating === star ? null : star)}
                    hitSlop={4}
                  >
                    <Feather
                      name="star"
                      size={30}
                      color={
                        rating !== null && star <= rating
                          ? "#f59e0b"
                          : mode === "dark"
                            ? "#334155"
                            : "#e2e8f0"
                      }
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View className="mb-8">
              <Text className="mb-2 font-bold text-[#494454] text-[10px] dark:text-[#94A3B8] uppercase tracking-widest">
                Notes (optional)
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Your thoughts, quotes, impressions…"
                placeholderTextColor={placeholderColor}
                className="bg-[#f0f3ff] dark:bg-[#1E293B] px-4 py-4 rounded-xl text-[#111c2d] text-[15px] dark:text-[#F8FAFC]"
                multiline
                textAlignVertical="top"
                style={{ height: 96 }}
                maxLength={1000}
              />
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
                  Add Book to Sanctuary
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
