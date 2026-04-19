import { View, Text, Pressable, ScrollView, RefreshControl } from "react-native";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { BookClubCard } from "@/src/components/clubs/BookClubCard";
import { useMyBookClubs, useMyPendingInvites } from "@/src/services/clubService";
export default function ClubsScreen() {
  const router = useRouter();
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  
  const { data: clubs = [], isLoading, isFetching, refetch } = useMyBookClubs();
  const { data: invites = [] } = useMyPendingInvites();
  
  const pendingCount = invites.length;

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 48,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(400)}
          className="flex-row justify-between items-center pt-3.5 pb-6"
        >
          <Text className="font-black text-3xl tracking-tight" style={{ color: colors.text }}>
            Clubs
          </Text>

          <View className="flex-row items-center gap-3">
            {/* Invites Bell */}
            <Pressable
              onPress={() => router.push("/club/invites")}
              className="justify-center items-center rounded-full w-11 h-11 active:scale-95 border"
              style={{ 
                backgroundColor: colors.surfaceContainer,
                borderColor: colors.border + "50",
              }}
              hitSlop={8}
            >
              <Feather name="bell" size={20} color={colors.textSecondary} />
              
              {/* Red Badge */}
              {pendingCount > 0 && (
                <View className="absolute top-2 right-2 bg-red-500 rounded-full w-3.5 h-3.5 justify-center items-center border border-white dark:border-black">
                  <Text className="text-[7px] text-white font-black">{pendingCount}</Text>
                </View>
              )}
            </Pressable>

            {/* Create Club Button */}
            <Pressable
              onPress={() => router.push("/club/create")}
              className="justify-center items-center rounded-full w-11 h-11 active:scale-95 shadow-xl"
              style={{ 
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOpacity: 0.3,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 10,
                elevation: 8,
              }}
              hitSlop={8}
            >
              <Feather name="plus" size={24} color="#fff" />
            </Pressable>
          </View>
        </Animated.View>

        {/* List of Clubs */}
        {clubs.length > 0 ? (
          <View>
            {clubs.map((club, index) => (
              <BookClubCard key={club.clubId} club={club} index={index} />
            ))}
          </View>
        ) : (
          /* Empty State */
          <Animated.View 
            entering={FadeInDown.duration(400).delay(100)}
            className="flex-1 justify-center items-center pt-24"
          >
            <View className="bg-slate-100 dark:bg-slate-900 rounded-full w-32 h-32 justify-center items-center mb-6">
              <Text className="text-6xl">📖</Text>
            </View>
            <Text className="text-xl font-bold mb-2 text-center" style={{ color: colors.text }}>
              No clubs yet
            </Text>
            <Text className="text-sm text-center mb-8 px-4" style={{ color: colors.textSecondary }}>
              You are not a member of any book club right now. Join one or create your own to start reading with friends!
            </Text>
            
            <Pressable
              onPress={() => router.push("/club/create")}
              className="py-3.5 px-6 rounded-xl active:opacity-80"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-bold text-base text-center">
                Create my first club
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
