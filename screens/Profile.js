import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../AuthContext';

const NOTIFICATIONS = [
  ['orderStatuses', 'Order statuses'],
  ['passwordChanges', 'Password changes'],
  ['specialOffers', 'Special offers'],
  ['newsletter', 'Newsletter'],
];

const FIELDS = ['userFirstName', 'userLastName', 'userEmail', 'userPhone', 'userAvatar'];

const Profile = () => {
  const { updateAuthState } = useContext(AuthContext);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [notifications, setNotifications] = useState({
    orderStatuses: true,
    passwordChanges: true,
    specialOffers: true,
    newsletter: true,
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!status) return undefined;
    const timer = setTimeout(() => setStatus(''), 3000);
    return () => clearTimeout(timer);
  }, [status]);

  const loadProfile = async () => {
    try {
      const stored = Object.fromEntries(
        await AsyncStorage.multiGet([...FIELDS, ...NOTIFICATIONS.map(([key]) => key)])
      );
      setFirstName(stored.userFirstName || '');
      setLastName(stored.userLastName || '');
      setEmail(stored.userEmail || '');
      setPhone(stored.userPhone || '');
      setAvatar(stored.userAvatar || '');
      setNotifications(
        Object.fromEntries(
          NOTIFICATIONS.map(([key]) => [key, stored[key] !== 'false'])
        )
      );
    } catch (e) {
      setStatus('Could not read your saved profile.');
    }
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.multiSet([
        ['userFirstName', firstName],
        ['userLastName', lastName],
        ['userEmail', email],
        ['userPhone', phone],
        ['userAvatar', avatar],
        ...NOTIFICATIONS.map(([key]) => [key, String(notifications[key])]),
      ]);
      setStatus('Changes saved.');
    } catch (e) {
      setStatus('Could not save your changes.');
    }
  };

  const handleDiscard = async () => {
    await loadProfile();
    setStatus('Changes discarded.');
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      updateAuthState(false);
    } catch (e) {
      setStatus('Could not log you out.');
    }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setStatus('Photo library access is needed to change the avatar.');
        return;
      }
      // expo-image-picker 13 (SDK 46) answers with `cancelled` and a flat `uri`;
      // the `canceled`/`assets` shape only arrives in SDK 47.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.cancelled) {
        setAvatar(result.uri);
      }
    } catch (e) {
      setStatus('Could not open the photo library.');
    }
  };

  const toggleNotification = (key) => {
    setNotifications((current) => ({ ...current, [key]: !current[key] }));
  };

  const renderField = (label, value, onChangeText, inputProps = {}) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor="#888888"
        accessibilityLabel={label}
        {...inputProps}
      />
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Personal information</Text>

        <Text style={styles.caption}>Avatar</Text>
        <View style={styles.avatarRow}>
          <Image
            source={avatar ? { uri: avatar } : require('../assets/profile.png')}
            style={styles.avatar}
          />
          <TouchableOpacity
            style={[styles.primaryButton, styles.spaced]}
            onPress={pickImage}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Change</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setAvatar('')}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>

        {renderField('First name', firstName, setFirstName)}
        {renderField('Last name', lastName, setLastName)}
        {renderField('Email', email, setEmail, {
          keyboardType: 'email-address',
          autoCapitalize: 'none',
        })}
        {renderField('Phone number', phone, setPhone, { keyboardType: 'phone-pad' })}

        <Text style={styles.title}>Email notifications</Text>
        {NOTIFICATIONS.map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={styles.checkboxRow}
            onPress={() => toggleNotification(key)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: notifications[key] }}
          >
            <View style={[styles.checkbox, notifications[key] && styles.checkboxChecked]}>
              {notifications[key] && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>{label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityRole="button"
        >
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>

        <Text style={styles.status}>{status}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.secondaryButton, styles.action]}
            onPress={handleDiscard}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Discard changes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, styles.action]}
            onPress={handleSave}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Save changes</Text>
          </TouchableOpacity>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginVertical: 12,
  },
  caption: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    backgroundColor: '#EDEFEE',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EDEFEE',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#495E57',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#495E57',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333333',
  },
  logoutButton: {
    backgroundColor: '#F4CE14',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  status: {
    minHeight: 22,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 14,
    color: '#495E57',
  },
  actions: {
    flexDirection: 'row',
  },
  action: {
    flex: 1,
    paddingVertical: 14,
    marginHorizontal: 4,
  },
  spaced: {
    marginRight: 12,
  },
  primaryButton: {
    backgroundColor: '#495E57',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#495E57',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#495E57',
    fontWeight: 'bold',
  },
});

export default Profile;
