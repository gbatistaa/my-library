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
import Animated, { useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter, Stack } from "expo-router";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { createSaga, addBookToSaga } from "@/src/services/sagaService";
import { getAllBooks } from "@/src/services/bookService";
import { showApiError } from "@/src/services/apiError";
import { persistLibraryImage } from "@/src/utils/media";
import type { BookDTO } from "@/src/types/book";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

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
  const inactiveBorder = mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(107, 56, 212, 0.08)";

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(focused ? purple : inactiveBorder, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    }),
  }), [focused, purple, inactiveBorder]);

  return (
    <AnimatedTextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={placeholderColor}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`${className} bg-[#f0f3ff] dark:bg-[#1E293B] rounded-xl px-4 py-4 text-[15px] text-[#111c2d] dark:text-[#F8FAFC]`}
      style={[
        { borderWidth: 1.5 },
        animatedBorderStyle,
        style,
      ]}
      {...props}
    />
  );
}

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
  return (
    <View className="mb-5">
      <Text className="text-[10px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest mb-2">
        {label}
      </Text>
      <TextInputFocusable
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderColor={placeholderColor}
        mode={mode}
        className={className}
        {...props}
      />
    </View>
  );
}

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

export default function AddSagaScreen() {
  const { mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [coverUri, setCoverUri] = useState<string | null>(null);
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
      aspect: [16, 9],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const mime = asset.mimeType ?? "";
      const uri = asset.uri ?? "";
      if (mime === "image/svg+xml" || uri.toLowerCase().endsWith(".svg")) {
        Alert.alert(
          "Format not supported",
          "SVG files are not supported. Please choose a JPEG, PNG, WEBP, or other photo format."
        );
        return;
      }
      setCoverUri(uri);
    }
  };

  const toggleBook = (id: string) => {
    const next = new Set(selectedBookIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedBookIds(next);
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

      if (!saga.id) throw new Error("Failed to retrieve saga ID");

      // Add selected books to saga
      for (const bookId of selectedBookIds) {
        await addBookToSaga(saga.id, bookId);
      }

      await queryClient.invalidateQueries({ queryKey: ["sagas"] });
      router.back();
    } catch (err: unknown) {
      showApiError("Failed to create saga", err);
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
          headerShown: false,
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
                Create new saga
              </Text>
              <Text className="text-sm text-[#494454] dark:text-[#94A3B8] mt-1">
                Group your epic collections
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
            className="w-full rounded-2xl overflow-hidden items-center justify-center mt-6 mb-6 bg-[#e9ddff]/30 dark:bg-[#1E293B]"
            style={{ 
              aspectRatio: 16 / 9,
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

          {/* Name */}
          <FormInput
            label="Saga Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. The Lord of the Rings"
            placeholderColor={placeholderColor}
            mode={mode}
            autoCapitalize="words"
          />

          {/* Description */}
          <View className="mb-6">
            <Text className="text-[10px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest mb-2">
              Description (optional)
            </Text>
            <TextInputFocusable
              value={description}
              onChangeText={setDescription}
              placeholder="Talk about this saga..."
              placeholderColor={placeholderColor}
              mode={mode}
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
                Create Saga
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
