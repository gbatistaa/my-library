import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useSetAtom } from "jotai";
import { Feather } from "@expo/vector-icons";
import { userAtom, isLoadingSessionAtom } from "@/src/store/auth";
import { logout } from "@/src/services/authService";
import { useAppTheme } from "@/src/hooks/useAppTheme";

export function LogoutButton() {
  const { colors, mode } = useAppTheme();
  const setUser = useSetAtom(userAtom);
  const setLoading = useSetAtom(isLoadingSessionAtom);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch {
      // best-effort
    }
    setUser(null);
    setLoading(false);
    router.replace("/(auth)/login");
  };

  return (
    <View style={{ paddingVertical: 8 }}>
      <TouchableOpacity
        onPress={handleLogout}
        disabled={isLoading}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          paddingVertical: 16,
          borderRadius: 12,
          backgroundColor: mode === "dark" ? colors.error + "25" : colors.error + "12",
          ...(mode === "dark" && {
            borderWidth: 1,
            borderColor: colors.error + "40",
          }),
        }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.error} />
        ) : (
          <>
            <Feather name="log-out" size={16} color={colors.error} />
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: colors.error,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              SIGN OUT
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
