import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useCreateClubMutation } from "@/src/services/clubService";

export default function CreateClubScreen() {
  const router = useRouter();
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxMembers, setMaxMembers] = useState("10");

  const { mutate: createClub, isPending } = useCreateClubMutation();

  function handleCreate() {
    const maxMembersNum = parseInt(maxMembers, 10);
    if (!name.trim() || !description.trim() || isNaN(maxMembersNum) || maxMembersNum <= 0) {
      return;
    }

    createClub({ name, description, maxMembers: maxMembersNum }, {
      onSuccess: () => {
        router.back();
      }
    });
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1" 
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      
      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-5 pb-3 border-b"
        style={{ paddingTop: insets.top + 10, borderColor: colors.border + "50" }}
      >
        <Pressable onPress={() => router.back()} className="w-10 h-10 justify-center items-start">
          <Feather name="chevron-left" size={28} color={colors.text} />
        </Pressable>
        <Text className="font-bold text-lg" style={{ color: colors.text }}>Criar Clube</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text className="text-sm mb-6" style={{ color: colors.textSecondary }}>
            Defina as regras e o foco do seu novo clube do livro. Voce será automaticamente o administrador.
          </Text>

          {/* Name */}
          <Text className="font-bold text-xs uppercase tracking-widest mb-2" style={{ color: colors.textSecondary }}>Nome do Clube</Text>
          <View className="border rounded-2xl mb-5 px-4 py-3" style={{ borderColor: colors.border, backgroundColor: colors.surfaceContainer }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex: Leitores de Sci-Fi"
              placeholderTextColor={colors.textSecondary + "80"}
              style={{ color: colors.text, fontSize: 16 }}
            />
          </View>

          {/* Members */}
          <Text className="font-bold text-xs uppercase tracking-widest mb-2" style={{ color: colors.textSecondary }}>Máximo de Membros</Text>
          <View className="border rounded-2xl mb-5 px-4 py-3" style={{ borderColor: colors.border, backgroundColor: colors.surfaceContainer }}>
            <TextInput
              value={maxMembers}
              onChangeText={setMaxMembers}
              keyboardType="number-pad"
              placeholder="Ex: 10"
              placeholderTextColor={colors.textSecondary + "80"}
              style={{ color: colors.text, fontSize: 16 }}
            />
          </View>

          {/* Description */}
          <Text className="font-bold text-xs uppercase tracking-widest mb-2" style={{ color: colors.textSecondary }}>Descrição</Text>
          <View className="border rounded-2xl mb-8 p-4" style={{ borderColor: colors.border, backgroundColor: colors.surfaceContainer }}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={500}
              placeholder="Descreva o propósito do clube..."
              placeholderTextColor={colors.textSecondary + "80"}
              style={{ color: colors.text, minHeight: 120, textAlignVertical: "top", fontSize: 16 }}
            />
            <Text className="text-[10px] text-right mt-2" style={{ color: colors.textSecondary }}>
              {description.length}/500
            </Text>
          </View>

        </Animated.View>
      </ScrollView>

      {/* Footer Fixed Button */}
      <View 
        className="absolute bottom-0 left-0 right-0 p-5 pt-3 border-t bg-white dark:bg-[#0A0A0C]"
        style={{ 
          borderColor: colors.border + "50",
          paddingBottom: Math.max(insets.bottom, 20)
        }}
      >
        <Pressable 
          onPress={handleCreate}
          disabled={isPending || !name.trim() || !description.trim()}
          className={`w-full py-4 rounded-xl items-center shadow-lg ${(isPending || !name.trim() || !description.trim()) ? 'opacity-50' : 'active:opacity-80'}`}
          style={{ backgroundColor: colors.primary }}
        >
          {isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-bold text-[15px] text-white">Criar Clube</Text>
          )}
        </Pressable>
      </View>

    </KeyboardAvoidingView>
  );
}
