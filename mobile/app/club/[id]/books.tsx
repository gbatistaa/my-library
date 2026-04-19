import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { ClubBookDTO } from "@/src/types/club";

import { useState } from "react";
import { useClubBooksQueue, useAddBookToQueueMutation, useClubMembers } from "@/src/services/clubService";
import { GoogleBooksSearchModal } from "@/src/components/clubs/GoogleBooksSearchModal";
import type { GoogleBook } from "@/src/services/googleBooksApi";

export default function ClubBooksQueueScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();

  const clubIdStr = typeof id === "string" ? id : id[0];
  
  const { data: queue = [], isLoading } = useClubBooksQueue(clubIdStr);
  const { data: members = [] } = useClubMembers(clubIdStr);
  const { mutate: addBook } = useAddBookToQueueMutation();

  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const isUserAdmin = members.some(m => m.role === "ADMIN");

  // Derived state
  const currentBook = queue.find(b => b.isCurrent);
  const nextBooks = queue.filter(b => !b.isCurrent && !b.finishedAt).sort((a,b) => a.orderIndex - b.orderIndex);
  const finishedBooks = queue.filter(b => b.finishedAt).sort((a,b) => b.orderIndex - a.orderIndex);

  function BookItem({ book, type }: { book: ClubBookDTO, type: "CURRENT" | "NEXT" | "FINISHED" }) {
    
    return (
      <View 
        className="flex-row items-center p-4 mb-3 rounded-2xl border"
        style={{ 
          backgroundColor: type === "CURRENT" ? colors.primary + "10" : colors.surfaceContainer,
          borderColor: type === "CURRENT" ? colors.primary + "50" : colors.border + "50"
        }}
      >
        {/* Cover Placeholder */}
        <View className="w-16 h-24 bg-slate-200 dark:bg-slate-800 rounded-lg justify-center items-center mr-4">
          <Text className="text-2xl">📖</Text>
        </View>

        {/* Content */}
        <View className="flex-1 justify-center relative">
          {type === "CURRENT" && (
            <View className="self-start px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 mb-1">
              <Text className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">ATIVO</Text>
            </View>
          )}

          <Text className="font-bold text-[17px] mb-0.5" numberOfLines={1} style={{ color: colors.text }}>
            {book.book.title}
          </Text>
          <Text className="text-sm mb-1" style={{ color: colors.textSecondary }}>
            {book.book.author}
          </Text>
          
          {type === "FINISHED" ? (
            <View className="flex-row items-center gap-3 mt-1">
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Encerrado: <Text className="font-semibold">{book.finishedAt}</Text>
              </Text>
              <View className="flex-row items-center bg-yellow-100 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded">
                <Text className="text-[10px] text-yellow-600 dark:text-yellow-500 font-bold">⭐ {book.averageRating}</Text>
              </View>
            </View>
          ) : (
            <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              Prazo: <Text className="font-bold" style={{ color: type === "CURRENT" ? colors.primary : colors.text }}>{book.deadline}</Text>
            </Text>
          )}

          {/* Progress bar only for CURRENT */}
          {type === "CURRENT" && book.groupProgress !== undefined && (
            <View className="mt-2.5">
              <View className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <View 
                  className="h-full rounded-full" 
                  style={{ width: `${book.groupProgress}%`, backgroundColor: colors.primary }} 
                />
              </View>
              <Text className="text-[10px] font-bold mt-1 text-right" style={{ color: colors.primary }}>
                {book.groupProgress}% do grupo
              </Text>
            </View>
          )}
        </View>

        {/* Action Button */}
        {isUserAdmin && (
          <Pressable 
            onPress={() => console.log("Ações para", book.id)}
            className="w-10 h-full justify-center items-end"
          >
            <Feather name="more-vertical" size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
    );
  }

  function SectionHeader({ title }: { title: string }) {
    return (
      <View className="flex-row items-center mb-3 mt-2">
        <View className="h-px flex-1" style={{ backgroundColor: colors.border }} />
        <Text className="px-3 font-bold text-[10px] uppercase tracking-widest" style={{ color: colors.textSecondary }}>
          {title}
        </Text>
        <View className="h-px flex-1" style={{ backgroundColor: colors.border }} />
      </View>
    );
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

        <Text className="font-bold text-lg" style={{ color: colors.text }}>Fila de Leitura</Text>

        <Pressable 
          onPress={() => setSearchModalVisible(true)}
          className="w-10 h-10 justify-center items-end active:opacity-60"
        >
          {isUserAdmin ? <Feather name="plus" size={24} color={colors.primary} /> : <View />}
        </Pressable>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          {currentBook && (
            <>
              <SectionHeader title="Lendo Agora" />
              <BookItem book={currentBook} type="CURRENT" />
            </>
          )}

          {nextBooks.length > 0 && (
            <>
              <SectionHeader title="Próximos" />
              {nextBooks.map((b) => (
                <View key={b.id}>
                  <BookItem book={b} type="NEXT" />
                </View>
              ))}
            </>
          )}

          {finishedBooks.length > 0 && (
            <>
              <SectionHeader title="Concluídos" />
              {finishedBooks.map((b) => (
                <Pressable 
                  key={b.id} 
                  onPress={() => router.push(`/club/${id}/books/${b.id}/reviews`)}
                  className="active:opacity-70"
                >
                  <BookItem book={b} type="FINISHED" />
                </Pressable>
              ))}
            </>
          )}

          {!isLoading && queue.length === 0 && (
             <View className="items-center justify-center pt-20 px-8">
               <Text className="text-4xl mb-4">📭</Text>
               <Text className="text-center font-bold text-lg mb-2" style={{ color: colors.text }}>Fila vazia!</Text>
               <Text className="text-center text-sm" style={{ color: colors.textSecondary }}>O clube ainda não possui livros na fila de leitura.</Text>
             </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Busca Modal */}
      <GoogleBooksSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSelect={(b: GoogleBook) => {
          setSearchModalVisible(false);
          // O backend precisa de author, title, pages pelo menos
          addBook({ clubId: clubIdStr, book: { title: b.title, author: b.author, pages: b.pages, coverUrl: b.coverUrl }, deadline: new Date().toISOString() });
        }}
      />
    </View>
  );
}
