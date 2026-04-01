import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useState, useCallback, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

import { userAtom } from "@/src/store/auth";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import {
  getMyDevices,
  revokeDevice,
  updateProfile,
  fetchCurrentUser,
} from "@/src/services/profileService";
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
  const [name, setName] = useState(user.name ?? "");
  const [username, setUsername] = useState(user.username ?? "");
  const [saving, setSaving] = useState(false);

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
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to update profile.";
      Alert.alert("Error", msg);
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
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 24,
            paddingBottom: Platform.OS === "ios" ? 40 : 24,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "800", color: colors.text }}
            >
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
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
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
        </View>
      </View>
    </Modal>
  );
}

// ─── Device Card ─────────────────────────────────────────────────────────────

function DeviceCard({
  device,
  currentDeviceId,
  onRevoke,
}: {
  device: DeviceSessionDTO;
  currentDeviceId: string;
  onRevoke: (id: string) => void;
}) {
  const { colors } = useAppTheme();
  const isCurrentDevice = device.deviceId === currentDeviceId;
  const icon =
    device.deviceName.toLowerCase().includes("iphone") ||
    device.deviceName.toLowerCase().includes("ios")
      ? "smartphone"
      : device.deviceName.toLowerCase().includes("android")
        ? "smartphone"
        : "monitor";

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: isCurrentDevice ? colors.primary + "40" : colors.border,
        gap: 14,
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: isCurrentDevice
            ? colors.primary + "18"
            : colors.border + "60",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather
          name={icon}
          size={20}
          color={isCurrentDevice ? colors.primary : colors.textSecondary}
        />
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text
            style={{ fontSize: 15, fontWeight: "700", color: colors.text }}
            numberOfLines={1}
          >
            {device.deviceName}
          </Text>
          {isCurrentDevice ? (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
                backgroundColor: "#10B98118",
              }}
            >
              <Text
                style={{ fontSize: 10, fontWeight: "700", color: "#10B981" }}
              >
                This device
              </Text>
            </View>
          ) : null}
        </View>
        <Text
          style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}
        >
          ID: {device.deviceId.slice(0, 8)}…
        </Text>
      </View>

      {/* Revoke */}
      {!isCurrentDevice ? (
        <TouchableOpacity
          onPress={() => onRevoke(device.id)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: "#F43F5E15",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="x" size={16} color="#F43F5E" />
        </TouchableOpacity>
      ) : null}
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
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border + "60",
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: colors.primary + "14",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "600",
            color: colors.textSecondary,
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
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
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

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

  const handleRevoke = useCallback(
    async (sessionId: string) => {
      Alert.alert("Revoke Session", "This will log out the device. Continue?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: async () => {
            try {
              await revokeDevice(sessionId);
              queryClient.invalidateQueries({ queryKey: ["myDevices"] });
            } catch {
              Alert.alert("Error", "Failed to revoke session.");
            }
          },
        },
      ]);
    },
    [queryClient],
  );

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
          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={{ marginTop: 24 }}>
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
                      onRevoke={handleRevoke}
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
      {editVisible ? (
        <EditProfileModal
          visible={editVisible}
          user={user}
          onClose={() => setEditVisible(false)}
          onSave={handleProfileSaved}
        />
      ) : null}
    </View>
  );
}
