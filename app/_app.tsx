import { AuthProvider } from '../AuthContext';
import { Stack } from 'expo-router';

export default function App() {
  return (
    <AuthProvider>
      <Stack />
    </AuthProvider>
  );
}
