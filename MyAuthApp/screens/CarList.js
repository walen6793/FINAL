// screens/CarList.js
import React, { useEffect, useState, useLayoutEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const BASE_URL = Platform.select({
    android: 'http://192.168.1.110:3001',
    ios: 'http://192.168.1.110:3001',
    web: 'http://192.168.1.110:3001',
    default: 'http://192.168.1.110:3001',
});

export default function CarList() {
    const nav = useNavigation();

    const [allCars, setAllCars] = useState([]); // เก็บข้อมูลทั้งหมด
    const [cars, setCars] = useState([]); // เก็บข้อมูลที่แสดง (หลัง filter)
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [err, setErr] = useState('');
    const typingTimer = useRef(null);

    const currency = (n) => {
        const num = Number(n);
        return Number.isNaN(num)
            ? String(n ?? '')
            : num.toLocaleString(undefined, { maximumFractionDigits: 0 });
    };

    // ฟังก์ชัน filter ข้อมูลในฝั่ง client
    const filterCars = useCallback((data, keyword) => {
        if (!keyword || keyword.trim() === '') {
            return data;
        }

        const search = keyword.toLowerCase().trim();
        
        return data.filter(car => {
            const make = String(car.make || '').toLowerCase();
            const model = String(car.model || '').toLowerCase();
            const year = String(car.year || '');
            const hp = String(car.horsepower || '');
            const price = String(car.price || '');

            return (
                make.includes(search) ||
                model.includes(search) ||
                year.includes(search) ||
                hp.includes(search) ||
                price.includes(search)
            );
        });
    }, []);

    const fetchCars = async () => {
        try {
            setErr('');
            setLoading(true);
            const url = `${BASE_URL}/cars?_sort=id&_order=asc&_limit=9999`;

            const res = await fetch(url, { headers: { 'Cache-Control': 'no-store' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            
            const data = await res.json();
            const carData = Array.isArray(data) ? data : [];
            
            setAllCars(carData);
            setCars(filterCars(carData, q));
        } catch (e) {
            setErr(`โหลดข้อมูลไม่สำเร็จ: ${e.message}`);
            setAllCars([]);
            setCars([]);
        } finally {
            setLoading(false);
        }
    };

    // โหลดแรกเข้า
    useEffect(() => {
        fetchCars();
        return () => {
            if (typingTimer.current) clearTimeout(typingTimer.current);
        };
    }, []);

    // รีโหลดเมื่อโฟกัสกลับมาหน้านี้
    useFocusEffect(
        useCallback(() => {
            fetchCars();
            return undefined;
        }, [])
    );

    // Pull to refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchCars();
        setRefreshing(false);
    }, []);

    // Header
    useLayoutEffect(() => {
        nav.setOptions({
            headerTitle: 'Sports Cars',
            headerRight: () => (
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                        onPress={() => nav.navigate('CarStats')}
                        activeOpacity={0.8}
                        style={styles.hBtn}
                    >
                        <Text style={[styles.hBtnText, { color: '#2563eb' }]}>📊 Stats</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => nav.navigate('CarForm', { mode: 'create' })}
                        activeOpacity={0.8}
                        style={[styles.hBtn, { paddingRight: 14 }]}
                    >
                        <Text style={[styles.hBtnText, { color: '#10b981' }]}>+ Add</Text>
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [nav]);

    const renderItem = ({ item, index }) => (
        <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.card, index === 0 && { marginTop: 6 }]}
            onPress={() => nav.navigate('CarForm', { mode: 'edit', car: item })}
        >
            <View style={styles.carIcon}>
                <Text style={styles.carIconText}>🏎️</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                    {item.make} {item.model}
                </Text>
                <Text style={styles.year}>Year {item.year}</Text>
                <View style={styles.metaRow}>
                    <View style={styles.chip}>
                        <Text style={styles.chipText}>⚡ {Number(item.horsepower) || 0} hp</Text>
                    </View>
                    <View style={[styles.chip, styles.priceChip]}>
                        <Text style={styles.priceText}>${currency(item.price)}</Text>
                    </View>
                </View>
            </View>
            <Text style={styles.chev}>›</Text>
        </TouchableOpacity>
    );

    const onChangeSearch = (text) => {
        setQ(text);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        
        // Filter ทันทีถ้าข้อมูลมีอยู่แล้ว
        typingTimer.current = setTimeout(() => {
            setCars(filterCars(allCars, text));
        }, 300);
    };

    // Loading state
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading cars...</Text>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            {/* Search */}
            <View style={styles.searchWrap}>
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        value={q}
                        onChangeText={onChangeSearch}
                        placeholder="Search by make, model, year, hp, or price..."
                        placeholderTextColor="#9ca3af"
                        style={styles.search}
                        returnKeyType="search"
                        clearButtonMode="while-editing"
                    />
                </View>
                {q.trim() !== '' && (
                    <Text style={styles.resultCount}>
                        Found {cars.length} {cars.length === 1 ? 'car' : 'cars'}
                    </Text>
                )}
            </View>

            {!!err && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>⚠️ {err}</Text>
                </View>
            )}

            {/* List */}
            <FlatList
                data={cars}
                style={{ flex: 1 }}
                keyExtractor={(it, idx) => (it?.id != null ? String(it.id) : `row-${idx}`)}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        tintColor="#3b82f6"
                        colors={['#3b82f6']}
                    />
                }
                initialNumToRender={16}
                maxToRenderPerBatch={24}
                windowSize={10}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🚗</Text>
                        <Text style={styles.emptyTitle}>No cars found</Text>
                        <Text style={styles.emptySubtitle}>
                            {q.trim() !== '' 
                                ? 'Try a different search term' 
                                : 'Add your first car to get started'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#f9fafb' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' },
    loadingText: { marginTop: 12, fontSize: 15, color: '#6b7280', fontWeight: '500' },

    // Header buttons
    hBtn: { paddingHorizontal: 12, paddingVertical: 6 },
    hBtnText: { fontWeight: '700', fontSize: 15 },

    // Search
    searchWrap: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        borderRadius: 14,
        paddingHorizontal: 14,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    search: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
        color: '#111827',
    },
    resultCount: {
        marginTop: 8,
        marginLeft: 4,
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500',
    },

    // Item card
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    carIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    carIconText: {
        fontSize: 24,
    },
    title: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 2 },
    year: { color: '#6b7280', fontWeight: '500', fontSize: 13, marginBottom: 8 },
    metaRow: { flexDirection: 'row', gap: 8 },
    chip: {
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    chipText: {
        color: '#374151',
        fontSize: 12,
        fontWeight: '600',
    },
    priceChip: {
        backgroundColor: '#ecfdf5',
        borderColor: '#86efac',
    },
    priceText: {
        color: '#059669',
        fontSize: 12,
        fontWeight: '700',
    },
    chev: { fontSize: 28, marginLeft: 8, color: '#d1d5db', fontWeight: '300' },

    // Error
    errorContainer: {
        marginHorizontal: 12,
        marginBottom: 8,
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
        borderRadius: 10,
        padding: 12,
    },
    errorText: { color: '#dc2626', fontSize: 14, fontWeight: '500' },

    // Empty state
    emptyContainer: {
        paddingTop: 60,
        paddingHorizontal: 40,
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
    },
});