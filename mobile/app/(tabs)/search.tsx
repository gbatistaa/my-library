import { View, Text } from 'react-native';

export default function SearchScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-paper dark:bg-deep-space">
      <Text className="text-2xl font-bold text-ink dark:text-ink-dark">
        Search
      </Text>
      <Text className="mt-2 text-ink-secondary dark:text-ink-dark-secondary">
        Coming soon: book search
      </Text>
    </View>
  );
}
