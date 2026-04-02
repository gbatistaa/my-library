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
  KeyboardAvoidingView,
  Platform,
  type TextInputProps,
} from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, Stack } from "expo-router";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { createBook } from "@/src/services/bookService";
import { showApiError } from "@/src/services/apiError";
import { persistLibraryImage } from "@/src/utils/media";
import type { BookStatus } from "@/src/types/book";

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: "TO_READ", label: "To Read" },
  { value: "READING", label: "Reading" },
  { value: "COMPLETED", label: "Done" },
  { value: "DROPPED", label: "Dropped" },
];

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  placeholderColor,
  mode,
  className,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  placeholderColor: string;
  mode: "light" | "dark";
  className?: string;
} & TextInputProps) {
  const [focused, setFocused] = useState(false);
  const purple = mode === "dark" ? "#A78BFA" : "#6b38d4";
  
  return (
    <View className="mb-5">
      <Text className="text-[10px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest mb-2">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`${className} bg-[#f0f3ff] dark:bg-[#1E293B] rounded-xl px-4 py-4 text-[15px] text-[#111c2d] dark:text-[#F8FAFC]`}
        style={{
          borderWidth: 1.5,
          borderColor: focused 
            ? purple 
            : mode === "dark" 
              ? "rgba(255,255,255,0.08)" 
              : "rgba(107, 56, 212, 0.08)",
        }}
        {...props}
      />
    </View>
  );
}

function TextInputFocusable({
  value,
  onChangeText,
  placeholder,
  placeholderColor,
  mode,
  className,
  style,
  ...props
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  placeholderColor: string;
  mode: "light" | "dark";
  className?: string;
} & TextInputProps) {
  const [focused, setFocused] = useState(false);
  const purple = mode === "dark" ? "#A78BFA" : "#6b38d4";

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={placeholderColor}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`${className} bg-[#f0f3ff] dark:bg-[#1E293B] rounded-xl px-4 py-4 text-[15px] text-[#111c2d] dark:text-[#F8FAFC]`}
      style={[
        {
          borderWidth: 1.5,
          borderColor: focused
            ? purple
            : mode === "dark"
              ? "rgba(255,255,255,0.08)"
              : "rgba(107, 56, 212, 0.08)",
        },
        style,
      ]}
      {...props}
    />
  );
}

