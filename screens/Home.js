import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Filters from '../components/Filters';
import {
  createTable,
  getMenuItems,
  saveMenuItems,
  filterByQueryAndCategories,
} from '../database';
import { formatPrice, getMenuImage, SECTION_CATEGORIES } from '../utils';

const API_URL =
  'https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json';

const Home = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(
    SECTION_CATEGORIES.map(() => false)
  );
  const [avatar, setAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        await createTable();
        let menuItems = await getMenuItems();
        if (!menuItems.length) {
          const response = await fetch(API_URL);
          const json = await response.json();
          menuItems = json.menu.map((item) => ({
            ...item,
            category: item.category.toLowerCase(),
          }));
          await saveMenuItems(menuItems);
        }
        setData(menuItems);
      } catch (e) {
        setError('Could not load the menu. Pull the app up again to retry.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const loadAvatar = async () => {
      setAvatar((await AsyncStorage.getItem('userAvatar')) || '');
    };
    loadAvatar();
    return navigation.addListener('focus', loadAvatar);
  }, [navigation]);

  useEffect(() => {
    if (isLoading) return;
    // No category picked means no filter at all, so the full menu stays visible.
    const noneSelected = selectedCategories.every((selected) => !selected);
    const activeCategories = SECTION_CATEGORIES.filter(
      (_, index) => noneSelected || selectedCategories[index]
    );
    filterByQueryAndCategories(query, activeCategories)
      .then(setData)
      .catch(() => setError('Could not read the menu.'));
  }, [isLoading, query, selectedCategories]);

  const debouncedQuery = useRef(debounce(setQuery, 300)).current;

  useEffect(() => () => debouncedQuery.cancel(), [debouncedQuery]);

  const handleSearchChange = (text) => {
    setSearchText(text);
    debouncedQuery(text);
  };

  const toggleCategory = (index) => {
    setSelectedCategories((current) =>
      current.map((selected, i) => (i === index ? !selected : selected))
    );
  };

  const renderMenuItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemText}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
      </View>
      <Image
        source={getMenuImage(item.image)}
        style={styles.itemImage}
        resizeMode="cover"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { height: 70 + insets.top, paddingTop: insets.top }]}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Little Lemon"
        />
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => navigation.navigate('Profile')}
          accessibilityRole="button"
          accessibilityLabel="Profile"
        >
          <Image
            source={avatar ? { uri: avatar } : require('../assets/profile.png')}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Little Lemon</Text>
        <Text style={styles.heroSubtitle}>Chicago</Text>
        <View style={styles.heroRow}>
          <Text style={styles.heroDescription}>
            We are a family owned Mediterranean restaurant, focused on traditional
            recipes served with a modern twist.
          </Text>
          <Image source={require('../assets/hero.png')} style={styles.heroImage} />
        </View>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#333333" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu"
            placeholderTextColor="#666666"
            value={searchText}
            onChangeText={handleSearchChange}
            accessibilityLabel="Search menu"
          />
        </View>
      </View>

      <Filters
        sections={SECTION_CATEGORIES}
        selections={selectedCategories}
        onChange={toggleCategory}
      />

      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#495E57" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.name}
          renderItem={renderMenuItem}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.empty}>{error || 'No dishes match your search.'}</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEFEE',
    paddingHorizontal: 16,
  },
  logo: {
    width: 160,
    height: 40,
  },
  avatarButton: {
    position: 'absolute',
    right: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDEFEE',
  },
  hero: {
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
    alignItems: 'center',
    marginBottom: 16,
  },
  heroDescription: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 16,
  },
  heroImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDEFEE',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333333',
  },
  loader: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  empty: {
    paddingVertical: 32,
    textAlign: 'center',
    color: '#495E57',
    fontSize: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  itemText: {
    flex: 1,
    marginRight: 16,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#495E57',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495E57',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#EDEFEE',
  },
  separator: {
    height: 1,
    backgroundColor: '#EDEFEE',
  },
});

export default Home;
