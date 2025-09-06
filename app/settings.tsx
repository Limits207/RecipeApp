
import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useColorSchemeContext } from '../components/ColorSchemeContext';

export default function SettingsScreen() {
  const { colorScheme, setColorScheme } = useColorSchemeContext();

  const toggleSwitch = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }] }>
      <Text style={[styles.label, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Dark Mode</Text>
      <Switch
        value={colorScheme === 'dark'}
        onValueChange={toggleSwitch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 20,
    marginBottom: 12,
  },
});
