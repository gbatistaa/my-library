import { useColorScheme } from 'nativewind';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { themePreferenceAtom } from '@/src/store/theme';
import { colors, type ThemeMode } from '@/src/theme/colors';

export function useAppTheme() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [themePreference] = useAtom(themePreferenceAtom);

  let mode: ThemeMode = 'light';
  if (themePreference === 'system') {
    mode = colorScheme === 'dark' ? 'dark' : 'light';
  } else {
    mode = themePreference;
  }

  useEffect(() => {
    if (themePreference === 'system') {
      setColorScheme('system');
    } else {
      setColorScheme(themePreference);
    }
  }, [themePreference, setColorScheme]);

  return { mode, colors: colors[mode] } as const;
}
