import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { COUNTRIES, Country } from '../../../constants/countries';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CountryPickerProps {
  onSelect: (country: Country) => void;
  onClose: () => void;
}

const RECENTS_KEY = '@tempo:recent_countries';

export function CountryPicker({ onSelect, onClose }: CountryPickerProps) {
  const [search, setSearch] = useState('');
  const [recentCodes, setRecentCodes] = useState<string[]>([]);
  const colors = Colors.dark;

  useEffect(() => {
    // Load recently selected countries
    AsyncStorage.getItem(RECENTS_KEY).then((data) => {
      if (data) {
        setRecentCodes(JSON.parse(data));
      } else {
        setRecentCodes(['IN', 'US', 'JP']); // default recents
      }
    });
  }, []);

  const handleSelectCountry = async (country: Country) => {
    // Save to recents
    const updated = [country.code, ...recentCodes.filter((c) => c !== country.code)].slice(0, 5);
    setRecentCodes(updated);
    await AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
    onSelect(country);
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const recentCountries = COUNTRIES.filter((c) => recentCodes.includes(c.code));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Select Country</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.bgSecondary,
              color: colors.textPrimary,
              borderColor: colors.divider,
            },
          ]}
          placeholder="Search country or dial code..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoFocus
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredCountries}
        keyExtractor={(item) => item.code}
        ListHeaderComponent={
          search.length === 0 && recentCountries.length > 0 ? (
            <View style={styles.sectionHeaderContainer}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Recently Selected</Text>
              {recentCountries.map((c) => (
                <TouchableOpacity
                  key={`recent-${c.code}`}
                  style={[styles.itemContainer, { borderBottomColor: colors.divider }]}
                  onPress={() => handleSelectCountry(c)}
                >
                  <Text style={styles.flag}>{c.flag}</Text>
                  <Text style={[styles.name, { color: colors.textPrimary }]}>{c.name}</Text>
                  <Text style={[styles.dialCode, { color: colors.textMuted }]}>{c.dialCode}</Text>
                </TouchableOpacity>
              ))}
              <View style={[styles.sectionDivider, { backgroundColor: colors.divider }]} />
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>All Countries</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.itemContainer, { borderBottomColor: colors.divider }]}
            onPress={() => handleSelectCountry(item)}
          >
            <Text style={styles.flag}>{item.flag}</Text>
            <Text style={[styles.name, { color: colors.textPrimary }]}>{item.name}</Text>
            <Text style={[styles.dialCode, { color: colors.textMuted }]}>{item.dialCode}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: 8,
    width: 60,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  sectionHeaderContainer: {
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  sectionDivider: {
    height: 1,
    marginVertical: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  dialCode: {
    fontSize: 15,
    fontWeight: '600',
  },
});
