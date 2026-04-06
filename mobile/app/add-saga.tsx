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
import Animated, { useAnimatedStyle, withTiming, Easing, FadeInDown, FadeIn } from "react-native-reanimated";
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
  const inactiveBorder = mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(15, 23, 42, 0.06)";

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(focused ? purple : inactiveBorder, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    }),
    backgroundColor: withTiming(focused 
      ? (mode === 'dark' ? '#1E293B' : '#F8FAFC') 
      : (mode === 'dark' ? '#0F172A' : '#F1F5F9'), 
    { duration: 200 }),
  }), [focused, purple, inactiveBorder, mode]);

  return (
    <AnimatedTextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={placeholderColor}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`${className} rounded-[20px] px-5 py-4 text-[15px] text-slate-900 dark:text-slate-50 font-medium shadow-sm`}
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
    <View className="mb-6">
      <Text className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2px] mb-2.5 ml-1">
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
      className={`aspect-[3/4.2] rounded-2xl overflow-hidden border-2 ${
        selected
          ? "border-violet-600 dark:border-violet-500 shadow-lg shadow-violet-500/20"
          : "border-slate-100 dark:border-slate-800"
      }`}
    >
      {/* Cover container */}
      <View className="w-full h-[70%] bg-slate-100 dark:bg-slate-900 items-center justify-center">
        {book.coverUrl ? (
          <Image
            source={{ uri: book.coverUrl }}
            className={`w-full h-full ${selected ? "opacity-100" : "opacity-60"}`}
            resizeMode="cover"
          />
        ) : (
          <Feather 
            name="book" 
            size={24} 
            color={selected ? (mode === 'dark' ? '#A78BFA' : '#6d28d9') : (mode === 'dark' ? '#334155' : '#CBD5E1')} 
          />
        )}
      </View>

      {/* Info strip */}
      <View className={`flex-1 px-2.5 py-2 justify-center ${selected ? 'bg-violet-50 dark:bg-violet-950/20' : 'bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800'}`}>
        <Text
          className={`text-[11px] font-bold ${selected ? 'text-violet-700 dark:text-violet-300' : 'text-slate-900 dark:text-slate-100'}`}
          numberOfLines={2}
        >
          {book.title}
        </Text>
      </View>

      {/* Check badge */}
      {selected && (
        <Animated.View 
          entering={FadeIn.duration(200)}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-violet-600 dark:bg-violet-500 items-center justify-center shadow-md shadow-violet-900/40"
        >
          <Feather name="check" size={12} color="#fff" strokeWidth={4} />
        </Animated.View>
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
      const uri = asset.uri ?? "";
      if (uri.toLowerCase().endsWith(".svg")) {
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

  const iconColor = mode === "dark" ? "#A78BFA" : "#6d28d9";
  const placeholderColor = mode === "dark" ? "#475569" : "#94A3B8";

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
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
          {/* Header */}
          <Animated.View 
            entering={FadeIn.duration(400)}
            className="flex-row justify-between items-center mt-10 mb-2"
            style={{ paddingTop: insets.top }}
          >
            <View className="flex-1 mr-4">
              <Text className="text-3xl font-black text-slate-950 dark:text-slate-50 tracking-tight">
                Create Saga
              </Text>
              <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Organize your book collection
              </Text>
            </View>
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 items-center justify-center active:scale-90"
            >
              <Feather
                name="x"
                size={20}
                color={mode === "dark" ? "#94A3B8" : "#475569"}
              />
            </Pressable>
          </Animated.View>

          {/* Cover image picker */}
          <Animated.View entering={FadeInDown.duration(500).delay(100)}>
            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.9}
              className="w-full rounded-[32px] overflow-hidden items-center justify-center mt-6 mb-8 bg-slate-50 dark:bg-slate-900 shadow-sm shadow-slate-200 dark:shadow-none"
              style={{ 
                aspectRatio: 16 / 9.5,
                borderWidth: coverUri ? 0 : 2,
                borderStyle: "dashed",
                borderColor: mode === "dark" ? "#334155" : "#E2E8F0",
              }}
            >
              {coverUri ? (
                <>
                  <Image
                    source={{ uri: coverUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 bg-slate-950/40 items-center justify-center">
                    <View className="bg-white/20 p-4 rounded-full border border-white/30">
                      <Feather name="camera" size={24} color="#fff" />
                    </View>
                    <Text className="text-[10px] font-black text-white uppercase tracking-[3px] mt-3">
                      Modify Cover
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View className="bg-violet-100 dark:bg-violet-950/40 p-5 rounded-3xl mb-4 border border-violet-200 dark:border-violet-900/30">
                    <Feather name="image" size={32} color={iconColor} />
                  </View>
                  <Text className="text-[11px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-[2px]">
                    Choose Cover Image
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Name */}
          <Animated.View entering={FadeInDown.duration(500).delay(200)}>
            <FormInput
              label="Collection Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Harry Potter"
              placeholderColor={placeholderColor}
              mode={mode}
              autoCapitalize="words"
            />
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeInDown.duration(500).delay(300)} className="mb-8">
            <Text className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2px] mb-2.5 ml-1">
              About this Saga
            </Text>
            <TextInputFocusable
              value={description}
              onChangeText={setDescription}
              placeholder="A brief overview..."
              placeholderColor={placeholderColor}
              mode={mode}
              multiline
              textAlignVertical="top"
              style={{ height: 100 }}
            />
          </Animated.View>

          {/* Book Selection */}
          <Animated.View entering={FadeInDown.duration(500).delay(400)} className="mb-10">
            <View className="flex-row items-center justify-between mb-4 px-1">
              <Text className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">
                Add Books ({selectedBookIds.size})
              </Text>
            </View>
            
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
              <View className="py-12 items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
                <Feather name="book-open" size={24} color={placeholderColor} />
                <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-3">
                  Your library is empty
                </Text>
              </View>
            )}
          </Animated.View>

          {/* CTA */}
          <Animated.View entering={FadeInDown.duration(500).delay(500)}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={saving}
              className="w-full h-16 rounded-[24px] items-center justify-center bg-violet-600 dark:bg-violet-600 mb-10 shadow-xl shadow-violet-600/30 active:scale-95"
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="flex-row items-center gap-3">
                  <Feather name="plus-circle" size={18} color="#fff" />
                  <Text className="text-base font-black text-white uppercase tracking-[1px]">
                    Create Saga
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
