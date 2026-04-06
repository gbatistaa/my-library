import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  type TextInputProps,
} from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter, Stack } from "expo-router";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { createReadingGoal, getBookAuthors } from "@/src/services/profileService";
import { getCategories } from "@/src/services/categoryService";
import { showApiError } from "@/src/services/apiError";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

function FormInput({
  label,
  hint,
  value,
  onChangeText,
  placeholder,
  placeholderColor,
  mode,
  tertiaryColor,
  ...props
}: {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  placeholderColor: string;
  mode: "light" | "dark";
  tertiaryColor: string;
} & TextInputProps) {
  const [focused, setFocused] = useState(false);
  const inactiveBorder =
    mode === "dark"
      ? "rgba(255,255,255,0.08)"
      : "rgba(79, 70, 229, 0.08)";

  const animatedBorderStyle = useAnimatedStyle(
    () => ({
      borderColor: withTiming(focused ? tertiaryColor : inactiveBorder, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      }),
    }),
    [focused, tertiaryColor, inactiveBorder],
  );

  return (
    <View className="mb-5">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-[10px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest">
          {label}
        </Text>
        {hint ? (
          <Text className="text-[10px] text-[#94A3B8]">{hint}</Text>
        ) : null}
      </View>
      <AnimatedTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="bg-[#f0f3ff] dark:bg-slate-900 rounded-xl px-4 py-4 text-[15px] text-[#111c2d] dark:text-[#F8FAFC]"
        style={[{ borderWidth: 1.5 }, animatedBorderStyle]}
        {...props}
      />
    </View>
  );
}

