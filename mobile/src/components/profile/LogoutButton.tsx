import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useSetAtom } from "jotai";
import { Feather } from "@expo/vector-icons";
import { userAtom, isLoadingSessionAtom } from "@/src/store/auth";
import { logout } from "@/src/services/authService";

export function LogoutButton() {
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
          height: 52,
          borderRadius: 14,
          backgroundColor: "#F43F5E15",
          borderWidth: 1,
          borderColor: "#F43F5E30",
        }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#F43F5E" />
        ) : (
          <>
            <Feather name="log-out" size={16} color="#F43F5E" />
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#F43F5E" }}>
              Sign Out
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
