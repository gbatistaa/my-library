import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Animated as RNAnimated,
  Easing,
} from "react-native";
import { useState, useCallback, useEffect, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

import { userAtom } from "@/src/store/auth";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/src/hooks/useAppTheme";
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
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(user.name ?? "");
  const [username, setUsername] = useState(user.username ?? "");
  const [saving, setSaving] = useState(false);

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

  const inputStyle = {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.text,
    fontWeight: "500" as const,
  };

  return (
    <View
      style={{ ...StyleSheet.absoluteFillObject, zIndex: 999 }}
      pointerEvents={visible ? "auto" : "none"}
    >
      {/* Backdrop with FADE */}
      <RNAnimated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.5)",
          opacity: overlayAnim,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </RNAnimated.View>

      {/* Sheet with SLIDE (using Transform) */}
      <RNAnimated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.background,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingTop: 20,
          paddingHorizontal: 24,
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
        <View
          style={{
            width: 40,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: colors.border,
            alignSelf: "center",
            marginBottom: 20,
          }}
        />

        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
            Edit Profile
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Name */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: colors.textSecondary,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: 8,
          }}
        >
          Full Name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={inputStyle}
          placeholderTextColor={colors.textSecondary}
          placeholder="Your full name"
        />

        {/* Username */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: colors.textSecondary,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: 8,
            marginTop: 16,
          }}
        >
          Username
        </Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          style={inputStyle}
          placeholderTextColor={colors.textSecondary}
          placeholder="Your username"
          autoCapitalize="none"
        />

        {/* Non-editable fields */}
        <View
          style={{
            marginTop: 20,
            gap: 10,
            padding: 14,
            borderRadius: 14,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Feather name="lock" size={14} color={colors.textSecondary} />
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              Email and password can only be changed via settings
            </Text>
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{
            marginTop: 24,
            height: 52,
            borderRadius: 14,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
              Save Changes
            </Text>
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
      style={{ ...StyleSheet.absoluteFillObject, zIndex: 1000 }}
      pointerEvents={visible ? "auto" : "none"}
    >
      {/* Backdrop */}
      <RNAnimated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.55)",
          opacity: fadeAnim,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </RNAnimated.View>

      {/* Centered card */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
        pointerEvents="box-none"
      >
        <RNAnimated.View
          className="bg-white dark:bg-[#1E293B] rounded-2xl w-full overflow-hidden"
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
              <Feather name="x" size={15} color={closeIconColor} />
            </TouchableOpacity>
          </View>

          <View className="px-5 pt-4 pb-5">
            {/* Warning card */}
            <View className="flex-row items-start gap-3 bg-[#f59e0b]/10 dark:bg-[#f59e0b]/[0.08] mb-5 p-4 border border-[#f59e0b]/40 dark:border-[#f59e0b]/20 rounded-xl">
              <Feather
                name="alert-triangle"
                size={18}
                color="#f59e0b"
                style={{ marginTop: 1 }}
              />
              <View className="flex-1">
                <Text className="text-[#494454] text-[13px] dark:text-[#94A3B8] leading-[18px]">
                  You will need to sign in again on:
                </Text>
                <Text
                  className="mt-1 font-bold text-[#111c2d] text-[14px] dark:text-[#F8FAFC]"
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
                className="flex-1 justify-center items-center bg-[#f0f3ff] dark:bg-[#334155] active:opacity-60 rounded-xl h-11"
              >
                <Text className="font-bold text-[#494454] dark:text-[#94A3B8] text-sm">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={onConfirm}
                disabled={revoking}
                className="flex-1 justify-center items-center bg-[#ef4444] active:opacity-80 rounded-xl h-11"
                style={{
                  shadowColor: "#ef4444",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
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
    device.deviceName.toLowerCase().includes("iphone") ||
    device.deviceName.toLowerCase().includes("ios") ||
    device.deviceName.toLowerCase().includes("android")
      ? "smartphone"
      : "monitor";

  const iconColor = mode === "dark" ? "#A78BFA" : "#6b38d4";

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      className={`flex-row items-center gap-3 p-4 rounded-xl ${
        isCurrentDevice
          ? "bg-[#e9ddff]/40 dark:bg-[#A78BFA]/[0.06] border border-[#6b38d4]/20 dark:border-[#A78BFA]/20"
          : "bg-white dark:bg-[#1E293B] dark:border dark:border-[#334155]"
      }`}
    >
      {/* Device icon circle */}
      <View className="justify-center items-center bg-[#e9ddff] dark:bg-[#334155] rounded-full w-12 h-12 shrink-0">
        <Feather name={icon} size={20} color={iconColor} />
      </View>

      {/* Info */}
      <View className="flex-1 min-w-0">
        <Text
          className="font-bold text-[#111c2d] text-[15px] dark:text-[#F8FAFC]"
          numberOfLines={1}
        >
          {device.deviceName}
        </Text>
        <Text className="mt-0.5 text-[#494454] text-[11px] dark:text-[#94A3B8]">
          Last active: {device.deviceId.slice(0, 8)}…
        </Text>
      </View>

      {/* Right slot: Badge + trash button */}
      <View className="flex-row items-center gap-2 shrink-0">
        {isCurrentDevice && (
          <View className="bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 border border-emerald-500/20 rounded-full">
            <Text className="font-bold text-[10px] text-emerald-600 dark:text-emerald-400">
              This device
            </Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() =>
            onRevokePress(device.id, device.deviceName, device.deviceId)
          }
          className="justify-center items-center bg-[#ef4444]/10 dark:bg-[#ef4444]/[0.15] active:opacity-60 rounded-full w-9 h-9"
          hitSlop={8}
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={16} color="#ef4444" />
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
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
}) {
  const { colors, mode } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor:
            mode === "light"
              ? colors.surfaceContainerLow
              : colors.surfaceContainerHigh,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 10,
            fontWeight: "600",
            color: mode === "light" ? colors.outline : colors.textSecondary,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "500",
            color: colors.text,
            marginTop: 1,
          }}
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
  const [refreshing, setRefreshing] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<{
    id: string;
    name: string;
    deviceId: string;
  } | null>(null);
  const [revoking, setRevoking] = useState(false);

  // Always fetch fresh user data — do not rely on potentially stale Jotai atom
  const { data: freshUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    retry: 1,
    staleTime: 60_000,
  });

  // Sync fresh user data back to the atom so other screens benefit
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
        // If revoking current device, perform a full logout
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 10,
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
        {/* ── Header Avatar ───────────────────────────────────── */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{ alignItems: "center", paddingTop: 20, paddingBottom: 28 }}
        >
          <View
            style={{
              padding: 3,
              borderRadius: 52,
              backgroundColor: colors.primary + "28",
            }}
          >
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 20,
                elevation: 12,
              }}
            >
              <Text style={{ fontSize: 34, fontWeight: "800", color: "#fff" }}>
                {initials}
              </Text>
            </View>
          </View>

          <Text
            style={{
              marginTop: 16,
              fontSize: 22,
              fontWeight: "800",
              color: colors.text,
              letterSpacing: -0.4,
            }}
          >
            {user.name ?? user.username}
          </Text>
          <Text
            style={{ fontSize: 14, color: colors.textSecondary, marginTop: 3 }}
          >
            @{user.username}
          </Text>

          {/* Edit button */}
          <TouchableOpacity
            onPress={() => setEditVisible(true)}
            style={{
              marginTop: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: colors.primary + "14",
              borderWidth: 1,
              borderColor: colors.primary + "30",
            }}
          >
            <Feather name="edit-2" size={14} color={colors.primary} />
            <Text
              style={{ fontSize: 13, fontWeight: "700", color: colors.primary }}
            >
              Edit Profile
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ paddingHorizontal: 20, gap: 24 }}>
          {/* ── User Info Card ─────────────────────────────────── */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(50)}
            style={{
              borderRadius: 20,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "800",
                color: colors.text,
                marginBottom: 4,
              }}
            >
              Account Information
            </Text>
            <InfoRow icon="user" label="Full Name" value={user.name ?? "—"} />
            <InfoRow icon="at-sign" label="Username" value={user.username} />
            <InfoRow icon="mail" label="Email" value={user.email} />
            <InfoRow
              icon="calendar"
              label="Birthday"
              value={formatDate(user.birthDate)}
            />
            <View style={{ borderBottomWidth: 0 }}>
              <InfoRow
                icon="clock"
                label="Member Since"
                value={user.createdAt ? formatDate(user.createdAt) : "—"}
              />
            </View>
          </Animated.View>

          {/* ── Theme Preferences ──────────────────────────────── */}
          <ThemePreferences />

          {/* ── Connected Devices ──────────────────────────────── */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(100)}
            style={{ marginTop: 24 }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "800",
                  color: colors.text,
                  letterSpacing: -0.3,
                }}
              >
                📱 Connected Devices
              </Text>
              {Array.isArray(devices) ? (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 10,
                    backgroundColor: colors.primary + "18",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: colors.primary,
                    }}
                  >
                    {devices.length}
                  </Text>
                </View>
              ) : null}
            </View>

            {loadingDevices ? (
              <View
                style={{
                  height: 80,
                  borderRadius: 16,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: 0.5,
                }}
              />
            ) : (
              <View style={{ gap: 10 }}>
                {Array.isArray(devices) &&
                  devices.map((d) => (
                    <DeviceCard
                      key={d.id}
                      device={d}
                      currentDeviceId={currentDeviceId}
                      onRevokePress={openRevokeModal}
                    />
                  ))}
                {!Array.isArray(devices) || devices.length === 0 ? (
                  <View
                    style={{
                      padding: 20,
                      borderRadius: 16,
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.textSecondary,
                      }}
                    >
                      No connected devices found
                    </Text>
                  </View>
                ) : null}
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
