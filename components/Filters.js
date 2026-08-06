import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';

const Filters = ({ sections, selections, onChange }) => (
  <View style={styles.container}>
    <View style={styles.headingRow}>
      <Text style={styles.heading}>ORDER FOR DELIVERY!</Text>
      <Image source={require('../assets/delivery-van.png')} style={styles.van} />
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {sections.map((section, index) => {
        const isSelected = selections[index];
        return (
          <TouchableOpacity
            key={section}
            onPress={() => onChange(index)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            style={[styles.button, isSelected && styles.buttonSelected]}
          >
            <Text style={[styles.buttonText, isSelected && styles.buttonTextSelected]}>
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEFEE',
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  van: {
    width: 32,
    height: 16,
    marginLeft: 10,
    resizeMode: 'contain',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#495E57',
    backgroundColor: '#EDEFEE',
  },
  buttonSelected: {
    backgroundColor: '#495E57',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495E57',
  },
  buttonTextSelected: {
    color: '#EDEFEE',
  },
});

export default Filters;
