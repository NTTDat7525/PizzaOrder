import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useCart } from '@/contexts/cart-context';
import type { MenuData, Product, SelectedOptions } from '@/types/menu';
import { calculateUnitPrice, formatCurrency } from '@/utils/pricing';

const menuData = require('@/data/menu.json') as MenuData;

function getInitialOptions(product: Product): SelectedOptions {
  return product.optionGroups.reduce<SelectedOptions>((result, group) => {
    result[group.id] = group.options[0]?.id ?? '';
    return result;
  }, {});
}

export default function OrderDetailScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const product = menuData.products.find((item) => item.id === productId);
  const { addItem } = useCart();

  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(
    product ? getInitialOptions(product) : {}
  );
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);

  const unitPrice = useMemo(() => {
    if (!product) {
      return 0;
    }
    return calculateUnitPrice(product, selectedOptions, selectedAddOnIds);
  }, [product, selectedAddOnIds, selectedOptions]);

  const totalPrice = unitPrice * quantity;

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.fallbackBox}>
          <Text style={styles.fallbackTitle}>Product not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOnIds((prev) =>
      prev.includes(addOnId) ? prev.filter((id) => id !== addOnId) : [...prev, addOnId]
    );
  };

  const onAddToCart = () => {
    addItem({
      product,
      selectedOptions,
      selectedAddOnIds,
      quantity,
    });
    Alert.alert('Added to cart', `${product.name} was added to your cart.`);
    router.push('/explore');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <Text style={styles.basePrice}>Base price: {formatCurrency(product.basePrice)}</Text>

        {product.optionGroups.map((group) => (
          <View key={group.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            <View style={styles.optionWrap}>
              {group.options.map((option) => {
                const isSelected = selectedOptions[group.id] === option.id;
                return (
                  <Pressable
                    key={option.id}
                    style={[styles.optionChip, isSelected && styles.optionChipSelected]}
                    onPress={() =>
                      setSelectedOptions((prev) => ({
                        ...prev,
                        [group.id]: option.id,
                      }))
                    }>
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {option.name}
                    </Text>
                    <Text style={[styles.deltaText, isSelected && styles.optionTextSelected]}>
                      {option.priceDelta > 0 ? `+ ${formatCurrency(option.priceDelta)}` : 'Included'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add-ons</Text>
          <View style={styles.optionWrap}>
            {product.addOns.map((addOn) => {
              const isSelected = selectedAddOnIds.includes(addOn.id);
              return (
                <Pressable
                  key={addOn.id}
                  style={[styles.optionChip, isSelected && styles.optionChipSelected]}
                  onPress={() => toggleAddOn(addOn.id)}>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {addOn.name}
                  </Text>
                  <Text style={[styles.deltaText, isSelected && styles.optionTextSelected]}>
                    + {formatCurrency(addOn.price)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.quantityBox}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityRow}>
            <Pressable
              style={styles.quantityButton}
              onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}>
              <Text style={styles.quantityButtonText}>-</Text>
            </Pressable>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <Pressable style={styles.quantityButton} onPress={() => setQuantity((prev) => prev + 1)}>
              <Text style={styles.quantityButtonText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Unit price</Text>
          <Text style={styles.summaryValue}>{formatCurrency(unitPrice)}</Text>
          <Text style={[styles.summaryLabel, styles.summaryLabelMargin]}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
        </View>

        <Pressable style={styles.addButton} onPress={onAddToCart}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f5f1',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#2d1f1a',
  },
  description: {
    marginTop: 8,
    color: '#6a584f',
    fontSize: 14,
  },
  basePrice: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#7f2704',
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2b211e',
    marginBottom: 10,
  },
  optionWrap: {
    gap: 10,
  },
  optionChip: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3d8d1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionChipSelected: {
    backgroundColor: '#8c2f00',
    borderColor: '#8c2f00',
  },
  optionText: {
    color: '#342722',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#fff7f1',
  },
  deltaText: {
    color: '#6f5a50',
    fontSize: 12,
    fontWeight: '500',
  },
  quantityBox: {
    marginTop: 20,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0e0d7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 22,
    lineHeight: 24,
    color: '#7a300d',
    fontWeight: '700',
  },
  quantityValue: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#39241a',
  },
  summaryBox: {
    marginTop: 20,
    borderRadius: 14,
    backgroundColor: '#fff2e7',
    borderWidth: 1,
    borderColor: '#f3d8c4',
    padding: 14,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#7f6352',
  },
  summaryLabelMargin: {
    marginTop: 8,
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700',
    color: '#4b2d1f',
  },
  totalValue: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: '900',
    color: '#8c2f00',
  },
  addButton: {
    marginTop: 20,
    borderRadius: 14,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    paddingVertical: 14,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  fallbackBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#312018',
  },
  backButton: {
    borderRadius: 8,
    backgroundColor: '#2e7d32',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});