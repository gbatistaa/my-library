import { View, Text } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { useEffect } from "react";
import { useSharedValue } from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TimerRingProps {
  /** 0-1 progress value */
  progress: number;
  /** Time string to display in center (e.g. "01:23:45") */
  timeDisplay: string;
  /** Subtitle under time (e.g. "of 30 min") */
  subtitle?: string;
  /** Ring size */
  size?: number;
  /** Whether the timer is actively running */
  isActive: boolean;
}

export function TimerRing({
  progress,
  timeDisplay,
  subtitle,
  size = 280,
  isActive,
}: TimerRingProps) {
  const { colors, mode } = useAppTheme();

  const bgStrokeWidth = 6;
  const progressStrokeWidth = 10;
  const radius = (size - progressStrokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const animatedProgress = useDerivedValue(() => {
    return withTiming(progress, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const offset = circumference * (1 - animatedProgress.value);
    return {
      strokeDashoffset: offset,
    };
  });

  // Pulsing dot animation
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      pulseOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [isActive, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const gradientEnd =
    mode === "light" ? colors.primaryContainer : colors.primary + "99";

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
            <Stop offset="100%" stopColor={gradientEnd} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.surfaceContainerHigh}
          strokeWidth={bgStrokeWidth}
          fill="none"
        />

        {/* Animated progress ring */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={progressStrokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>

      {/* Center content */}
      <View
        style={{
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 54,
            fontWeight: "700",
            color: colors.text,
            fontVariant: ["tabular-nums"],
            letterSpacing: -2,
          }}
        >
          {timeDisplay}
        </Text>
        {subtitle ? (
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginTop: 4,
              fontWeight: "500",
            }}
          >
            {subtitle}
          </Text>
        ) : null}
        {isActive && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
              gap: 6,
            }}
          >
            <Animated.View
              style={[
                {
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.primary,
                },
                pulseStyle,
              ]}
            />
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: colors.primary,
                textTransform: "uppercase",
                letterSpacing: 3,
              }}
            >
              ACTIVE
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
