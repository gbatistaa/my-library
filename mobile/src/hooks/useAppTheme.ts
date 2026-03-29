import { useColorScheme } from 'react-native';
import { colors, type ThemeMode } from '@/src/theme/colors';

export function useAppTheme() {
  const scheme = useColorScheme();
  const mode: ThemeMode = scheme === 'dark' ? 'dark' : 'light';
  return { mode, colors: colors[mode] } as const;
}
