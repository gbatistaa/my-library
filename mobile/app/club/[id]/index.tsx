import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { Avatar } from "@/src/components/common/Avatar";
import { ClubDashboardDTO } from "@/src/types/club";
import type { UserDTO } from "@/src/types/auth";

import { useClubDashboard, useClubMembers, useAdvanceBookMutation } from "@/src/services/clubService";

export default function ClubDashboardScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();

  const clubIdStr = typeof id === "string" ? id : id[0];

  const { data: dashboard, isLoading } = useClubDashboard(clubIdStr);
  const { data: members = [] } = useClubMembers(clubIdStr);
  const { mutate: advanceBook } = useAdvanceBookMutation();

  const adminMember = members.find(m => m.role === "ADMIN");
  // Check if current user is admin (requires fetching user session from somewhere, mapping to logic. For now pretend true if we find an admin, or false to be safe until backend ties it down to a JWT payload resolver)
  const isUserAdmin = true; 

  if (isLoading || !dashboard) {
    return <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}><Text>Loading...</Text></View>;
  }

  const hasBook = dashboard.currentBook !== null;

  function calculateDaysLeft(deadline: string) {
    const d1 = new Date(deadline);
    const d2 = new Date();
    const diff = Math.ceil((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));
    return diff;
  }

  const daysLeft = hasBook && dashboard.currentBook?.deadline ? calculateDaysLeft(dashboard.currentBook.deadline) : 0;
  
  let deadlineConfig = { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/20" };
  if (daysLeft <= 0) {
    deadlineConfig = { text: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-500/20" };
  } else if (daysLeft <= 7) {
    deadlineConfig = { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/20" };
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      
      {/* Header Bar */}
      <View 
        className="flex-row items-center justify-between px-5 pb-3 border-b"
        style={{ paddingTop: insets.top + 10, borderColor: colors.border + "50" }}
      >
        <Pressable 
          onPress={() => router.back()} 
          className="w-10 h-10 justify-center items-start active:opacity-60"
        >
          <Feather name="chevron-left" size={28} color={colors.text} />
        </Pressable>

        <Text className="font-bold text-lg" style={{ color: colors.text }}>Clube</Text>

        <Pressable 
          onPress={() => console.log("Opções")}
          className="w-10 h-10 justify-center items-end active:opacity-60"
        >
          {isUserAdmin ? <Feather name="more-horizontal" size={24} color={colors.text} /> : <View />}
        </Pressable>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }} // Espaço para botão fixo
      >
        {/* -- Info do Clube -- */}
        <Animated.View entering={FadeIn.duration(400)} className="px-5 pt-6 pb-8">
          <Text className="font-black text-3xl tracking-tight mb-2" style={{ color: colors.text }}>
            {dashboard.clubName}
          </Text>
          <Text className="text-base mb-5" style={{ color: colors.textSecondary }}>
            {dashboard.description}
          </Text>

          {adminMember && (
            <View className="flex-row items-center mb-1">
              <Text className="text-xl mr-2">👑</Text>
              <Text className="font-bold text-sm" style={{ color: colors.textSecondary }}>
                Admin: <Text style={{ color: colors.primary }}>{adminMember.user.name}</Text>
              </Text>
            </View>
          )}
          <View className="flex-row items-center">
            <Text className="text-xl mr-2">👥</Text>
            <Text className="font-bold text-sm" style={{ color: colors.textSecondary }}>
              {dashboard.activeMembers}/{dashboard.maxMembers} membros
            </Text>
          </View>
        </Animated.View>

        {/* -- Leitura Atual -- */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} className="px-5 mb-8">
          <View className="flex-row justify-between flex-end mb-3">
            <Text className="font-bold text-lg" style={{ color: colors.text }}>Leitura Atual</Text>
            {hasBook && (
              <View className={`px-2.5 py-1 rounded-full ${deadlineConfig.bg}`}>
                <Text className={`text-[10px] font-black uppercase ${deadlineConfig.text}`}>
                  {daysLeft > 0 ? `Faltam ${daysLeft} dias` : "Prazo Encerrado"}
                </Text>
              </View>
            )}
          </View>

          {hasBook ? (
            <View 
              className="rounded-3xl p-5 border shadow-sm"
              style={{ backgroundColor: colors.surfaceContainer, borderColor: colors.border + "50" }}
            >
              <View className="flex-row mb-5">
                {/* Book Cover Placeholder */}
                <View className="w-20 h-28 bg-slate-200 dark:bg-slate-800 rounded-xl justify-center items-center mr-4 overflow-hidden">
                  <Text className="text-3xl">📖</Text>
                </View>

                {/* Details */}
                <View className="flex-1 justify-center">
                  <Text className="font-black text-xl mb-1" numberOfLines={2} style={{ color: colors.text }}>
                    {dashboard.currentBook!.bookTitle}
                  </Text>
                  <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>
                    {dashboard.currentBook!.bookAuthor} • {dashboard.currentBook!.totalPages} pág
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    Início: {dashboard.currentBook!.startedAt}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    Prazo: <Text className="font-bold">{dashboard.currentBook!.deadline || "S/N"}</Text>
                  </Text>
                </View>
              </View>

              {/* Group Progress */}
              <View className="mb-5">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-xs font-bold" style={{ color: colors.text }}>Progresso do grupo</Text>
                  <Text className="text-xs font-black" style={{ color: colors.primary }}>
                    {dashboard.currentBook!.averageProgressPercent}%
                  </Text>
                </View>
                <View className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                  <View 
                    className="h-full rounded-full" 
                    style={{ width: `${dashboard.currentBook!.averageProgressPercent}%`, backgroundColor: colors.primary }} 
                  />
                </View>
                <View className="flex-row">
                  <Text className="text-xs mr-4" style={{ color: colors.textSecondary }}>
                    ✅ {dashboard.currentBook!.finishedCount} terminaram
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    ⏳ {dashboard.currentBook!.pendingCount} lendo
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => router.push(`/club/${id}/books/${dashboard.currentBook!.clubBookId}/update`)}
                  className="flex-1 py-3 items-center rounded-xl border"
                  style={{ borderColor: colors.primary, backgroundColor: colors.primary + "10" }}
                >
                  <Text className="font-bold text-sm" style={{ color: colors.primary }}>
                    Atualizar Progresso
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push(`/club/${id}/books/${dashboard.currentBook!.clubBookId}/progress`)}
                  className="w-12 h-[46px] justify-center items-center rounded-xl"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <Feather name="bar-chart-2" size={20} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="rounded-3xl p-6 items-center border border-dashed" style={{ borderColor: colors.border, backgroundColor: colors.surfaceContainer + "50" }}>
              <Text className="text-4xl mb-3">😴</Text>
              <Text className="font-bold text-center mb-1" style={{ color: colors.text }}>Nenhum livro em leitura</Text>
              <Text className="text-sm text-center" style={{ color: colors.textSecondary }}>
                O administrador precisa adicionar e iniciar um novo livro para o clube.
              </Text>
            </View>
          )}
        </Animated.View>

        {/* -- Histórico e Fila -- */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)} className="px-5 mb-8">
          <View className="flex-row justify-between items-end mb-4">
            <View>
              <Text className="font-bold text-lg" style={{ color: colors.text }}>Histórico</Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>{dashboard.finishedBooks} livros lidos</Text>
            </View>
            <Pressable onPress={() => router.push(`/club/${id}/books`)}>
              <Text className="font-bold text-sm" style={{ color: colors.primary }}>Ver Fila Completa</Text>
            </Pressable>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
            <Text className="text-xs italic" style={{ color: colors.textSecondary }}>Clique na Fila Completa para explorar.</Text>
          </ScrollView>
        </Animated.View>

        {/* -- Membros -- */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} className="px-5 mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-bold text-lg" style={{ color: colors.text }}>Membros ({dashboard.activeMembers})</Text>
            <Pressable onPress={() => router.push(`/club/${id}/members`)}>
              <Text className="font-bold text-sm" style={{ color: colors.primary }}>Ver todos</Text>
            </Pressable>
          </View>

          <View className="flex-row items-center">
            {members.slice(0, 5).map((m, i) => (
              <View 
                key={m.id} 
                className={`border-2 rounded-full ${i > 0 ? '-ml-4' : 'mr-2'}`} 
                style={{ borderColor: i === 0 ? colors.primary : colors.background }}
              >
                <Avatar user={{ ...m.user, role: "USER", totalExperience: 0, level: 1, email: "" }} size={48} />
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* -- Botoes Admin Fixos -- */}
      {isUserAdmin && (
        <Animated.View 
          entering={FadeInDown.duration(300).delay(300)}
          className="absolute bottom-0 left-0 right-0 p-5 pt-3 border-t"
          style={{ 
            backgroundColor: mode === "dark" ? "rgba(10,10,12,0.9)" : "rgba(255,255,255,0.9)",
            borderColor: colors.border + "50",
            paddingBottom: Math.max(insets.bottom, 20)
          }}
        >
          <Pressable 
            onPress={() => advanceBook(clubIdStr)}
            className="w-full py-4 rounded-xl items-center flex-row justify-center shadow-lg active:opacity-70"
            style={{ backgroundColor: colors.text }}
          >
            <Text className="font-black text-[15px]" style={{ color: colors.background }}>
              Avançar para próximo livro
            </Text>
            <Feather name="arrow-right" size={18} color={colors.background} style={{ marginLeft: 8 }} />
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}
