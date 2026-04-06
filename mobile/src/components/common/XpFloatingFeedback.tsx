import { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { useAppTheme } from "@/src/hooks/useAppTheme";

interface Props {
  amount: number;
  onComplete?: () => void;
}

export function XpFloatingFeedback({ amount, onComplete }: Props) {
  const { colors } = useAppTheme();
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(
        800,
        withTiming(0, { duration: 400 }, (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        }),
      ),
    );
    translateY.value = withTiming(-28, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: -8,
          alignSelf: "center",
          backgroundColor: colors.primary,
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 10,
          zIndex: 10,
        },
        animatedStyle,
      ]}
    >
      <Text style={{ color: colors.onPrimary, fontSize: 11, fontWeight: "800" }}>
        +{amount} XP
      </Text>
    </Animated.View>
  );
}
