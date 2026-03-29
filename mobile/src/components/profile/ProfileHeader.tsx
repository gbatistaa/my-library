import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { colors as themeColors } from "@/src/theme/colors";
import type { UserDTO } from "@/src/types/auth";

interface Props {
  user: UserDTO;
  archetype?: string;
}

const ARCHETYPE_COLORS: Record<string, string> = {
  "Night Owl": "#6366F1",
  "Genre Explorer": "#06B6D4",
  "Speed Reader": "#F59E0B",
  "Deep Diver": "#EC4899",
  "Casual Reader": "#10B981",
};

export function ProfileHeader({ user, archetype }: Props) {
  const { colors } = useAppTheme();
  const initials = (user.username ?? "??").slice(0, 2).toUpperCase();
  const accentColor =
    archetype && ARCHETYPE_COLORS[archetype]
      ? ARCHETYPE_COLORS[archetype]
      : colors.primary;

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={{ alignItems: "center", paddingTop: 24, paddingBottom: 28 }}
    >
      {/* Avatar with glow ring */}
      <View
        style={{
          padding: 3,
          borderRadius: 52,
          backgroundColor: accentColor + "30",
        }}
      >
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: accentColor,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: accentColor,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.45,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          <Text style={{ fontSize: 34, fontWeight: "800", color: "#fff" }}>
            {initials}
          </Text>
        </View>
      </View>

      {/* Username */}
      <Text
        style={{
          marginTop: 16,
          fontSize: 24,
          fontWeight: "800",
          color: colors.text,
          letterSpacing: -0.5,
        }}
      >
        @{user.username}
      </Text>

      {/* Archetype badge */}
      {archetype ? (
        <View
          style={{
            marginTop: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 5,
            borderRadius: 20,
            backgroundColor: accentColor + "18",
            borderWidth: 1,
            borderColor: accentColor + "40",
          }}
        >
          <Feather name="star" size={12} color={accentColor} />
          <Text style={{ fontSize: 12, fontWeight: "700", color: accentColor }}>
            {archetype}
          </Text>
        </View>
      ) : null}

      {/* Email */}
      {user.email ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
            gap: 4,
          }}
        >
          <Feather name="mail" size={12} color={colors.textSecondary} />
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            {user.email}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}
