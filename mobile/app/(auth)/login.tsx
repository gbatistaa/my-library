import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useState, useCallback } from "react";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useSetAtom } from "jotai";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { userAtom } from "@/src/store/auth";
import { login, register } from "@/src/services/authService";
import { showApiError } from "@/src/services/apiError";
import { AuthInput } from "@/src/components/AuthInput";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { Feather } from "@expo/vector-icons";

// ─── Validation ───────────────────────────────────────────────────────────────

const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", regex: /.{8,}/ },
  { id: "upper", label: "One uppercase letter", regex: /[A-Z]/ },
  { id: "lower", label: "One lowercase letter", regex: /[a-z]/ },
  { id: "number", label: "One number", regex: /\d/ },
  {
    id: "special",
    label: "One special character (@$!%*?&)",
    regex: /[@$!%*?&]/,
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function validateLogin(values: { username: string; password: string }) {
  const errors: Record<string, string> = {};
  if (!values.username || values.username.length < 3)
    errors.username = "Username must be at least 3 characters";
  if (!values.password) errors.password = "Password is required";
  return errors;
}

function validateRegister(values: {
  name: string;
  username: string;
  email: string;
  password: string;
  birthDate: string;
}) {
  const errors: Record<string, string> = {};
  if (!values.name || values.name.length < 3)
    errors.name = "Full name must be at least 3 characters";
  if (!values.username || values.username.length < 3)
    errors.username = "Username must be at least 3 characters";
  if (!values.email || !EMAIL_REGEX.test(values.email))
    errors.email = "Enter a valid email address";
  const allRulesPassed = PASSWORD_RULES.every((r) =>
    r.regex.test(values.password),
  );
  if (!allRulesPassed)
    errors.password = "Password does not meet all requirements";
  if (!values.birthDate) errors.birthDate = "Birth date is required";
  return errors;
}

// ─── Password Strength Meter ──────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  return (
    <View style={{ marginTop: 8, marginBottom: 4 }}>
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.regex.test(password);
        return (
          <View
            key={rule.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 3,
            }}
          >
            <Feather
              name={passed ? "check-circle" : "circle"}
              size={12}
              color={passed ? "#10B981" : "#64748B"}
            />
            <Text
              style={{
                marginLeft: 6,
                fontSize: 11,
                color: passed ? "#10B981" : "#64748B",
              }}
            >
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

type Tab = "login" | "register";

export default function AuthScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const setUser = useSetAtom(userAtom);

  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [isLoading, setIsLoading] = useState(false);

  // Login form
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  // Register form
  const [registerForm, setRegisterForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    birthDate: "",
  });
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>(
    {},
  );

  // Date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2000, 0, 1));

  const onDateChange = useCallback(
    (_event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === "android") setShowDatePicker(false);
      if (date) {
        setSelectedDate(date);
        setRegisterForm((f) => ({ ...f, birthDate: formatDate(date) }));
      }
    },
    [],
  );

  const switchTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
  }, []);

  const handleSubmit = async () => {
    if (activeTab === "login") {
      const errors = validateLogin(loginForm);
      setLoginErrors(errors);
      if (Object.keys(errors).length > 0) return;

      setIsLoading(true);
      try {
        const user = await login(loginForm);
        setUser(user);
        router.replace("/(tabs)");
      } catch (err: unknown) {
        showApiError("Login failed", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      const errors = validateRegister(registerForm);
      setRegisterErrors(errors);
      if (Object.keys(errors).length > 0) return;

      setIsLoading(true);
      try {
        const user = await register(registerForm);
        setUser(user);
        router.replace("/(tabs)");
      } catch (err: unknown) {
        showApiError("Registration failed", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#020617" }}>
      <StatusBar style="light" />

      {/* Background decorative orbs */}
      <View
        style={{
          position: "absolute",
          right: -80,
          top: -80,
          height: 256,
          width: 256,
          borderRadius: 128,
          backgroundColor: colors.primary,
          opacity: 0.12,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -40,
          left: -64,
          height: 192,
          width: 192,
          borderRadius: 96,
          backgroundColor: "#06B6D4",
          opacity: 0.08,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={{ marginBottom: 40, alignItems: "center" }}
          >
            <Text style={{ fontSize: 56 }}>📚</Text>
            <Text
              style={{
                marginTop: 12,
                fontSize: 34,
                fontWeight: "700",
                color: "#F1F5F9",
                letterSpacing: -1,
              }}
            >
              MyLibrary
            </Text>
            <Text style={{ marginTop: 4, fontSize: 13, color: "#64748B" }}>
              Your personal reading universe
            </Text>
          </Animated.View>

          {/* Card */}
          <Animated.View
            entering={FadeInUp.duration(400).delay(120)}
            style={{
              borderRadius: 24,
              backgroundColor: "#0F172A",
              padding: 24,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            {/* Tab switcher */}
            <View
              style={{
                flexDirection: "row",
                borderRadius: 12,
                backgroundColor: "#020617",
                padding: 4,
                marginBottom: 24,
              }}
            >
              <TouchableOpacity
                onPress={() => switchTab("login")}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor:
                    activeTab === "login" ? colors.primary : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: activeTab === "login" ? "#fff" : "#64748B",
                  }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => switchTab("register")}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor:
                    activeTab === "register" ? colors.primary : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: activeTab === "register" ? "#fff" : "#64748B",
                  }}
                >
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Login form ── */}
            {activeTab === "login" && (
              <Animated.View entering={FadeIn.duration(200)}>
                <AuthInput
                  label="Username"
                  icon="user"
                  placeholder="your_username"
                  value={loginForm.username}
                  onChangeText={(v) =>
                    setLoginForm((f) => ({ ...f, username: v }))
                  }
                  error={loginErrors.username}
                />
                <AuthInput
                  label="Password"
                  icon="lock"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChangeText={(v) => {
                    setLoginForm((f) => ({ ...f, password: v }));
                    if (loginErrors.password)
                      setLoginErrors((e) => ({ ...e, password: "" }));
                  }}
                  isPassword
                  error={loginErrors.password}
                />
              </Animated.View>
            )}

            {/* ── Register form ── */}
            {activeTab === "register" && (
              <Animated.View entering={FadeIn.duration(200)}>
                <AuthInput
                  label="Full Name"
                  icon="user"
                  placeholder="John Smith"
                  value={registerForm.name}
                  onChangeText={(v) =>
                    setRegisterForm((f) => ({ ...f, name: v }))
                  }
                  error={registerErrors.name}
                />
                <AuthInput
                  label="Username"
                  icon="at-sign"
                  placeholder="johnsmith"
                  value={registerForm.username}
                  onChangeText={(v) =>
                    setRegisterForm((f) => ({ ...f, username: v }))
                  }
                  error={registerErrors.username}
                />
                <AuthInput
                  label="Email"
                  icon="mail"
                  placeholder="john@example.com"
                  value={registerForm.email}
                  onChangeText={(v) =>
                    setRegisterForm((f) => ({ ...f, email: v }))
                  }
                  keyboardType="email-address"
                  error={registerErrors.email}
                />

                {/* Password with real-time strength */}
                <AuthInput
                  label="Password"
                  icon="lock"
                  placeholder="Min 8 chars, uppercase, number, special"
                  value={registerForm.password}
                  onChangeText={(v) =>
                    setRegisterForm((f) => ({ ...f, password: v }))
                  }
                  isPassword
                  error={registerErrors.password}
                />
                <PasswordStrength password={registerForm.password} />

                {/* Birth date — native date picker */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      marginBottom: 6,
                      fontSize: 11,
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                      color: "#64748B",
                    }}
                  >
                    Date of Birth
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: registerErrors.birthDate
                        ? "#F43F5E"
                        : "#334155",
                      backgroundColor: "#0F172A",
                      paddingHorizontal: 16,
                      height: 52,
                    }}
                  >
                    <Feather name="calendar" size={16} color="#64748B" />
                    <Text
                      style={{
                        marginLeft: 12,
                        fontSize: 15,
                        color: registerForm.birthDate ? "#F1F5F9" : "#64748B",
                      }}
                    >
                      {registerForm.birthDate
                        ? selectedDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Select your birth date"}
                    </Text>
                  </TouchableOpacity>
                  {registerErrors.birthDate ? (
                    <Text
                      style={{ color: "#F43F5E", fontSize: 12, marginTop: 4 }}
                    >
                      {registerErrors.birthDate}
                    </Text>
                  ) : null}
                </View>

                {/* iOS date picker inside modal */}
                {Platform.OS === "ios" ? (
                  <Modal
                    visible={showDatePicker}
                    transparent
                    animationType="slide"
                  >
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "flex-end",
                        backgroundColor: "rgba(0,0,0,0.5)",
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "#0F172A",
                          borderTopLeftRadius: 24,
                          borderTopRightRadius: 24,
                          padding: 16,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => setShowDatePicker(false)}
                          >
                            <Text style={{ color: "#64748B", fontSize: 16 }}>
                              Cancel
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              setShowDatePicker(false);
                              setRegisterForm((f) => ({
                                ...f,
                                birthDate: formatDate(selectedDate),
                              }));
                            }}
                          >
                            <Text
                              style={{
                                color: colors.primary,
                                fontWeight: "700",
                                fontSize: 16,
                              }}
                            >
                              Done
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={selectedDate}
                          mode="date"
                          display="spinner"
                          maximumDate={new Date()}
                          minimumDate={new Date(1920, 0, 1)}
                          onChange={onDateChange}
                          themeVariant="dark"
                        />
                      </View>
                    </View>
                  </Modal>
                ) : (
                  showDatePicker && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="default"
                      maximumDate={new Date()}
                      minimumDate={new Date(1920, 0, 1)}
                      onChange={onDateChange}
                    />
                  )
                )}
              </Animated.View>
            )}

            {/* Submit button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              style={{
                marginTop: 8,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                paddingVertical: 16,
                backgroundColor: isLoading ? "#475569" : colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text
                  style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}
                >
                  {activeTab === "login" ? "Sign In" : "Create Account"}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            entering={FadeIn.duration(400).delay(300)}
            style={{ marginTop: 32, alignItems: "center" }}
          >
            <Text style={{ fontSize: 13, color: "#64748B" }}>
              {activeTab === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <Text
                style={{ fontWeight: "600", color: colors.primary }}
                onPress={() =>
                  switchTab(activeTab === "login" ? "register" : "login")
                }
              >
                {activeTab === "login" ? "Sign up" : "Sign in"}
              </Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
