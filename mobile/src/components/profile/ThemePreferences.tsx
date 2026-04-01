import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useAtom } from "jotai";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import {
  themePreferenceAtom,
  loadThemeAtom,
  saveThemeAtom,
  type ThemePreference,
} from "@/src/store/theme";

const options: { label: string; value: ThemePreference; icon: any }[] = [
  { label: "Light", value: "light", icon: "sun" },
  { label: "Dark", value: "dark", icon: "moon" },
  { label: "System", value: "system", icon: "smartphone" },
];

export function ThemePreferences() {
  const { colors } = useAppTheme();
  const [themePreference] = useAtom(themePreferenceAtom);
  const [, saveTheme] = useAtom(saveThemeAtom);

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(150)}
      style={{
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      <Text
        style={{
          fontSize: 17,
          fontWeight: "800",
          color: colors.text,
          letterSpacing: -0.3,
          marginBottom: 16,
        }}
      >
        🎨 Theme Preference
      </Text>

      <View style={{ gap: 12 }}>
        {options.map((opt) => {
          const isSelected = themePreference === opt.value;

          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => saveTheme(opt.value)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderRadius: 16,
                backgroundColor: isSelected
                  ? colors.primary + "18"
                  : colors.background,
                borderWidth: 1,
                borderColor: isSelected ? colors.primary + "40" : colors.border,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: isSelected
                      ? colors.primary + "20"
                      : colors.surface,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather
                    name={opt.icon}
                    size={18}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: isSelected ? "700" : "500",
                    color: isSelected ? colors.primary : colors.text,
                  }}
                >
                  {opt.label}
                </Text>
              </View>

              {isSelected && (
                <Feather name="check" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}
