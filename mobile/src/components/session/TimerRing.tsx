import { View, Text } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useAppTheme } from "@/src/hooks/useAppTheme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TimerRingProps {
  /** 0–1 progress value */
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
  size = 260,
  isActive,
}: TimerRingProps) {
  const { colors } = useAppTheme();

  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
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

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
            <Stop
              offset="100%"
              stopColor={colors.primary + "80"}
              stopOpacity="1"
            />
          </LinearGradient>
        </Defs>

        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.5}
        />

        {/* Animated progress ring */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
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
            fontSize: 48,
            fontWeight: "300",
            color: colors.text,
            fontVariant: ["tabular-nums"],
            letterSpacing: -1.5,
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
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.primary,
              marginTop: 10,
              opacity: 0.8,
            }}
          />
        )}
      </View>
    </View>
  );
}
