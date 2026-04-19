import { View, Text, ScrollView, Pressable } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { useAppTheme } from "@/src/hooks/useAppTheme";

import { ActivityIndicator } from "react-native";
import { useMyPendingInvites, useAcceptInviteMutation, useRejectInviteMutation } from "@/src/services/clubService";

export default function InvitesScreen() {
  const router = useRouter();
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  
  const { data: invites = [], isLoading } = useMyPendingInvites();
  const { mutate: acceptInvite, isPending: isAccepting } = useAcceptInviteMutation();
  const { mutate: rejectInvite, isPending: isRejecting } = useRejectInviteMutation();

  const activeInvitesCount = invites.length;

  function calculateDaysLeft(expiresAt: string) {
    if (!expiresAt) return 0;
    const now = new Date();
    const exp = new Date(expiresAt);
    return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
  }

  function handleAccept(id: string) {
    acceptInvite(id);
  }

  function handleReject(id: string) {
    rejectInvite(id);
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
        
        <View className="items-center flex-row">
          <Text className="font-bold text-base mr-2" style={{ color: colors.text }}>Convites Pendentes</Text>
          {activeInvitesCount > 0 && (
            <View className="bg-red-500 rounded-full w-5 h-5 justify-center items-center">
              <Text className="text-white text-[10px] font-black">{activeInvitesCount}</Text>
            </View>
          )}
        </View>

        <View className="w-10 h-10" />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
      >
        {isLoading ? (
          <View className="flex-1 justify-center items-center pt-32">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : invites.length === 0 ? (
          <Animated.View entering={FadeIn.duration(400)} className="flex-1 justify-center items-center pt-32">
             <Text className="text-6xl mb-4">📭</Text>
             <Text className="text-lg font-bold mb-2" style={{ color: colors.text }}>Nenhum convite</Text>
             <Text className="text-sm text-center" style={{ color: colors.textSecondary }}>
               Sua caixa de convites está vazia por enquanto.
             </Text>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(400)}>
            {invites.map((invite) => {
              const daysLeft = calculateDaysLeft(invite.expiresAt);
              const isExpired = daysLeft < 0 || invite.status === "EXPIRED";

              return (
                <View 
                  key={invite.id} 
                  className={`rounded-3xl p-5 border mb-4 shadow-sm ${isExpired ? 'opacity-60' : ''}`}
                  style={{ 
                    backgroundColor: colors.surfaceContainer, 
                    borderColor: colors.border + "60" 
                  }}
                >
                  <View className="flex-row items-center mb-4">
                    <View className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 justify-center items-center mr-4">
                      <Text className="text-2xl">📖</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-lg mb-0.5" style={{ color: colors.text }}>{invite.club.name}</Text>
                      <Text className="text-xs" style={{ color: colors.textSecondary }}>
                        Convidado por: <Text className="font-bold">{invite.inviter.name}</Text>
                      </Text>
                    </View>
                  </View>

                  {isExpired ? (
                    <View className="bg-slate-200 dark:bg-slate-800 rounded-xl py-3 items-center">
                      <Text className="font-bold text-xs" style={{ color: colors.textSecondary }}>EXPIRADO</Text>
                    </View>
                  ) : (
                    <View>
                      <View className="flex-row justify-between items-center mb-4 px-2">
                        <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>Validade</Text>
                        <Text className="text-xs font-black text-amber-600 dark:text-amber-500">Expira em {daysLeft} dias</Text>
                      </View>
                      <View className="flex-row gap-3">
                        <Pressable 
                          onPress={() => handleReject(invite.id)}
                          className="flex-1 py-3 items-center rounded-xl border border-slate-300 dark:border-slate-700 active:opacity-70"
                        >
                          <Text className="font-bold text-[13px]" style={{ color: colors.textSecondary }}>Recusar</Text>
                        </Pressable>

                        <Pressable 
                          onPress={() => handleAccept(invite.id)}
                          className="flex-1 py-3 items-center rounded-xl shadow-md active:opacity-80"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <Text className="font-bold text-[13px] text-white">Aceitar Convite</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
