// screens/CarForm.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3001',
  ios: 'http://localhost:3001',
  web: 'http://localhost:3001',
  default: 'http://localhost:3001',
});

export default function CarForm() {
  const nav = useNavigation();
  const route = useRoute();
  const mode = route.params?.mode ?? 'create';
  const car  = route.params?.car;

  const [make, setMake]         = useState(car?.make ?? '');
  const [model, setModel]       = useState(car?.model ?? '');
  const [year, setYear]         = useState(car?.year ? String(car.year) : '');
  const [horsepower, setHp]     = useState(car?.horsepower ? String(car.horsepower) : '');
  const [price, setPrice]       = useState(car?.price ? String(car.price) : '');
  const [loading, setLoading]   = useState(false);

  const toNumber = (v) => Number(String(v).replace(/[^0-9.]/g, '') || 0);

  const payload = {
    make: make.trim(),
    model: model.trim(),
    year: toNumber(year),
    horsepower: toNumber(horsepower),
    price: toNumber(price),
  };

  const validate = () => {
    if (!payload.make || !payload.model) return 'Please fill Make & Model';
    if (!payload.year) return 'Year must be a number';
    if (!payload.price) return 'Price must be a number';
    return '';
  };

  const createCar = async () => {
    const msg = validate();
    if (msg) return Alert.alert('Invalid', msg);
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/cars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      Alert.alert('Success', 'Car created');
      nav.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  const updateCar = async () => {
    const msg = validate();
    if (msg) return Alert.alert('Invalid', msg);
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/cars/${String(car.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: car.id, ...payload }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      Alert.alert('Success', 'Updated');
      nav.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const deleteCar = async () => {
    Alert.alert('Confirm', 'Delete this car?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}/cars/${String(car.id)}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            Alert.alert('Deleted', 'Car removed');
            nav.goBack();
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Delete failed');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.iconCircle}>
          <Text style={s.iconText}>🚗</Text>
        </View>
        <Text style={s.title}>{mode === 'create' ? 'Add New Car' : 'Edit Car'}</Text>
        <Text style={s.subtitle}>
          {mode === 'create' ? 'Fill in the details below' : 'Update car information'}
        </Text>
      </View>

      {/* Form */}
      <View style={s.form}>
        <View style={s.inputGroup}>
          <Text style={s.label}>Make</Text>
          <TextInput 
            style={s.input} 
            placeholder="e.g., Porsche" 
            placeholderTextColor="#9ca3af"
            value={make} 
            onChangeText={setMake} 
          />
        </View>

        <View style={s.inputGroup}>
          <Text style={s.label}>Model</Text>
          <TextInput 
            style={s.input} 
            placeholder="e.g., 911" 
            placeholderTextColor="#9ca3af"
            value={model} 
            onChangeText={setModel} 
          />
        </View>

        <View style={s.row}>
          <View style={[s.inputGroup, s.halfWidth]}>
            <Text style={s.label}>Year</Text>
            <TextInput 
              style={s.input} 
              placeholder="2022" 
              placeholderTextColor="#9ca3af"
              value={year} 
              onChangeText={setYear} 
              keyboardType="numeric" 
            />
          </View>

          <View style={[s.inputGroup, s.halfWidth]}>
            <Text style={s.label}>Horsepower</Text>
            <TextInput 
              style={s.input} 
              placeholder="379" 
              placeholderTextColor="#9ca3af"
              value={horsepower} 
              onChangeText={setHp} 
              keyboardType="numeric" 
            />
          </View>
        </View>

        <View style={s.inputGroup}>
          <Text style={s.label}>Price (USD)</Text>
          <View style={s.priceInputContainer}>
            <Text style={s.currencySymbol}>$</Text>
            <TextInput 
              style={s.priceInput} 
              placeholder="101,200" 
              placeholderTextColor="#9ca3af"
              value={price} 
              onChangeText={setPrice} 
              keyboardType="numeric" 
            />
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={s.buttonContainer}>
        {mode === 'create' ? (
          <TouchableOpacity 
            style={[s.button, s.primaryButton, loading && s.buttonDisabled]} 
            onPress={createCar} 
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={s.buttonText}>{loading ? 'Saving...' : '✓ Save Car'}</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity 
              style={[s.button, s.primaryButton, loading && s.buttonDisabled]} 
              onPress={updateCar} 
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={s.buttonText}>{loading ? 'Updating...' : '✓ Update Car'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[s.button, s.deleteButton, loading && s.buttonDisabled]} 
              onPress={deleteCar} 
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={s.deleteButtonText}>🗑️ Delete Car</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: '#f9fafb' 
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconText: {
    fontSize: 32,
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '400',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1.5, 
    borderColor: '#e5e7eb', 
    borderRadius: 12,
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    fontSize: 16, 
    backgroundColor: '#f9fafb',
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5, 
    borderColor: '#e5e7eb', 
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    paddingLeft: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 16,
    fontSize: 16,
    color: '#111827',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  deleteButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#ef4444',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});