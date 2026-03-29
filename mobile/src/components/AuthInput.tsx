import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  type TextInputProps,
  Platform,
} from "react-native";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/src/hooks/useAppTheme";

interface AuthInputProps extends TextInputProps {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  error?: string;
  isPassword?: boolean;
}

export function AuthInput({
  label,
  icon,
  error,
  isPassword,
  style,
  ...props
}: AuthInputProps) {
  const { colors } = useAppTheme();
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? "#F43F5E"
    : focused
      ? colors.primary
      : (colors.border ?? "#334155");

  return (
    <View className="mb-4">
      <Text className="mb-1.5 font-semibold text-ink-secondary dark:text-ink-dark-secondary text-xs uppercase tracking-widest">
        {label}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 12,
          borderWidth: focused ? 1.5 : 1,
          borderColor,
          backgroundColor: colors.surface ?? "#1E293B",
          paddingHorizontal: 16,
          height: 52,
        }}
      >
        <Feather
          name={icon}
          size={16}
          color={focused ? colors.primary : colors.textSecondary}
        />

        <TextInput
          style={[
            {
              flex: 1,
              marginLeft: 12,
              fontSize: 15,
              color: colors.text ?? "#F1F5F9",
              height: 52,
              textAlignVertical: "center",
              includeFontPadding: false,
              paddingTop: 0,
              paddingBottom: 0,
            },
            style,
          ]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPassword && !visible}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setVisible((v) => !v)} hitSlop={8}>
            <Feather
              name={visible ? "eye-off" : "eye"}
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={{ color: "#F43F5E", fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
