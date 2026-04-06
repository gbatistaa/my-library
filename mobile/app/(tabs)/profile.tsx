import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Pressable,
  ImageBackground,
  Animated as RNAnimated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useCallback, useEffect, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { StatusBar } from "expo-status-bar";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  withTiming,
  Easing as ReanimatedEasing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

import { userAtom } from "@/src/store/auth";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useProfilePicture } from "@/src/hooks/useProfilePicture";
import { Avatar } from "@/src/components/common/Avatar";
import { XpProgressRing, XpLabel } from "@/src/components/common/XpProgressRing";
import {
  getMyDevices,
  revokeDevice,
  updateProfile,
  fetchCurrentUser,
} from "@/src/services/profileService";
import { logout } from "@/src/services/authService";
import { showApiError } from "@/src/services/apiError";
import { LogoutButton } from "@/src/components/profile/LogoutButton";
import { ThemePreferences } from "@/src/components/profile/ThemePreferences";
import type { DeviceSessionDTO, UserDTO } from "@/src/types/auth";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// ─── Edit Profile Modal ──────────────────────────────────────────────────────

function EditProfileModal({
  visible,
  user,
  onClose,
  onSave,
}: {
  visible: boolean;
  user: UserDTO;
  onClose: () => void;
  onSave: (updated: UserDTO) => void;
}) {
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(user.name ?? "");
  const [username, setUsername] = useState(user.username ?? "");
  const [saving, setSaving] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);

  const SHEET_HEIGHT = 500;
  const slideAnim = useRef(new RNAnimated.Value(SHEET_HEIGHT)).current;
  const overlayAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      RNAnimated.parallel([
        RNAnimated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 200,
        }),
        RNAnimated.timing(overlayAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      RNAnimated.parallel([
        RNAnimated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        RNAnimated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, overlayAnim, slideAnim, SHEET_HEIGHT]);

  const handleSave = async () => {
    if (!name.trim() || !username.trim()) {
      Alert.alert("Error", "Name and username are required.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile({
        name: name.trim(),
        username: username.trim(),
      });
      onSave(updated);
      onClose();
    } catch (err: unknown) {
      showApiError("Failed to update profile", err);
    } finally {
      setSaving(false);
    }
  };

  const purple = mode === "dark" ? "#A78BFA" : "#6b38d4";
  const inactiveBorder = colors.border;

  const nameAnimatedBorder = useAnimatedStyle(
    () => ({
      borderColor: withTiming(nameFocused ? purple : inactiveBorder, {
        duration: 200,
        easing: ReanimatedEasing.out(ReanimatedEasing.ease),
      }),
    }),
    [nameFocused, purple, inactiveBorder],
  );

  const userAnimatedBorder = useAnimatedStyle(
    () => ({
      borderColor: withTiming(usernameFocused ? purple : inactiveBorder, {
        duration: 200,
        easing: ReanimatedEasing.out(ReanimatedEasing.ease),
      }),
    }),
    [usernameFocused, purple, inactiveBorder],
  );

  return (
    <View
      className="z-[999] absolute inset-0"
      pointerEvents={visible ? "auto" : "none"}
    >
      {/* Backdrop with FADE */}
      <RNAnimated.View
        className="absolute inset-0 bg-black/50"
        style={{ opacity: overlayAnim }}
      >
        <Pressable className="flex-1" onPress={onClose} />
      </RNAnimated.View>

      {/* Sheet with SLIDE (using Transform) */}
      <RNAnimated.View
        className="right-0 bottom-0 left-0 absolute bg-[#f8f9ff] dark:bg-slate-900 px-6 pt-5 rounded-t-[28px]"
        style={{
          paddingBottom: insets.bottom + 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 24,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Handle / Pill */}
        <View className="self-center bg-slate-200 dark:bg-slate-800 mb-5 rounded-full w-10 h-1.5" />

        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="font-extrabold text-slate-900 dark:text-slate-50 text-xl">
            Edit Profile
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Name */}
        <Text className="mb-2 font-bold text-[10px] text-slate-500 uppercase tracking-[1px]">
          Full Name
        </Text>
        <AnimatedTextInput
          value={name}
          onChangeText={setName}
          className="bg-white dark:bg-slate-900 px-4 border-[1.5px] rounded-xl h-[52px] font-medium text-[15px] text-slate-900 dark:text-slate-50"
          style={[nameAnimatedBorder]}
          placeholderTextColor={colors.textSecondary}
          placeholder="Your full name"
          onFocus={() => setNameFocused(true)}
          onBlur={() => setNameFocused(false)}
        />

        {/* Username */}
        <Text className="mt-4 mb-2 font-bold text-[10px] text-slate-500 uppercase tracking-[1px]">
          Username
        </Text>
        <AnimatedTextInput
          value={username}
          onChangeText={setUsername}
          className="bg-white dark:bg-slate-900 px-4 border-[1.5px] rounded-xl h-[52px] font-medium text-[15px] text-slate-900 dark:text-slate-50"
          style={[userAnimatedBorder]}
          placeholderTextColor={colors.textSecondary}
          placeholder="Your username"
          autoCapitalize="none"
          onFocus={() => setUsernameFocused(true)}
          onBlur={() => setUsernameFocused(false)}
        />

        {/* Non-editable fields */}
        <View className="flex-row items-center gap-2 bg-slate-100 dark:bg-slate-900/50 mt-5 p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
          <Text className="flex-1 text-[13px] text-slate-500">
            Email and password can only be changed via settings
          </Text>
        </View>

        {/* Save */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="justify-center items-center bg-[#6b38d4] dark:bg-[#7c4dff] shadow-lg mt-6 rounded-xl h-[52px]"
          style={{
            shadowColor: mode === "dark" ? "#7c4dff" : "#6b38d4",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="font-bold text-white text-base">Save Changes</Text>
          )}
        </TouchableOpacity>
      </RNAnimated.View>
    </View>
  );
}

