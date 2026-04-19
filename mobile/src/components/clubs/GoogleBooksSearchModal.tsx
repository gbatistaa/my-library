import { View, Text, TextInput, Modal, Pressable, ActivityIndicator, FlatList, Image } from "react-native";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { searchGoogleBooks, GoogleBook } from "@/src/services/googleBooksApi";

interface GoogleBooksSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (book: GoogleBook) => void;
}

export function GoogleBooksSearchModal({ visible, onClose, onSelect }: GoogleBooksSearchModalProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GoogleBook[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const books = await searchGoogleBooks(query);
    setResults(books);
    setLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <View className="flex-1" style={{ backgroundColor: colors.background, paddingTop: Math.max(insets.top, 20) }}>
        
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pb-4 border-b" style={{ borderColor: colors.border }}>
          <Text className="font-bold text-lg" style={{ color: colors.text }}>Buscar Livro</Text>
          <Pressable onPress={onClose} className="p-2 -mr-2">
            <Feather name="x" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Search Input */}
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-center rounded-xl px-4 py-3 border" style={{ backgroundColor: colors.surfaceContainer, borderColor: colors.border }}>
            <Feather name="search" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
            <TextInput
              className="flex-1 text-base p-0"
              style={{ color: colors.text }}
              placeholder="Nome do livro ou autor..."
              placeholderTextColor={colors.textSecondary}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoFocus
            />
          </View>
        </View>

        {/* Results */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 20 }}
            renderItem={({ item }) => (
              <Pressable 
                onPress={() => onSelect(item)}
                className="flex-row mb-4 bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border"
                style={{ borderColor: colors.border + "50" }}
              >
                {item.coverUrl ? (
                  <Image source={{ uri: item.coverUrl }} className="w-16 h-24 rounded-lg bg-slate-200" />
                ) : (
                  <View className="w-16 h-24 bg-slate-200 dark:bg-slate-800 rounded-lg justify-center items-center">
                    <Text className="text-xl">📖</Text>
                  </View>
                )}
                
                <View className="flex-1 ml-4 justify-center">
                  <Text className="font-bold text-base mb-1" style={{ color: colors.text }}>{item.title}</Text>
                  <Text className="text-sm mb-1" style={{ color: colors.textSecondary }}>{item.author}</Text>
                  {item.publishedDate && (
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>Publicado em {item.publishedDate}</Text>
                  )}
                  {item.pages > 0 && (
                    <Text className="text-xs font-semibold mt-1" style={{ color: colors.textSecondary }}>{item.pages} páginas</Text>
                  )}
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              !loading && query ? (
                <View className="items-center justify-center pt-10">
                  <Text style={{ color: colors.textSecondary }}>Nenhum livro encontrado.</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </Modal>
  );
}
