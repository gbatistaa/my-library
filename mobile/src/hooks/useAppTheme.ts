import { useColorScheme } from 'react-native';
import { useAtom } from 'jotai';
import { themePreferenceAtom } from '@/src/store/theme';
import { colors, type ThemeMode } from '@/src/theme/colors';

export function useAppTheme() {
  const scheme = useColorScheme();
  const [themePreference] = useAtom(themePreferenceAtom);

  let mode: ThemeMode;
  if (themePreference === 'system') {
    mode = scheme === 'dark' ? 'dark' : 'light';
  } else {
    mode = themePreference;
  }

  return { mode, colors: colors[mode] } as const;
}
