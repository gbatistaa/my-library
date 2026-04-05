import { View, Text, Image, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import type { UserDTO } from "@/src/types/auth";

interface Props {
  user: UserDTO;
  size?: number;
  onPress?: () => void;
  accentColor?: string;
  /** Show the "+" edit badge when no profile picture is set */
  editable?: boolean;
}

function getInitials(name?: string | null, username?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (username?.trim()) return username.slice(0, 2).toUpperCase();
  return "??";
}

export function Avatar({
  user,
  size = 40,
  onPress,
  accentColor,
  editable = false,
}: Props) {
  const { colors } = useAppTheme();
  const color = accentColor ?? colors.primary;
  const hasPic = !!user.profilePicPath;
  const initials = getInitials(user.name, user.username);
  const badgeSize = Math.max(16, Math.round(size * 0.3));
  const fontSize = Math.round(size * 0.36);

  const inner = (
    <View style={{ width: size, height: size }}>
      {hasPic ? (
        <Image
          source={{ uri: user.profilePicPath! }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.surfaceContainerHigh,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize,
              fontWeight: "700",
              color,
            }}
          >
            {initials}
          </Text>
        </View>
      )}

      {/* "+" badge — visible only when editable AND no picture */}
      {editable && !hasPic && (
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: color,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: colors.background,
          }}
        >
          <Feather name="plus" size={badgeSize * 0.55} color="#fff" />
        </View>
      )}

      {/* Camera overlay badge — visible when editable AND picture exists */}
      {editable && hasPic && (
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: "rgba(0,0,0,0.55)",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: colors.background,
          }}
        >
          <Feather name="camera" size={badgeSize * 0.5} color="#fff" />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={{ opacity: 1 }}>
        {inner}
      </Pressable>
    );
  }

  return inner;
}
