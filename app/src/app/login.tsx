import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.back();
    } catch (err: any) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>WELCOME BACK</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="rgba(255,255,255,0.3)"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="rgba(255,255,255,0.3)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.disabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'SIGNING IN...' : 'SIGN IN'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { router.back(); router.push('/register'); }}>
        <Text style={styles.link}>Don't have an account? <Text style={styles.linkBold}>Sign up</Text></Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 3, textAlign: 'center', marginBottom: 32 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8, padding: 16, fontSize: 15, color: '#fff', marginBottom: 12,
  },
  button: { backgroundColor: '#fff', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8, marginBottom: 24 },
  buttonText: { fontSize: 13, fontWeight: '800', color: '#111', letterSpacing: 1 },
  disabled: { opacity: 0.5 },
  link: { color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' },
  linkBold: { color: '#4ADE80', fontWeight: '700' },
});
