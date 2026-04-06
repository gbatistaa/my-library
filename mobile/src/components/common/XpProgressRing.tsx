import { useEffect } from "react";
import { View, Text } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useAppTheme } from "@/src/hooks/useAppTheme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  level: number;
  totalXp: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

/** Returns the XP thresholds for a given level. */
function getLevelBounds(level: number) {
  // Level = floor(sqrt(totalXP) / 10) + 1
  // So XP needed for level L is: ((L - 1) * 10)^2
  const currentLevelXp = Math.pow((level - 1) * 10, 2);
  const nextLevelXp = Math.pow(level * 10, 2);
  return { currentLevelXp, nextLevelXp };
}

export function XpProgressRing({
  level,
  totalXp,
  size = 56,
  strokeWidth = 3.5,
  children,
}: Props) {
  const { colors } = useAppTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const { currentLevelXp, nextLevelXp } = getLevelBounds(level);
  const xpInLevel = totalXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const progress = xpNeeded > 0 ? Math.min(xpInLevel / xpNeeded, 1) : 0;

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Defs>
          <LinearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={colors.tertiary} />
          </LinearGradient>
        </Defs>

        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.5}
        />

        {/* Animated progress arc */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#xpGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {children}
    </View>
  );
}

export function XpLabel({ level }: { level: number }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        position: "absolute",
        bottom: -4,
        right: -4,
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderWidth: 1.5,
        borderColor: colors.background,
        minWidth: 20,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 9,
          fontWeight: "800",
          color: colors.onPrimary,
        }}
      >
        {level}
      </Text>
    </View>
  );
}
