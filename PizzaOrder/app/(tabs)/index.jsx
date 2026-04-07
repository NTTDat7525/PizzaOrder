import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { formatCurrency } from '@/utils/pricing';

const menuData = require('@/data/menu.json');

function ProductCard({ product, onPress }) {
  return (
    <Pressable style={styles.productCard} onPress={onPress}>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productDescription}>{product.description}</Text>
      <Text style={styles.productPrice}>From {formatCurrency(product.basePrice)}</Text>
      <Text style={styles.orderHint}>Tap to customize order</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  const categories = useMemo(() => [{ id: 'all', name: 'All' }, ...menuData.categories], []);

  const filteredProducts = useMemo(
    () =>
      selectedCategoryId === 'all'
        ? menuData.products
        : menuData.products.filter((product) => product.categoryId === selectedCategoryId),
    [selectedCategoryId]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Pizza Order</Text>
        <Text style={styles.subtitle}>Choose a category, then pick your favorite pizza.</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}>
          {categories.map((category) => {
            const isActive = category.id === selectedCategoryId;
            return (
              <Pressable
                key={category.id}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setSelectedCategoryId(category.id)}>
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productList}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => router.push(`/order/${item.id}`)} />
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No products in this category.</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1b1f3b',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#4c516d',
  },
  categoryRow: {
    gap: 10,
    paddingVertical: 16,
  },
  categoryChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#c9cde7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  categoryChipActive: {
    backgroundColor: '#283593',
    borderColor: '#283593',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2a2d43',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  productList: {
    paddingBottom: 24,
    gap: 12,
  },
  productCard: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 16,
    shadowColor: '#10204f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#17203a',
  },
  productDescription: {
    marginTop: 6,
    fontSize: 13,
    color: '#5b617d',
  },
  productPrice: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#0d47a1',
  },
  orderHint: {
    marginTop: 10,
    fontSize: 12,
    color: '#6e7493',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6e7493',
    marginTop: 24,
  },
});
