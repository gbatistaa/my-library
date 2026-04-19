import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { Avatar } from "@/src/components/common/Avatar";
import { ClubBookProgressDTO } from "@/src/types/club";

import { useClubProgress, useClubBooksQueue } from "@/src/services/clubService";

export default function BookProgressScreen() {
  const { id, bookId } = useLocalSearchParams();
  const router = useRouter();
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();

  const clubIdStr = typeof id === "string" ? id : id[0];
  const bookIdStr = typeof bookId === "string" ? bookId : bookId[0];

  const { data: queue = [], isLoading: isLoadingQueue } = useClubBooksQueue(clubIdStr);
  const { data: progressList = [], isLoading: isLoadingProgress } = useClubProgress(bookIdStr);

  const clubBook = queue.find(b => b.id === bookIdStr);
  const totalPages = clubBook?.book.totalPages || clubBook?.book.pages || 1;

  // Em um cenário real, precisaríamos da sessão para saber quem é o usuário atual. 
  // Temporariamente, assumimos que pego do próprio array para n quebrar, ou não temos "my progress" se n acharmos.
  // O backend não retorna progressPercent, então criamos na voo:
  const enrichedProgressList = progressList.map(p => ({
    ...p,
    progressPercent: Math.round((p.currentPage / totalPages) * 100)
  }));
  
  // Fake user id to avoid crash since we dont have context yet
  const myProgress = enrichedProgressList.length > 0 ? enrichedProgressList[0] : null;

  const isLoading = isLoadingQueue || isLoadingProgress || !clubBook;

  function StatusBadge({ status }: { status: ClubBookProgressDTO["status"] }) {
    if (status === "FINISHED") {
      return <Text className="text-xs font-bold text-emerald-500">✅ Terminou</Text>;
    }
    if (status === "UNFINISHED") {
      return <Text className="text-xs font-bold text-red-500">❌ Não finalizou</Text>;
    }
    return <Text className="text-xs font-bold" style={{ color: colors.primary }}>Lendo</Text>;
  }

  function MemberProgressRow({ progress }: { progress: any }) {
    const isEditing = myProgress && progress.id === myProgress.id;
    return (
      <View 
        className="flex-row items-center py-3 border-b"
        style={{ borderColor: colors.border + "40" }}
      >
        <Avatar user={{ ...progress.user, role: "USER", totalExperience: 0, level: 1, email: "" }} size={40} />
        <View className="flex-1 ml-3">
          <Text className="font-bold text-sm mb-1" style={{ color: colors.text }}>
            {progress.user.name} {isEditing && "(Você)"}
          </Text>
          <View className="flex-row items-center">
            {/* Progress Bar minified */}
            <View className="h-1.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full mr-2 overflow-hidden">
              <View 
                className="h-full rounded-full" 
                style={{ width: `${progress.progressPercent}%`, backgroundColor: progress.status === 'UNFINISHED' ? colors.border : colors.primary }} 
              />
            </View>
            <Text className="font-black text-xs mr-2" style={{ color: colors.text }}>
              {progress.status === 'UNFINISHED' ? '—%' : `${progress.progressPercent}%`}
            </Text>
            <StatusBadge status={progress.status} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      
      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-5 pb-3 border-b"
        style={{ paddingTop: insets.top + 10, borderColor: colors.border + "50" }}
      >
        <Pressable onPress={() => router.back()} className="w-10 h-10 justify-center items-start">
          <Feather name="chevron-left" size={28} color={colors.text} />
        </Pressable>
        <View className="items-center w-[75%]">
          <Text className="font-bold text-base" numberOfLines={1} style={{ color: colors.text }}>
            {clubBook ? clubBook.book.title : "Carregando..."}
          </Text>
          {clubBook && (
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              {enrichedProgressList.filter(p => p.status === "FINISHED").length}/{enrichedProgressList.length} finalizaram
            </Text>
          )}
        </View>
        <View className="w-10 h-10" />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
      >
        {isLoading ? (
           <View className="flex-1 pt-20 justify-center items-center">
             <ActivityIndicator size="large" color={colors.primary} />
           </View>
        ) : (
          <>
            {/* -- My Progress Card -- */}
            {myProgress && (
              <Animated.View entering={FadeInDown.duration(400)} className="mb-8">
                <View 
                  className="rounded-3xl p-5 border shadow-sm"
                  style={{ backgroundColor: colors.primary + "10", borderColor: colors.primary + "40" }}
                >
                  <Text className="font-bold text-lg mb-3" style={{ color: colors.text }}>Seu progresso</Text>
                  
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                      Página <Text className="font-bold" style={{ color: colors.text }}>{myProgress.currentPage}</Text> de {totalPages}
                    </Text>
                    <Text className="font-black text-sm" style={{ color: colors.primary }}>
                      {myProgress.progressPercent}%
                    </Text>
                  </View>

                  <View className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                    <View 
                      className="h-full rounded-full" 
                      style={{ width: `${Math.min(myProgress.progressPercent, 100)}%`, backgroundColor: colors.primary }} 
                    />
                  </View>

                  <View className="flex-row items-center mb-5 gap-3">
                    <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
                      Status: <Text style={{ color: colors.primary }}>{myProgress.status === "FINISHED" ? "Concluído" : "Lendo"}</Text>
                    </Text>
                    <View className="w-1 h-1 rounded-full bg-slate-400" />
                    <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
                      Desde: {myProgress.startedAt || "Recente"}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => router.push(`/club/${id}/books/${bookId}/update`)}
                    className="w-full py-3 items-center rounded-xl"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="font-bold text-sm text-white">
                      Atualizar Progresso
                    </Text>
                  </Pressable>
                </View>
              </Animated.View>
            )}

        {/* -- Group Summary Bar -- */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} className="mb-6">
          <View className="flex-row justify-between items-center bg-slate-100 dark:bg-slate-900 px-4 py-3 rounded-2xl border" style={{ borderColor: colors.border + "50" }}>
            <View>
              <Text className="text-xs font-bold" style={{ color: colors.text }}>Média Geral</Text>
              <Text className="text-[10px]" style={{ color: colors.textSecondary }}>{clubBook?.groupProgress || 0}% concluído</Text>
            </View>
            <View className="items-end">
              <Text className="text-xs font-bold text-amber-600 dark:text-amber-500">⏳ Prazo</Text>
              <Text className="text-[10px] text-amber-600/80 dark:text-amber-500/80">
                {clubBook?.deadline ? clubBook.deadline : "Sem prazo"}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* -- Member List -- */}
        <Animated.View entering={FadeIn.duration(400).delay(200)}>
          <Text className="font-bold text-lg mb-2" style={{ color: colors.text }}>Progresso do Grupo</Text>
          {enrichedProgressList.map((prog) => (
            <MemberProgressRow key={prog.id} progress={prog} />
          ))}
        </Animated.View>
        </>
        )}

      </ScrollView>
    </View>
  );
}