// ─── Confirm Revoke Modal ────────────────────────────────────────────────────

function ConfirmRevokeModal({
  device,
  onClose,
  onConfirm,
  revoking,
}: {
  device: { id: string; name: string; deviceId: string } | null;
  onClose: () => void;
  onConfirm: () => void;
  revoking: boolean;
}) {
  const { mode } = useAppTheme();
  const visible = device !== null;

  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const scaleAnim = useRef(new RNAnimated.Value(0.93)).current;

  useEffect(() => {
    if (visible) {
      RNAnimated.parallel([
        RNAnimated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        RNAnimated.timing(scaleAnim, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      RNAnimated.parallel([
        RNAnimated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        RNAnimated.timing(scaleAnim, {
          toValue: 0.93,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  const closeIconColor = mode === "dark" ? "#94A3B8" : "#6b7280";

  return (
    <View
      className="z-[1000] absolute inset-0"
      pointerEvents={visible ? "auto" : "none"}
    >
      {/* Backdrop */}
      <RNAnimated.View
        className="absolute inset-0 bg-black/55"
        style={{ opacity: fadeAnim }}
      >
        <Pressable className="flex-1" onPress={onClose} />
      </RNAnimated.View>

      {/* Centered card */}
      <View
        className="absolute inset-0 justify-center items-center px-6"
        pointerEvents="box-none"
      >
        <RNAnimated.View
          className="bg-white dark:bg-slate-900 rounded-2xl w-full overflow-hidden"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 16 },
            shadowOpacity: 0.22,
            shadowRadius: 32,
            elevation: 20,
          }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center px-5 pt-5 pb-1">
            <Text className="font-extrabold text-[#111c2d] text-[18px] dark:text-[#F8FAFC] tracking-[-0.3px]">
              Disconnect Device
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="justify-center items-center bg-[#f0f3ff] dark:bg-[#334155] rounded-full w-8 h-8"
            >
              <Ionicons name="close" size={15} color={closeIconColor} />
            </TouchableOpacity>
          </View>

          <View className="px-5 pt-4 pb-5">
            {/* Warning card */}
            <View className="flex-row items-start gap-3 bg-amber-500/10 dark:bg-amber-500/10 mb-5 p-4 border border-amber-500/40 dark:border-amber-500/20 rounded-xl">
              <Ionicons
                name="warning"
                size={18}
                color="#f59e0b"
                style={{ marginTop: 1 }}
              />
              <View className="flex-1">
                <Text className="text-[13px] text-slate-600 dark:text-slate-400 leading-[18px]">
                  You will need to sign in again on:
                </Text>
                <Text
                  className="mt-1 font-bold text-[14px] text-slate-900 dark:text-slate-50"
                  numberOfLines={1}
                >
                  {device?.name}
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={onClose}
                disabled={revoking}
                className="flex-1 justify-center items-center bg-slate-100 dark:bg-slate-800 active:opacity-60 rounded-xl h-11"
              >
                <Text className="font-bold text-slate-600 dark:text-slate-400 text-sm">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={onConfirm}
                disabled={revoking}
                className="flex-1 justify-center items-center bg-red-500 active:opacity-80 shadow-sm rounded-xl h-11"
                style={{ shadowColor: "#ef4444" }}
              >
                {revoking ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="font-bold text-white text-sm">
                    Disconnect
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </RNAnimated.View>
      </View>
    </View>
  );
}

// ─── Device Card ─────────────────────────────────────────────────────────────

function DeviceCard({
  device,
  currentDeviceId,
  onRevokePress,
}: {
  device: DeviceSessionDTO;
  currentDeviceId: string;
  onRevokePress: (id: string, name: string, deviceId: string) => void;
}) {
  const { mode } = useAppTheme();
  const isCurrentDevice = device.deviceId === currentDeviceId;
  const icon =
    device.deviceName.toLowerCase().includes("phone") ||
    device.deviceName.toLowerCase().includes("ios") ||
    device.deviceName.toLowerCase().includes("android")
      ? "phone-portrait"
      : "desktop";

  const iconColor = mode === "dark" ? "#A78BFA" : "#6b38d4";

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      className={`flex-row items-center gap-3 p-4 rounded-xl ${
        isCurrentDevice
          ? "bg-[#6b38d4]/10 dark:bg-[#7c4dff]/10 border border-[#6b38d4]/20 dark:border-[#7c4dff]/20"
          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
      }`}
    >
      {/* Device icon circle */}
      <View className="justify-center items-center bg-slate-100 dark:bg-slate-800 rounded-full w-12 h-12 shrink-0">
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      {/* Info */}
      <View className="flex-1 min-w-0">
        <Text
          className="font-bold text-[15px] text-slate-900 dark:text-slate-50"
          numberOfLines={1}
        >
          {device.deviceName}
        </Text>
        <Text className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          Last active: {device.deviceId.slice(0, 8)}…
        </Text>
      </View>

      {/* Right slot: Badge + trash button */}
      <View className="flex-row items-center gap-2 shrink-0">
        {isCurrentDevice && (
          <View className="bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 border border-emerald-500/20 rounded-full">
            <Text className="font-bold text-[10px] text-emerald-600 dark:text-emerald-400">
              Current
            </Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() =>
            onRevokePress(device.id, device.deviceName, device.deviceId)
          }
          className="justify-center items-center bg-red-500/10 dark:bg-red-500/15 active:opacity-60 rounded-full w-9 h-9"
          hitSlop={8}
        >
          <Ionicons name="trash" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ─── Info Row ────────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  const { colors, mode } = useAppTheme();
  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <View
        className="justify-center items-center rounded-xl w-10 h-10"
        style={{
          backgroundColor:
            mode === "light"
              ? colors.surfaceContainerLow
              : colors.surfaceContainerHigh,
        }}
      >
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-[1px]">
          {label}
        </Text>
        <Text
          className="mt-0.5 font-medium text-[15px] text-slate-900 dark:text-slate-100"
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { colors, mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [atomUser, setUser] = useAtom(userAtom);
  const router = useRouter();
  const queryClient = useQueryClient();
  const openProfilePicPicker = useProfilePicture();
  const [refreshing, setRefreshing] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<{
    id: string;
    name: string;
    deviceId: string;
  } | null>(null);
  const [revoking, setRevoking] = useState(false);

  // Always fetch fresh user data
  const { data: freshUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    retry: 1,
    staleTime: 60_000,
  });

  const user = freshUser ?? atomUser;

  const { data: devices, isLoading: loadingDevices } = useQuery({
    queryKey: ["myDevices"],
    queryFn: getMyDevices,
    retry: 1,
  });

  const [currentDeviceId, setCurrentDeviceId] = useState("");

  useEffect(() => {
    SecureStore.getItemAsync("mylibrary_device_id").then((id) => {
      if (id) setCurrentDeviceId(id);
    });
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["myDevices"] });
    await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    setRefreshing(false);
  }, [queryClient]);

  const openRevokeModal = useCallback(
    (id: string, name: string, deviceId: string) => {
      setRevokeTarget({ id, name, deviceId });
    },
    [],
  );

  const handleRevokeConfirm = useCallback(async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      if (revokeTarget.deviceId === currentDeviceId) {
        await logout();
        setUser(null);
        setRevokeTarget(null);
        router.replace("/(auth)/login");
        return;
      }
      await revokeDevice(revokeTarget.id);
      queryClient.invalidateQueries({ queryKey: ["myDevices"] });
      setRevokeTarget(null);
    } catch (err: unknown) {
      showApiError("Failed to disconnect device", err);
    } finally {
      setRevoking(false);
    }
  }, [revokeTarget, currentDeviceId, queryClient, setUser, router]);

  const handleProfileSaved = useCallback(
    (updated: UserDTO) => {
      setUser(updated);
    },
    [setUser],
  );

  if (!user) return null;

  const initials = (user.name ?? user.username ?? "??")
    .slice(0, 2)
    .toUpperCase();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const hasTime = dateStr.includes("T");
    const d = new Date(hasTime ? dateStr : dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── Hero Header ─────────────────────────────────────── */}
        <Animated.View entering={FadeIn.duration(400)}>
          <View className="w-full h-[260px] justify-center items-center overflow-hidden">
            {user.profilePicPath ? (
              <>
                <ImageBackground
                  source={{ uri: user.profilePicPath }}
                  className="absolute inset-0 w-full h-full"
                  resizeMode="cover"
                  blurRadius={10}
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.7)"]}
                  className="absolute inset-0"
                />
              </>
            ) : (
              <>
                <View className="absolute inset-0 bg-violet-600 dark:bg-violet-700" />
                <Text className="absolute -top-4 font-black text-[150px] text-white/10 tracking-[-6px] self-center">
                  {initials}
                </Text>
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.3)"]}
                  className="absolute inset-0"
                />
              </>
            )}

            {/* Profile Content (Always Centered) */}
            <View className="items-center z-10">
              <View style={{ position: "relative" }} className="shadow-2xl shadow-black/40">
                <XpProgressRing
                  currentXp={user.currentXp ?? 0}
                  xpForNextLevel={(user.level ?? 1) * 100}
                  size={108}
                  strokeWidth={4}
                >
                  <Avatar
                    user={user}
                    size={92}
                    editable
                    onPress={openProfilePicPicker}
                    accentColor={user.profilePicPath ? colors.primary : "#fff"}
                  />
                </XpProgressRing>
                <XpLabel level={user.level ?? 1} />
              </View>
              <Text className="mt-3.5 font-black text-white text-2xl tracking-tight shadow-sm">
                {user.name ?? user.username}
              </Text>
              <Text className="mt-0.5 font-bold text-white/80 text-sm tracking-wide">
                @{user.username}
              </Text>
              <Text style={{ marginTop: 6, fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.90)", letterSpacing: 0.2 }}>
                {"\u26A1"} Level {user.level ?? 1} {"\u00B7"} {user.currentXp ?? 0} / {(user.level ?? 1) * 100} XP
              </Text>
            </View>
          </View>

          {/* Edit Profile button */}
          <View className="items-center pt-5 pb-2">
            <TouchableOpacity
              onPress={() => setEditVisible(true)}
              className="flex-row items-center gap-2 bg-violet-600/10 dark:bg-violet-400/10 px-6 py-3 border border-violet-600/20 dark:border-violet-400/20 rounded-2xl active:scale-95"
            >
              <Ionicons
                name="create-outline"
                size={16}
                color={mode === "dark" ? "#A78BFA" : "#6b38d4"}
              />
              <Text className="font-black text-violet-700 dark:text-violet-300 text-[13px] uppercase tracking-wider">
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View className="gap-6 mt-2 px-5">
          {/* ── User Info Card ─────────────────────────────────── */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(50)}
            className="bg-white dark:bg-slate-900 shadow-sm p-5 border border-slate-200 dark:border-slate-800 rounded-[24px]"
          >
            <Text className="mb-1 font-extrabold text-[15px] text-slate-900 dark:text-slate-50">
              Account Information
            </Text>
            <InfoRow icon="person" label="Full Name" value={user.name ?? "—"} />
            <InfoRow icon="at" label="Username" value={user.username} />
            <InfoRow icon="mail" label="Email" value={user.email} />
            <InfoRow
              icon="calendar"
              label="Birthday"
              value={formatDate(user.birthDate)}
            />
            <InfoRow
              icon="time"
              label="Member Since"
              value={user.createdAt ? formatDate(user.createdAt) : "—"}
            />
          </Animated.View>

          {/* ── Theme Preferences ──────────────────────────────── */}
          <ThemePreferences />

          {/* ── Connected Devices ──────────────────────────────── */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(100)}
            className="mt-4"
          >
            <View className="flex-row justify-between items-center mb-3.5">
              <Text className="font-extrabold text-slate-900 dark:text-slate-50 text-lg tracking-[-0.3px]">
                📱 Connected Devices
              </Text>
              {Array.isArray(devices) && (
                <View className="bg-[#6b38d4]/10 dark:bg-[#7c4dff]/20 px-2.5 py-1 rounded-lg">
                  <Text className="font-bold text-[#6b38d4] dark:text-[#A78BFA] text-xs">
                    {devices.length}
                  </Text>
                </View>
              )}
            </View>

            {loadingDevices ? (
              <View className="bg-white dark:bg-[#1E293B] opacity-50 border border-slate-200 dark:border-slate-800 rounded-2xl h-20" />
            ) : (
              <View className="gap-3">
                {Array.isArray(devices) &&
                  devices.map((d) => (
                    <DeviceCard
                      key={d.id}
                      device={d}
                      currentDeviceId={currentDeviceId}
                      onRevokePress={openRevokeModal}
                    />
                  ))}
                {(!Array.isArray(devices) || devices.length === 0) && (
                  <View className="items-center bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <Text className="text-slate-500 text-sm">
                      No connected devices found
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Animated.View>

          {/* ── Sign Out ──────────────────────────────────────── */}
          <LogoutButton />
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <EditProfileModal
        visible={editVisible}
        user={user}
        onClose={() => setEditVisible(false)}
        onSave={handleProfileSaved}
      />

      {/* Revoke Confirmation Modal */}
      <ConfirmRevokeModal
        device={revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevokeConfirm}
        revoking={revoking}
      />
    </View>
  );
}
