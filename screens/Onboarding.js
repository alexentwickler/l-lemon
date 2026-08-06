import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../AuthContext';

const Onboarding = () => {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { updateAuthState } = useContext(AuthContext);

  const isEmailValid = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const isFormValid = firstName.trim().length > 0 && isEmailValid(email);

  const handleNext = async () => {
    try {
      await AsyncStorage.multiSet([
        ['userFirstName', firstName.trim()],
        ['userEmail', email.trim()],
        ['isOnboardingCompleted', 'true'],
      ]);
      updateAuthState(true);
    } catch (e) {
      setError('Could not save your details. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { height: 80 + insets.top, paddingTop: insets.top }]}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Little Lemon"
          />
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Little Lemon</Text>
          <Text style={styles.heroSubtitle}>Chicago</Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroDescription}>
              We are a family owned Mediterranean restaurant, focused on traditional
              recipes served with a modern twist.
            </Text>
            <Image
              source={require('../assets/hero.png')}
              style={styles.heroImage}
            />
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Let us get to know you</Text>

          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email address"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[
              styles.button,
              isFormValid ? styles.buttonActive : styles.buttonDisabled,
            ]}
            onPress={handleNext}
            disabled={!isFormValid}
            accessibilityRole="button"
            accessibilityState={{ disabled: !isFormValid }}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEFEE',
  },
  logo: {
    width: 180,
    height: 50,
  },
  heroSection: {
    backgroundColor: '#495E57',
    padding: 16,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#F4CE14',
  },
  heroSubtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroDescription: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
    marginRight: 16,
  },
  heroImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  formContainer: {
    padding: 24,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#495E57',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#333333',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonActive: {
    backgroundColor: '#F4CE14',
  },
  buttonDisabled: {
    backgroundColor: '#EDEFEE',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  error: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
    color: '#495E57',
  },
});

export default Onboarding;
