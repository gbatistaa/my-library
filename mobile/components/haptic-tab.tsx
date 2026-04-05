import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';

export function HapticTab(props: BottomTabBarButtonProps) {
  const { style, children, ...rest } = props;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.90, { duration: 150 });
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  return (
    <Pressable
      {...(rest as any)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        style,
        { opacity: pressed ? 0.8 : 1 }
      ]}
    >
      <Animated.View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
