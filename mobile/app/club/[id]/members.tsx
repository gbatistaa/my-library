import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter as useExpoRouter } from "expo-router";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useClubMembers } from "@/src/services/clubService";
import { Avatar } from "@/src/components/common/Avatar";

export default function ClubMembersScreen() {
  const { id } = useLocalSearchParams();
  const router = useExpoRouter();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const clubIdStr = typeof id === "string" ? id : id[0];
  const { data: members = [], isLoading } = useClubMembers(clubIdStr);

  const adminMembers = members.filter(m => m.role === "ADMIN");
  const regularMembers = members.filter(m => m.role !== "ADMIN");

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View 
        className="flex-row items-center justify-between px-5 pb-3 border-b"
        style={{ paddingTop: insets.top + 10, borderColor: colors.border + "50" }}
      >
        <Pressable onPress={() => router.back()} className="w-10 h-10 justify-center items-start">
          <Feather name="chevron-left" size={28} color={colors.text} />
        </Pressable>
        <Text className="font-bold text-lg" style={{ color: colors.text }}>Membros</Text>
        <View className="w-10 h-10" />
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView className="px-5 pt-4">
          <Text className="font-bold text-sm mb-3 uppercase tracking-widest" style={{ color: colors.textSecondary }}>
            Administradores
          </Text>
          {adminMembers.map(m => (
            <View key={m.id} className="flex-row items-center justify-between mb-4 border-b pb-4" style={{ borderColor: colors.border + "30" }}>
              <View className="flex-row items-center">
                <Avatar user={{ ...m.user, role: "USER", totalExperience: 0, level: 1, email: "" }} size={46} />
                <View className="ml-3">
                  <Text className="font-bold text-base" style={{ color: colors.text }}>{m.user.name}</Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>@{m.user.username}</Text>
                </View>
              </View>
              <Text className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded font-bold uppercase tracking-widest">
                Admin
              </Text>
            </View>
          ))}

          <Text className="font-bold text-sm mt-4 mb-3 uppercase tracking-widest" style={{ color: colors.textSecondary }}>
            Membros ({regularMembers.length})
          </Text>
          {regularMembers.map(m => (
            <View key={m.id} className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Avatar user={{ ...m.user, role: "USER", totalExperience: 0, level: 1, email: "" }} size={46} />
                <View className="ml-3">
                  <Text className="font-bold text-base" style={{ color: colors.text }}>{m.user.name}</Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>@{m.user.username}</Text>
                </View>
              </View>
              <Pressable className="p-2">
                <Feather name="more-horizontal" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