export default function CreateGoalScreen() {
  const { mode, colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [year, setYear] = useState(CURRENT_YEAR);
  const [targetBooks, setTargetBooks] = useState("");
  const [targetPages, setTargetPages] = useState("");
  const [targetMinutes, setTargetMinutes] = useState("");
  const [targetAuthors, setTargetAuthors] = useState("");
  const [targetGenres, setTargetGenres] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [saving, setSaving] = useState(false);

  const { data: authors = [] } = useQuery({
    queryKey: ["bookAuthors"],
    queryFn: getBookAuthors,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const tertiaryColor = colors.tertiary;
  const placeholderColor = mode === "dark" ? "#475569" : "#94A3B8";

  const handleSubmit = async () => {
    const booksNum = parseInt(targetBooks, 10);
    if (!targetBooks || isNaN(booksNum) || booksNum < 1) {
      Alert.alert("Error", "Target books is required and must be at least 1.");
      return;
    }

    const toOptionalInt = (val: string) => {
      const n = parseInt(val, 10);
      return val.trim() && !isNaN(n) && n >= 1 ? n : undefined;
    };

    setSaving(true);
    try {
      await createReadingGoal({
        year,
        targetBooks: booksNum,
        targetPages: toOptionalInt(targetPages),
        targetMinutes: toOptionalInt(targetMinutes),
        targetAuthors: toOptionalInt(targetAuthors),
        targetGenres: toOptionalInt(targetGenres),
        visibility,
      });
      await queryClient.invalidateQueries({ queryKey: ["reading-goals"] });
      await queryClient.invalidateQueries({ queryKey: ["goalProgress"] });
      router.back();
    } catch (err: unknown) {
      showApiError("Failed to create goal", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <Stack.Screen options={{ headerShown: false }} />

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
          {/* Header */}
          <View className="flex-row justify-between items-center mt-6 mb-2">
            <View>
              <Text className="text-[28px] font-extrabold text-[#111c2d] dark:text-[#F8FAFC] tracking-[-0.5px]">
                New Reading Goal
              </Text>
              <Text className="text-sm text-[#494454] dark:text-[#94A3B8] mt-1">
                Set your targets for the year
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-[#f0f3ff] dark:bg-slate-900 items-center justify-center"
            >
              <Feather
                name="x"
                size={20}
                color={mode === "dark" ? "#94A3B8" : "#494454"}
              />
            </TouchableOpacity>
          </View>

          {/* Year selector */}
          <View className="mb-6 mt-6">
            <Text className="text-[10px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest mb-3">
              Year
            </Text>
            <View className="flex-row gap-3">
              {YEAR_OPTIONS.map((y) => {
                const active = y === year;
                return (
                  <Pressable
                    key={y}
                    onPress={() => setYear(y)}
                    className="flex-1 py-3 rounded-xl items-center"
                    style={{
                      backgroundColor: active
                        ? tertiaryColor
                        : mode === "dark"
                          ? "#0F172A"
                          : "#f0f3ff",
                      borderWidth: active ? 0 : 1.5,
                      borderColor: active
                        ? "transparent"
                        : mode === "dark"
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(177,14,107,0.08)",
                    }}
                  >
                    <Text
                      className="text-[15px] font-bold"
                      style={{
                        color: active
                          ? "#fff"
                          : mode === "dark"
                            ? "#94A3B8"
                            : "#494454",
                      }}
                    >
                      {y}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Target Books (required) */}
          <FormInput
            label="Target Books"
            hint="Required"
            value={targetBooks}
            onChangeText={(t) => setTargetBooks(t.replace(/[^0-9]/g, ""))}
            placeholder="e.g. 24"
            placeholderColor={placeholderColor}
            mode={mode}
            tertiaryColor={tertiaryColor}
            keyboardType="numeric"
          />

          {/* Target Pages */}
          <FormInput
            label="Target Pages"
            hint="Optional"
            value={targetPages}
            onChangeText={(t) => setTargetPages(t.replace(/[^0-9]/g, ""))}
            placeholder="e.g. 6000"
            placeholderColor={placeholderColor}
            mode={mode}
            tertiaryColor={tertiaryColor}
            keyboardType="numeric"
          />

          {/* Target Minutes */}
          <FormInput
            label="Target Minutes"
            hint="Optional"
            value={targetMinutes}
            onChangeText={(t) => setTargetMinutes(t.replace(/[^0-9]/g, ""))}
            placeholder="e.g. 1200"
            placeholderColor={placeholderColor}
            mode={mode}
            tertiaryColor={tertiaryColor}
            keyboardType="numeric"
          />

          {/* Target Authors */}
          <View className="mb-2">
            <FormInput
              label="Target Distinct Authors"
              hint="Optional"
              value={targetAuthors}
              onChangeText={(t) => setTargetAuthors(t.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 10"
              placeholderColor={placeholderColor}
              mode={mode}
              tertiaryColor={tertiaryColor}
              keyboardType="numeric"
            />
          </View>

          {/* Authors hint */}
          {authors.length > 0 && (
            <View className="mb-5 -mt-2">
              <Text className="text-[11px] text-[#94A3B8] mb-2">
                Authors you&apos;ve already read:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingRight: 8 }}
              >
                {authors.map((a) => (
                  <View
                    key={a.name}
                    className="flex-row items-center rounded-full px-3 py-1.5"
                    style={{
                      backgroundColor: tertiaryColor + "18",
                      borderWidth: 1,
                      borderColor: tertiaryColor + "40",
                    }}
                  >
                    <Text
                      className="text-[12px] font-semibold"
                      style={{ color: tertiaryColor }}
                    >
                      {a.name}
                    </Text>
                    <Text className="text-[11px] text-[#94A3B8] ml-1">
                      ({a.bookCount})
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Target Genres */}
          <View className="mb-2">
            <FormInput
              label="Target Distinct Genres"
              hint="Optional"
              value={targetGenres}
              onChangeText={(t) => setTargetGenres(t.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 5"
              placeholderColor={placeholderColor}
              mode={mode}
              tertiaryColor={tertiaryColor}
              keyboardType="numeric"
            />
          </View>

          {/* Categories hint */}
          {categories.length > 0 && (
            <View className="mb-5 -mt-2">
              <Text className="text-[11px] text-[#94A3B8] mb-2">
                Your genres / categories:
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {categories.map((cat) => (
                  <View
                    key={cat.id}
                    className="flex-row items-center rounded-full px-3 py-1.5"
                    style={{
                      backgroundColor: cat.color
                        ? cat.color + "26"
                        : tertiaryColor + "18",
                      borderWidth: 1,
                      borderColor: cat.color
                        ? cat.color + "80"
                        : tertiaryColor + "40",
                    }}
                  >
                    <Text
                      className="text-[12px] font-semibold"
                      style={{ color: cat.color ?? tertiaryColor }}
                    >
                      {cat.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Visibility */}
          <View className="mb-8">
            <Text className="text-[10px] font-bold text-[#494454] dark:text-[#94A3B8] uppercase tracking-widest mb-3">
              Visibility
            </Text>
            <View className="flex-row gap-3">
              {(["PRIVATE", "PUBLIC"] as const).map((opt) => {
                const active = visibility === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => setVisibility(opt)}
                    className="flex-1 py-3 rounded-xl items-center flex-row justify-center gap-2"
                    style={{
                      backgroundColor: active
                        ? tertiaryColor
                        : mode === "dark"
                          ? "#0F172A"
                          : "#f0f3ff",
                      borderWidth: active ? 0 : 1.5,
                      borderColor: active
                        ? "transparent"
                        : mode === "dark"
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(177,14,107,0.08)",
                    }}
                  >
                    <Feather
                      name={opt === "PRIVATE" ? "lock" : "globe"}
                      size={14}
                      color={
                        active
                          ? "#fff"
                          : mode === "dark"
                            ? "#94A3B8"
                            : "#494454"
                      }
                    />
                    <Text
                      className="text-[13px] font-bold"
                      style={{
                        color: active
                          ? "#fff"
                          : mode === "dark"
                            ? "#94A3B8"
                            : "#494454",
                      }}
                    >
                      {opt === "PRIVATE" ? "Private" : "Public"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={saving}
            className="w-full h-14 rounded-2xl items-center justify-center mb-12"
            style={{
              backgroundColor: tertiaryColor,
              shadowColor: tertiaryColor,
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
                Create Reading Goal
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
