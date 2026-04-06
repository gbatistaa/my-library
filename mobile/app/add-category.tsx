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
  Keyboard,
  Dimensions,
  Platform,
  StyleSheet,
  Animated as RNAnimated,
  type TextInputProps,
} from "react-native";
import ColorPicker, {
  HueSlider,
  Panel1,
  InputWidget,
  type ColorFormatsObject,
} from "reanimated-color-picker";
import { useState, useCallback, useEffect, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, Stack } from "expo-router";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { createCategory } from "@/src/services/categoryService";
import { showApiError } from "@/src/services/apiError";

/* ─── Constants ─── */

const PRESET_COLORS = [
  "#A78BFA",
  "#60A5FA",
  "#34D399",
  "#FBBF24",
  "#F87171",
  "#F472B6",
  "#38BDF8",
  "#FB923C",
  "#818CF8",
  "#2DD4BF",
  "#E879F9",
  "#FCD34D",
  "#4ADE80",
];

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

/* ─── Shared input sub-components ─── */

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  placeholderColor,
  mode,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  placeholderColor: string;
  mode: "light" | "dark";
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
    <View className="mb-5">
      <Text className="mb-2 font-bold text-[#494454] text-[10px] dark:text-slate-400 uppercase tracking-widest">
        {label}
      </Text>
      <AnimatedTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="bg-[#f0f3ff] dark:bg-slate-900 px-4 py-4 rounded-2xl text-[#111c2d] text-[15px] dark:text-white"
        style={[
          { borderWidth: 1.5 },
          animatedBorderStyle,
        ]}
        {...props}
      />
    </View>
  );
}

/* ─── Main screen ─── */

