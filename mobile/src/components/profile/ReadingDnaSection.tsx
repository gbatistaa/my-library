import { View, Text } from "react-native";
import Animated, { FadeInLeft } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/src/hooks/useAppTheme";
import { colors as themeColors } from "@/src/theme/colors";
import type { ReadingDnaDTO } from "@/src/types/profile";

interface Props {
  dna: ReadingDnaDTO | undefined;
}

function GenreBar({
  genre,
  share,
  color,
}: {
  genre: string;
  share: number;
  color: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={{ marginBottom: 10 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text }}>
          {genre}
        </Text>
        <Text style={{ fontSize: 12, fontWeight: "700", color }}>
          {Math.round(share * 100)}%
        </Text>
      </View>
      <View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: color + "20",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${share * 100}%`,
            height: "100%",
            borderRadius: 3,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}

const BAR_COLORS = ["#6366F1", "#06B6D4", "#EC4899", "#F59E0B", "#10B981"];

export function ReadingDnaSection({ dna }: Props) {
  const { colors } = useAppTheme();
  const topGenres = (dna?.genreBreakdown ?? []).slice(0, 3);

  return (
    <Animated.View entering={FadeInLeft.duration(400).delay(200)}>
      <Text
        style={{
          fontSize: 17,
          fontWeight: "800",
          color: colors.text,
          letterSpacing: -0.3,
          marginBottom: 14,
        }}
      >
        🧬 Reading DNA
      </Text>

      <View
        style={{
          borderRadius: 20,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 3,
        }}
      >
        {/* Quick stats row */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#06B6D4" }}>
              {dna?.avgVelocityPagesPerHour?.toFixed(0) ?? "—"}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: "#94A3B8",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              pg/hour
            </Text>
          </View>
          <View style={{ width: 1, backgroundColor: colors.border }} />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#10B981" }}>
              {dna?.completionRate != null
                ? `${Math.round(dna.completionRate * 100)}%`
                : "—"}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: "#94A3B8",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              completed
            </Text>
          </View>
          <View style={{ width: 1, backgroundColor: colors.border }} />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#8B5CF6" }}>
              {dna?.uniqueAuthorsRead ?? "—"}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: "#94A3B8",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              authors
            </Text>
          </View>
        </View>

        {/* Top author */}
        {dna?.topAuthor ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              padding: 12,
              borderRadius: 12,
              backgroundColor: "#6366F115",
              marginBottom: 16,
            }}
          >
            <Feather name="user" size={14} color="#6366F1" />
            <View>
              <Text
                style={{
                  fontSize: 10,
                  color: "#94A3B8",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Favourite Author
              </Text>
              <Text
                style={{ fontSize: 14, fontWeight: "700", color: colors.text }}
              >
                {dna.topAuthor}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Genre breakdown */}
        {topGenres.length > 0 ? (
          <View>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginBottom: 12,
              }}
            >
              Top Genres
            </Text>
            {topGenres.map((g, i) => (
              <GenreBar
                key={g.genre}
                genre={g.genre}
                share={g.share}
                color={BAR_COLORS[i % BAR_COLORS.length]}
              />
            ))}
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}
