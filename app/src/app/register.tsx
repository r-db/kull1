import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const handleRegister = useCallback(async () => {
    if (!isLoaded || !signUp) return;
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Error', 'Name, email, and password are required');
      return;
    }
    setLoading(true);
    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.message || 'Registration failed';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, email, password, firstName, lastName]);

  const handleVerify = useCallback(async () => {
    if (!isLoaded || !signUp) return;
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });
      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.back();
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.message || 'Verification failed';
      Alert.alert('Verification Failed', msg);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, verificationCode]);

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.scroll}>
          <Text style={styles.title}>CHECK YOUR EMAIL</Text>
          <Text style={styles.subtitle}>Enter the verification code sent to {email}</Text>

          <TextInput
            style={styles.input}
            placeholder="Verification Code"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            autoComplete="one-time-code"
          />

          <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handleVerify} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'VERIFYING...' : 'VERIFY EMAIL'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

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
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="rgba(255,255,255,0.3)" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />

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