export default function AddCategoryScreen() {
  const { mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const router = useRouter();

  const SWATCH_SIZE = 36; // Same size as preview circle in custom hex input

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [customHex, setCustomHex] = useState("");
  const [descFocused, setDescFocused] = useState(false);
  const [hexFocused, setHexFocused] = useState(false);
  const [saving, setSaving] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  const PICKER_SHEET_HEIGHT = 540;
  const screenHeight = Dimensions.get("window").height;
  // height drives everything — no translateY. useNativeDriver: false (layout property).
  const colorHeightAnim = useRef(new RNAnimated.Value(0)).current;
  const colorOpacityAnim = useRef(new RNAnimated.Value(0)).current;
  const colorOverlayAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (colorPickerVisible) {
      Keyboard.dismiss();
      RNAnimated.parallel([
        RNAnimated.timing(colorHeightAnim, {
          toValue: PICKER_SHEET_HEIGHT,
          duration: 320,
          useNativeDriver: false,
        }),
        RNAnimated.timing(colorOpacityAnim, {
          toValue: 1,
          duration: 320,
          useNativeDriver: false,
        }),
        RNAnimated.timing(colorOverlayAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Keyboard.dismiss();
      RNAnimated.parallel([
        RNAnimated.timing(colorHeightAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: false,
        }),
        RNAnimated.timing(colorOpacityAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: false,
        }),
        RNAnimated.timing(colorOverlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [colorPickerVisible, colorHeightAnim, colorOpacityAnim, colorOverlayAnim]);

  // Grow sheet to full screen when keyboard opens, shrink back when it closes
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      if (!colorPickerVisible) return;
      const targetHeight = screenHeight * 0.93; // Grow to 90% of screen
      RNAnimated.timing(colorHeightAnim, {
        toValue: targetHeight,
        duration: Platform.OS === "ios" ? e.duration : 200,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      if (!colorPickerVisible) return;
      RNAnimated.timing(colorHeightAnim, {
        toValue: PICKER_SHEET_HEIGHT,
        duration: Platform.OS === "ios" ? e.duration : 200,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [colorPickerVisible, colorHeightAnim, screenHeight]);

  const purple = mode === "dark" ? "#A78BFA" : "#6b38d4";
  const placeholderColor = mode === "dark" ? "#475569" : "#94A3B8";
  const inactiveBorder = mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(107, 56, 212, 0.08)";

  const descAnimatedBorder = useAnimatedStyle(() => ({
    borderColor: withTiming(descFocused ? purple : inactiveBorder, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    }),
  }), [descFocused, purple, inactiveBorder]);

  const hexAnimatedBorder = useAnimatedStyle(() => ({
    borderColor: withTiming(hexFocused ? purple : inactiveBorder, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    }),
  }), [hexFocused, purple, inactiveBorder]);

  const handlePickerChange = useCallback((colors: ColorFormatsObject) => {
    const upper = colors.hex.slice(0, 7).toUpperCase();
    setSelectedColor(upper);
    setCustomHex(upper);
  }, []);
  const isValidColor = HEX_REGEX.test(selectedColor);
  const canSubmit = name.trim().length > 0 && isValidColor && !saving;

  function handleCustomHex(raw: string) {
    // Ensure it starts with # and only contains valid hex chars
    let val = raw.startsWith("#") ? raw : "#" + raw.replace(/#/g, "");
    val =
      "#" +
      val
        .slice(1)
        .replace(/[^0-9A-Fa-f]/g, "")
        .slice(0, 6);
    setCustomHex(val);
    if (HEX_REGEX.test(val)) setSelectedColor(val);
  }

  function selectPreset(color: string) {
    setSelectedColor(color);
    setCustomHex(""); // clear custom input when a preset is chosen
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Category name is required.");
      return;
    }
    if (!isValidColor) {
      Alert.alert("Error", "Please select or enter a valid hex color.");
      return;
    }

    setSaving(true);
    try {
      await createCategory({
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
      });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.back();
    } catch (err: unknown) {
      showApiError("Failed to create category", err);
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
          <View className="flex-row justify-between items-center mt-6 mb-6">
            <View>
              <Text className="font-extrabold text-[#111c2d] text-[28px] dark:text-white tracking-[-0.5px]">
                New Category
              </Text>
              <Text className="mt-1 text-[#494454] dark:text-slate-400 text-sm">
                Organise your library
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.back()}
              className="justify-center items-center bg-[#f0f3ff] dark:bg-slate-900 rounded-full w-10 h-10"
            >
              <Feather
                name="x"
                size={20}
                color={mode === "dark" ? "#94A3B8" : "#494454"}
              />
            </TouchableOpacity>
          </View>

          {/* Name */}
          <FormInput
            label="Category Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. 18th Century Philosophy"
            placeholderColor={placeholderColor}
            mode={mode}
            maxLength={50}
            autoCapitalize="words"
          />

          {/* Description */}
          <View className="mb-6">
            <Text className="mb-2 font-bold text-[#494454] text-[10px] dark:text-slate-400 uppercase tracking-widest">
              Description
            </Text>
            <AnimatedTextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Briefly describe the focus of this category..."
              placeholderTextColor={placeholderColor}
              onFocus={() => setDescFocused(true)}
              onBlur={() => setDescFocused(false)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={255}
              className="bg-[#f0f3ff] dark:bg-slate-900 px-4 py-4 rounded-2xl text-[#111c2d] text-[15px] dark:text-white"
              style={[
                { height: 100, borderWidth: 1.5 },
                descAnimatedBorder,
              ]}
            />
          </View>

          {/* Color Picker */}
          <View className="mb-8">
            <Text className="mb-3 font-bold text-[#494454] text-[10px] dark:text-slate-400 uppercase tracking-widest">
              Color
            </Text>

            <View
              className="p-4 rounded-3xl"
              style={{
                backgroundColor:
                  mode === "dark"
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(107,56,212,0.05)",
                borderWidth: 1,
                borderColor:
                  mode === "dark"
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(107,56,212,0.08)",
              }}
            >
              {/* Preset swatches — full-width scroll */}
              <View
                className="mb-4"
                style={{
                  marginHorizontal: -16,
                }}
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    gap: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    alignItems: "center",
                  }}
                >
                  {PRESET_COLORS.map((color) => {
                    const isSelected =
                      selectedColor === color && customHex === "";
                    return (
                      <Pressable
                        key={color}
                        onPress={() => selectPreset(color)}
                        style={[
                          {
                            width: SWATCH_SIZE,
                            height: SWATCH_SIZE,
                            borderRadius: SWATCH_SIZE / 2,
                            backgroundColor: color,
                          },
                          isSelected && {
                            borderWidth: 2.5,
                            borderColor: mode === "dark" ? "#fff" : "#1e293b",
                            transform: [{ scale: 1.1 }],
                          },
                        ]}
                      />
                    );
                  })}
                </ScrollView>
              </View>

              {/* Separator */}
              <View
                className="mb-4 h-[1px]"
                style={{
                  backgroundColor:
                    mode === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.08)",
                }}
              />

              {/* Custom hex input */}
              <View className="flex-row items-center gap-3">
                {/* Color preview — tappable to open color picker */}
                <Pressable
                  onPress={() => setColorPickerVisible(true)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: isValidColor ? selectedColor : "#334155",
                    borderWidth: 1.5,
                    borderColor:
                      mode === "dark"
                        ? "rgba(255,255,255,0.15)"
                        : "rgba(0,0,0,0.12)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: mode === "dark" ? "#1E293B" : "#fff",
                      borderWidth: 1,
                      borderColor:
                        mode === "dark"
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(0,0,0,0.12)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Feather
                      name="edit-2"
                      size={8}
                      color={mode === "dark" ? "#94A3B8" : "#64748B"}
                    />
                  </View>
                </Pressable>

                <View className="flex-1">
                  <AnimatedTextInput
                    value={customHex}
                    onChangeText={handleCustomHex}
                    placeholder="#3B82F6"
                    placeholderTextColor={placeholderColor}
                    onFocus={() => setHexFocused(true)}
                    onBlur={() => setHexFocused(false)}
                    maxLength={7}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    className="bg-[#f0f3ff] dark:bg-slate-900 px-4 py-3 rounded-xl font-mono text-[#111c2d] text-[15px] dark:text-white"
                    style={[
                      { borderWidth: 1.5 },
                      hexAnimatedBorder,
                    ]}
                  />
                </View>

                {/* Validation indicator */}
                {customHex.length > 0 && (
                  <Feather
                    name={
                      HEX_REGEX.test(customHex)
                        ? "check-circle"
                        : "alert-circle"
                    }
                    size={18}
                    color={HEX_REGEX.test(customHex) ? "#34D399" : "#F87171"}
                  />
                )}
              </View>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={canSubmit ? handleSubmit : undefined}
            disabled={!canSubmit}
            className="flex-row justify-center items-center gap-2 mb-12 rounded-2xl w-full h-14"
            style={{
              backgroundColor: canSubmit
                ? mode === "dark"
                  ? "#8455ef"
                  : "#6b38d4"
                : mode === "dark"
                  ? "#0f172a"
                  : "#E2E8F0",
              shadowColor: canSubmit ? "#6b38d4" : "transparent",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: canSubmit ? 0.4 : 0,
              shadowRadius: 16,
              elevation: canSubmit ? 8 : 0,
            }}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather
                  name="check"
                  size={18}
                  color={
                    canSubmit ? "#fff" : mode === "dark" ? "#475569" : "#94A3B8"
                  }
                />
                <Text
                  className="font-bold text-base tracking-wide"
                  style={{
                    color: canSubmit
                      ? "#fff"
                      : mode === "dark"
                        ? "#475569"
                        : "#94A3B8",
                  }}
                >
                  Save Category
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── Color Picker Sheet ─── */}
      <View
        style={{ ...StyleSheet.absoluteFillObject, zIndex: 999 }}
        pointerEvents={colorPickerVisible ? "auto" : "none"}
      >
        {/* Backdrop */}
        <RNAnimated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.6)",
            opacity: colorOverlayAnim,
          }}
        >
          <Pressable
            className="flex-1"
            onPress={() => setColorPickerVisible(false)}
          />
        </RNAnimated.View>

        {/* Sheet — height grows from 0 → SHEET_HEIGHT on open, → screenHeight on keyboard */}
        <RNAnimated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: colorHeightAnim,
            opacity: colorOpacityAnim,
            backgroundColor: mode === "dark" ? "#0F172A" : "#FFFFFF",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            overflow: "hidden",
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: insets.bottom + 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 24,
          }}
        >
          {/* Drag handle */}
          <View className="self-center bg-slate-600/50 mb-5 rounded-full w-10 h-1.5" />

          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="font-bold text-[#111c2d] dark:text-white text-xl">
              Pick a Colour
            </Text>
            <Pressable
              onPress={() => setColorPickerVisible(false)}
              className="justify-center items-center bg-[#f0f3ff] dark:bg-white/10 rounded-full w-9 h-9"
            >
              <Feather
                name="x"
                size={18}
                color={mode === "dark" ? "#94A3B8" : "#494454"}
              />
            </Pressable>
          </View>

          {/* Color Picker */}
          <ColorPicker
            value={selectedColor}
            onChangeJS={handlePickerChange}
            style={{ gap: 16 }}
          >
            <Panel1 style={{ borderRadius: 12, height: 200 }} />
            <HueSlider style={{ borderRadius: 8, height: 28 }} />
            <InputWidget
              formats={["HEX"]}
              inputStyle={{
                color: mode === "dark" ? "#FFFFFF" : "#111c2d",
                backgroundColor:
                  mode === "dark"
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(107,56,212,0.05)",
                borderWidth: 1.5,
                borderColor:
                  mode === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(107,56,212,0.1)",
                borderRadius: 12,
                fontFamily: "monospace",
                fontSize: 14,
                paddingVertical: 10,
              }}
              inputTitleStyle={{
                color: mode === "dark" ? "#94A3B8" : "#64748B",
                fontSize: 10,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
              iconStyle={{ tintColor: mode === "dark" ? "#94A3B8" : "#64748B" }}
            />
          </ColorPicker>

          {/* Live preview row */}
          <View className="flex-row items-center gap-3 mt-2">
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: selectedColor,
                borderWidth: 1.5,
                borderColor:
                  mode === "dark"
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.12)",
              }}
            />
            <Text className="font-mono text-[#111c2d] dark:text-white text-sm tracking-widest">
              {selectedColor}
            </Text>
          </View>

          {/* Done button */}
          <TouchableOpacity
            onPress={() => setColorPickerVisible(false)}
            style={{
              backgroundColor: mode === "dark" ? "#8455ef" : "#6b38d4",
              height: 52,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 20,
              shadowColor: "#6b38d4",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <Text className="font-bold text-white text-base">Done</Text>
          </TouchableOpacity>
        </RNAnimated.View>
      </View>
    </View>
  );
}
