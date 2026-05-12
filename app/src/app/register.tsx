import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/auth';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [homeWaters, setHomeWaters] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Error', 'Name, email, and password are required');
      return;
    }
    setLoading(true);
    try {
      await register({
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        homeWaters: homeWaters.trim() || undefined,
        role: 'angler',
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>UNLOCK THE GATE</Text>
        <Text style={styles.subtitle}>Create your angler account</Text>

        <View style={styles.row}>
          <TextInput style={[styles.input, styles.half]} placeholder="First Name" placeholderTextColor="rgba(255,255,255,0.3)" value={firstName} onChangeText={setFirstName} autoComplete="given-name" />
          <TextInput style={[styles.input, styles.half]} placeholder="Last Name" placeholderTextColor="rgba(255,255,255,0.3)" value={lastName} onChangeText={setLastName} autoComplete="family-name" />
        </View>

        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="rgba(255,255,255,0.3)" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <TextInput style={styles.input} placeholder="Phone (optional)" placeholderTextColor="rgba(255,255,255,0.3)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="rgba(255,255,255,0.3)" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
        <TextInput style={styles.input} placeholder="Home Waters (e.g. Lake Seminole, GA)" placeholderTextColor="rgba(255,255,255,0.3)" value={homeWaters} onChangeText={setHomeWaters} />

        <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'CREATING...' : 'CREATE ACCOUNT'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { router.back(); router.push('/login'); }}>
          <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Sign in</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  scroll: { padding: 24, paddingTop: 40 },
  title: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 3, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 32 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
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
