import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInUp, FadeInDown, LinearTransition } from "react-native-reanimated";

import { useAppTheme } from "@/src/hooks/useAppTheme";

import { useClubBooksQueue, useClubProgress, useUpdateProgressMutation } from "@/src/services/clubService";

export default function UpdateProgressScreen() {
  const { id, bookId } = useLocalSearchParams();
  const router = useRouter();
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();

  const clubIdStr = typeof id === "string" ? id : id[0];
  const bookIdStr = typeof bookId === "string" ? bookId : bookId[0];

  const { data: queue = [] } = useClubBooksQueue(clubIdStr);
  const { data: progressList = [] } = useClubProgress(bookIdStr);
  
  const clubBook = queue.find(b => b.id === bookIdStr);
  const totalPages = clubBook?.book.totalPages || clubBook?.book.pages || 1;

  // Assuming first one is current user or start from 0 if not found
  const myProgress = progressList[0];
  
  const [pageStr, setPageStr] = useState(String(myProgress?.currentPage || 0));
  const { mutate: updateProgress, isPending } = useUpdateProgressMutation();
  
  // Validation
  let numericPage = parseInt(pageStr, 10);
  if (isNaN(numericPage)) numericPage = 0;
  if (numericPage > totalPages) numericPage = totalPages;
  if (numericPage < 0) numericPage = 0;

  const progressPercent = totalPages > 0 ? Math.floor((numericPage / totalPages) * 100) : 0;
  const isFinished = numericPage === totalPages;

  function handleSave() {
    updateProgress({ clubBookId: bookIdStr, currentPage: numericPage }, {
      onSuccess: () => {
        router.back();
      }
    });
  }

  function handleIncrement() {
    if (numericPage < totalPages) setPageStr(String(numericPage + 1));
  }

  function handleDecrement() {
    if (numericPage > 0) setPageStr(String(numericPage - 1));
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1" 
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      
      {/* Header Modal Style */}
      <View 
        className="flex-row items-center justify-between px-5 pb-3 border-b"
        style={{ paddingTop: insets.top + 10, borderColor: colors.border + "50" }}
      >
        <Pressable onPress={() => router.back()} className="w-10 h-10 justify-center items-start">
          <Text className="text-base" style={{ color: colors.primary }}>Cancelar</Text>
        </Pressable>
        <Text className="font-bold text-base" style={{ color: colors.text }}>Atualizar Leitura</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.duration(400)} layout={LinearTransition}>
          
          <Text className="text-2xl font-black mb-1" style={{ color: colors.text }}>
            {clubBook ? clubBook.book.title : "Carregando..."}
          </Text>
          <Text className="text-sm font-medium mb-8" style={{ color: colors.textSecondary }}>
            {clubBook ? clubBook.book.author : "---"} • Total: {totalPages} páginas
          </Text>

          <Text className="font-bold mb-3 uppercase tracking-wider text-xs" style={{ color: colors.textSecondary }}>
            Página Atual
          </Text>

          {/* Stepper Input Container */}
          <View className="flex-row items-center border rounded-2xl mb-8" style={{ borderColor: colors.border + "80", backgroundColor: colors.surfaceContainer }}>
            <Pressable 
              onPress={handleDecrement}
              className="p-5 active:opacity-50"
            >
              <Feather name="minus" size={24} color={numericPage > 0 ? colors.primary : colors.textSecondary} />
            </Pressable>
            
            <TextInput
              value={pageStr}
              onChangeText={setPageStr}
              keyboardType="number-pad"
              className="flex-1 text-center font-black text-4xl"
              style={{ color: colors.text }}
              maxLength={4}
            />

            <Pressable 
              onPress={handleIncrement}
              className="p-5 active:opacity-50"
            >
              <Feather name="plus" size={24} color={numericPage < totalPages ? colors.primary : colors.textSecondary} />
            </Pressable>
          </View>

          {/* Celebration State */}
          {isFinished && (
            <Animated.View entering={FadeInUp.duration(300)} className="items-center mb-6 bg-emerald-100 dark:bg-emerald-500/20 py-4 px-4 rounded-xl border border-emerald-500/30">
              <Text className="text-3xl mb-2">🎉</Text>
              <Text className="font-black text-emerald-700 dark:text-emerald-400 text-lg">Você terminou o livro!</Text>
              <Text className="text-emerald-600 dark:text-emerald-500 text-xs mt-1 text-center">
                Aguarde os outros membros ou vá direto para as avaliações!
              </Text>
            </Animated.View>
          )}

          {/* Visual Progress */}
          <View className="mb-10 mt-2">
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs font-bold" style={{ color: colors.textSecondary }}>Progresso gerado</Text>
              <Text className="text-xs font-black" style={{ color: isFinished ? "#10b981" : colors.primary }}>
                {progressPercent}%
              </Text>
            </View>
            <View className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <Animated.View 
                className="h-full rounded-full" 
                style={{ 
                  width: `${progressPercent}%`, 
                  backgroundColor: isFinished ? "#10b981" : colors.primary 
                }} 
              />
            </View>
          </View>

        </Animated.View>
      </ScrollView>

      {/* Footer Fixed Save Button */}
      <View 
        className="absolute bottom-0 left-0 right-0 p-5 pt-3 border-t bg-white dark:bg-[#0A0A0C]"
        style={{ 
          borderColor: colors.border + "50",
          paddingBottom: Math.max(insets.bottom, 20)
        }}
      >
        <Pressable 
          onPress={handleSave}
          disabled={isPending}
          className={`w-full py-4 rounded-xl items-center shadow-lg ${isPending ? 'opacity-70' : 'active:opacity-80'}`}
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="font-bold text-[15px] text-white">
            {isPending ? "Salvando..." : "Salvar Progresso"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
