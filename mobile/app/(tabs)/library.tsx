import { View, Text } from "react-native";

export default function LibraryScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-paper dark:bg-deep-space">
      <Text className="font-bold text-ink dark:text-ink-dark text-2xl">
        Search
      </Text>
      <Text className="mt-2 text-ink-secondary dark:text-ink-dark-secondary">
        Coming soon: book search
      </Text>
    </View>
  );
}