export default function AddBookScreen() {
  const { mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");
  const [pagesRead, setPagesRead] = useState("0");
  const [status, setStatus] = useState<BookStatus>("TO_READ");
  const [genre, setGenre] = useState("");
  const [isbn, setIsbn] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const { status: permStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permStatus !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library to upload a cover."
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
      if (
        mime === "image/svg+xml" ||
        uri.toLowerCase().endsWith(".svg")
      ) {
        Alert.alert(
          "Format not supported",
          "SVG files are not supported. Please choose a JPEG, PNG, WEBP, or other photo format."
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
    const pagesReadNum = parseInt(pagesRead, 10);
    if (isNaN(pagesReadNum) || pagesReadNum < 0) {
      Alert.alert("Error", "Pages read must be 0 or more.");
      return;
    }
    if (pagesReadNum > pagesNum) {
      Alert.alert("Error", "Pages read cannot exceed total pages.");
      return;
    }
    if (!genre.trim()) {
      Alert.alert("Error", "Genre is required.");
      return;
    }
    const isbnClear = isbn.trim();
    if (!isbnClear) {
      Alert.alert("Error", "ISBN is required.");
      return;
    }
    const isbnRegex = /^(97[89])?\d{9}[\dX]$/i;
    if (!isbnRegex.test(isbnClear)) {
      Alert.alert("Error", "Please enter a valid ISBN-10 or ISBN-13 (must start with 978 or 979).");
      return;
    }

    setSaving(true);
    try {
      let finalCoverUrl = undefined;
      if (coverUri) {
        finalCoverUrl = await persistLibraryImage(coverUri);
      }

      await createBook({
        title: title.trim(),
        author: author.trim(),
        pages: pagesNum,
        pagesRead: pagesReadNum,
        isbn: isbn.trim(),
        genre: genre.trim(),
        status,
        rating: rating ?? undefined,
        notes: notes.trim() || undefined,
        coverUrl: finalCoverUrl,
      });
      await queryClient.invalidateQueries({ queryKey: ["books"] });
      router.back();
    } catch (err: unknown) {
      showApiError("Failed to add book", err);
    } finally {
      setSaving(false);
    }
  };

  const iconColor = mode === "dark" ? "#A78BFA" : "#6b38d4";
  const placeholderColor = mode === "dark" ? "#475569" : "#94A3B8";

  return (
    <View className="flex-1 bg-white dark:bg-[#0F172A]">
      <Stack.Screen
        options={{
          headerShown: false, // Hiding it since we added a custom title inside ScrollView for better "page" feel
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 40,
          }}
          keyboardShouldPersistTaps="handled"
          className="flex-1"
        >
          {/* Header row with title and close button */}
          <View className="flex-row justify-between items-center mt-6 mb-2">
            <View>
              <Text className="text-[28px] font-extrabold text-[#111c2d] dark:text-[#F8FAFC] tracking-[-0.5px]">
                Add new book
              </Text>
              <Text className="text-sm text-[#494454] dark:text-[#94A3B8] mt-1">
                Fill the details below
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-[#f0f3ff] dark:bg-[#1E293B] items-center justify-center"
            >
              <Feather
                name="x"
                size={20}
                color={mode === "dark" ? "#94A3B8" : "#494454"}
              />
            </TouchableOpacity>
          </View>

          {/* Cover image picker */}
          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.85}
            className="w-full h-44 rounded-2xl overflow-hidden items-center justify-center mt-6 mb-8 bg-[#e9ddff]/30 dark:bg-[#1E293B]"
            style={{
              borderWidth: coverUri ? 0 : 2,
              borderStyle: "dashed",
              borderColor: mode === "dark" ? "#334155" : "#cbc3d7",
            }}
          >
            {coverUri ? (
              <>
                <Image
                  source={{ uri: coverUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/30 items-center justify-center">
                  <Feather name="camera" size={28} color="#fff" />
                  <Text className="text-xs font-bold text-white uppercase tracking-widest mt-2">
                    Change Cover
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Feather name="camera" size={32} color={iconColor} />
                <Text className="text-[11px] font-bold text-[#6b38d4] dark:text-[#A78BFA] uppercase tracking-widest mt-3">
                  Upload Cover Image
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Title */}
          <FormInput
            label="Book Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. The Secret History"
            placeholderColor={placeholderColor}
            mode={mode}
            autoCapitalize="words"
          />

          {/* Author */}
          <FormInput
            label="Author"
            value={author}
            onChangeText={setAuthor}
            placeholder="e.g. Donna Tartt"
            placeholderColor={placeholderColor}
            mode={mode}
            autoCapitalize="words"
          />

          {/* Pages row */}
          <View className="flex-row gap-4 mb-5">
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest mb-2">
                Total Pages
              </Text>
              <TextInputFocusable
                value={pages}
                onChangeText={(t: string) => setPages(t.replace(/[^0-9]/g, ""))}
                placeholder="559"
                placeholderColor={placeholderColor}
                mode={mode}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest mb-2">
                ISBN
              </Text>
              <TextInputFocusable
                value={isbn}
                onChangeText={(t: string) => setIsbn(t.replace(/[^0-9X]/gi, ""))}
                placeholder="9780525559474"
                placeholderColor={placeholderColor}
                mode={mode}
                keyboardType="numeric"
                maxLength={13}
              />
            </View>
          </View>

          {/* Pages Read */}
          <View className="mb-5">
            <Text className="text-[10px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest mb-2">
              Pages Read
            </Text>
            <TextInputFocusable
              value={pagesRead}
              onChangeText={(t: string) => setPagesRead(t.replace(/[^0-9]/g, ""))}
              placeholder="0"
              placeholderColor={placeholderColor}
              mode={mode}
              keyboardType="numeric"
            />
          </View>

          {/* Genre */}
          <FormInput
            label="Genre"
            value={genre}
            onChangeText={setGenre}
            placeholder="e.g. Fiction, Mystery, Sci-Fi"
            placeholderColor={placeholderColor}
            mode={mode}
            autoCapitalize="words"
          />

          {/* Status */}
          <View className="mb-5">
            <Text className="text-[10px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest mb-3">
              Status
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    setStatus(opt.value);
                    if (opt.value === "COMPLETED" && pages) setPagesRead(pages);
                  }}
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
            <Text className="text-[10px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest mb-3">
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
            <Text className="text-[10px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest mb-2">
              Notes (optional)
            </Text>
            <TextInputFocusable
              value={notes}
              onChangeText={setNotes}
              placeholder="Your thoughts, quotes, impressions…"
              placeholderColor={placeholderColor}
              mode={mode}
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
            className="w-full h-14 rounded-2xl items-center justify-center bg-[#6b38d4] dark:bg-[#8455ef] mb-12"
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
                Add Book to Sanctuary
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
