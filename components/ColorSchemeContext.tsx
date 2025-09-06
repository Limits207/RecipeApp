import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Appearance } from 'react-native';

export type ColorScheme = 'light' | 'dark';

interface ColorSchemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}

export const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined);

export function useColorSchemeContext() {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) throw new Error('useColorSchemeContext must be used within ColorSchemeProvider');
  return ctx;
}

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = Appearance.getColorScheme() as ColorScheme;
  const [colorScheme, setColorScheme] = useState<ColorScheme>(systemScheme || 'light');

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
}
