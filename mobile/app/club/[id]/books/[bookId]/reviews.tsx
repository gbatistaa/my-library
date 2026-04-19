import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, Modal } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { Avatar } from "@/src/components/common/Avatar";

import { ActivityIndicator } from "react-native";
import { useClubReviews, useCreateReviewMutation, useClubBooksQueue } from "@/src/services/clubService";

export default function BookReviewsScreen() {
  const { id, bookId } = useLocalSearchParams();
  const router = useRouter();
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();

  const clubIdStr = typeof id === "string" ? id : id[0];
  const bookIdStr = typeof bookId === "string" ? bookId : bookId[0];

  const { data: queue = [] } = useClubBooksQueue(clubIdStr);
  const clubBook = queue.find(b => b.id === bookIdStr);

  const { data: reviews = [], isLoading } = useClubReviews(clubIdStr, bookIdStr);
  const { mutate: createReview, isPending } = useCreateReviewMutation();

  const isUserAdmin = true; 
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [draftRating, setDraftRating] = useState(5);
  const [draftText, setDraftText] = useState("");

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
  const totalReviews = reviews.length;

  const StarRow = ({ rating, size = 16 }: { rating: number, size?: number }) => (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <FontAwesome 
          key={star} 
          name={star <= rating ? "star" : "star-o"} 
          size={size} 
          color="#f59e0b" // bg-amber-500
          style={{ marginRight: 2 }} 
        />
      ))}
    </View>
  );

  function openEditModal() {
    setDraftRating(5);
    setDraftText("");
    setIsModalOpen(true);
  }

  function openCreateModal() {
    setDraftRating(5);
    setDraftText("");
    setIsModalOpen(true);
  }

  function handleSave() {
    createReview({ clubId: clubIdStr, clubBookId: bookIdStr, rating: draftRating, reviewText: draftText }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setDraftText("");
        setDraftRating(5);
      }
    });
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
        <View className="items-center w-[70%]">
          <Text className="font-bold text-base" numberOfLines={1} style={{ color: colors.text }}>Avaliações</Text>
          <Text className="text-xs" numberOfLines={1} style={{ color: colors.textSecondary }}>{clubBook ? clubBook.book.title : "Carregando..."}</Text>
        </View>
        <View className="w-10 h-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Book Rating Overview */}
        <Animated.View entering={FadeInDown.duration(400)} className="items-center py-6 border-b" style={{ borderColor: colors.border + "30" }}>
          <Text className="text-4xl font-black mb-2 text-amber-500">{averageRating}</Text>
          <StarRow rating={Math.round(parseFloat(averageRating))} size={20} />
          <Text className="text-sm font-semibold mt-3" style={{ color: colors.textSecondary }}>
            baseado em {totalReviews} avaliações
          </Text>
        </Animated.View>

        <View className="px-5 pt-6">
          {/* Write Review Section */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)} className="mb-8">
              <Pressable 
                onPress={openCreateModal}
                className="py-4 items-center rounded-2xl border border-dashed hover:opacity-80 active:opacity-60"
                style={{ borderColor: colors.primary, backgroundColor: colors.primary + "10" }}
              >
                <Text className="font-bold text-base" style={{ color: colors.primary }}> + Escrever seu review</Text>
              </Pressable>
          </Animated.View>

          {/* Members Reviews */}
          <Animated.View entering={FadeIn.duration(400).delay(200)}>
            <Text className="font-bold text-lg mb-4" style={{ color: colors.text }}>O que os membros acharam</Text>
            
            {isLoading ? (
               <View className="items-center py-10">
                 <ActivityIndicator size="small" color={colors.primary} />
               </View>
            ) : reviews.length === 0 ? (
               <View className="items-center py-10">
                 <Text style={{ color: colors.textSecondary }}>Nenhuma avaliação registrada ainda.</Text>
               </View>
            ) : reviews.map((review) => (
              <View key={review.id} className="mb-6 border-b pb-6" style={{ borderColor: colors.border + "30" }}>
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Avatar user={{ ...review.user, role: "USER", totalExperience: 0, level: 1, email: "" }} size={36} />
                    <View className="ml-3">
                      <Text className="font-bold text-sm" style={{ color: colors.text }}>{review.user.name}</Text>
                      <Text className="text-[10px]" style={{ color: colors.textSecondary }}>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Recente"}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <StarRow rating={review.rating} />
                  </View>
                </View>
                <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
                  "{review.text}"
                </Text>
              </View>
            ))}
          </Animated.View>
        </View>
      </ScrollView>

      {/* Write Review Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="bg-white dark:bg-slate-900 rounded-t-3xl pt-6 px-6 pb-12 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="font-black text-xl" style={{ color: colors.text }}>Sua Avaliação</Text>
              <Pressable onPress={() => setIsModalOpen(false)} className="p-2 -mr-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                <Feather name="x" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View className="items-center mb-6">
              <View className="flex-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} onPress={() => setDraftRating(star)} className="px-1.5 py-2">
                    <FontAwesome 
                      name={star <= draftRating ? "star" : "star-o"} 
                      size={36} 
                      color={star <= draftRating ? "#f59e0b" : colors.border} 
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            <Text className="font-bold text-xs uppercase tracking-wider mb-2" style={{ color: colors.textSecondary }}>Sua opinião</Text>
            <View className="border rounded-2xl mb-6 p-4" style={{ borderColor: colors.border, backgroundColor: colors.surfaceContainer }}>
              <TextInput
                value={draftText}
                onChangeText={setDraftText}
                multiline
                maxLength={2000}
                placeholder="Escreva aqui os principais pontos da história, personagens e lições tiradas..."
                placeholderTextColor={colors.textSecondary + "80"}
                style={{ color: colors.text, minHeight: 120, textAlignVertical: "top" }}
              />
              <Text className="text-[10px] text-right mt-2" style={{ color: colors.textSecondary }}>
                {draftText.length}/2000
              </Text>
            </View>

            <Pressable 
              onPress={handleSave}
              disabled={isPending || draftText.trim() === ""}
              className={`w-full py-4 rounded-xl items-center shadow-md ${isPending || draftText.trim() === "" ? "opacity-50" : "active:opacity-80"} bg-[#6b38d4] dark:bg-[#A78BFA]`}
            >
              <Text className="font-bold text-[15px] text-white">
                {isPending ? "Salvando..." : "Publicar Review"}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}
