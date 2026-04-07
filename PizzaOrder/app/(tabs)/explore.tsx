import { StyleSheet, Text, View, Pressable, FlatList, SafeAreaView } from 'react-native';

import { useCart } from '@/contexts/cart-context';
import type { MenuData, Product } from '@/types/menu';
import { formatCurrency } from '@/utils/pricing';

const menuData = require('@/data/menu.json') as MenuData;

function findProduct(productId: string): Product | undefined {
  return menuData.products.find((product) => product.id === productId);
}

export default function CartScreen() {
  const { items, totalAmount, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Your Cart</Text>
          {items.length > 0 && (
            <Pressable onPress={clearCart}>
              <Text style={styles.clearText}>Clear all</Text>
            </Pressable>
          )}
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const product = findProduct(item.productId);
            const optionSummary = product
              ? product.optionGroups
                  .map((group) => {
                    const optionId = item.selectedOptions[group.id];
                    const option = group.options.find((value) => value.id === optionId);
                    return option ? `${group.title}: ${option.name}` : null;
                  })
                  .filter(Boolean)
                  .join(' | ')
              : '';

            const addOnSummary = product
              ? product.addOns
                  .filter((addOn) => item.selectedAddOnIds.includes(addOn.id))
                  .map((addOn) => addOn.name)
                  .join(', ')
              : '';

            return (
              <View style={styles.itemCard}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>{optionSummary || 'Default options'}</Text>
                <Text style={styles.itemMeta}>{addOnSummary ? `Add-ons: ${addOnSummary}` : 'No add-ons'}</Text>

                <View style={styles.itemBottomRow}>
                  <View style={styles.qtyRow}>
                    <Pressable
                      style={styles.qtyButton}
                      onPress={() => updateQuantity(item.key, item.quantity - 1)}>
                      <Text style={styles.qtyButtonText}>-</Text>
                    </Pressable>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <Pressable
                      style={styles.qtyButton}
                      onPress={() => updateQuantity(item.key, item.quantity + 1)}>
                      <Text style={styles.qtyButtonText}>+</Text>
                    </Pressable>
                  </View>

                  <View style={styles.priceColumn}>
                    <Text style={styles.unitPrice}>{formatCurrency(item.unitPrice)} each</Text>
                    <Text style={styles.linePrice}>{formatCurrency(item.lineTotal)}</Text>
                  </View>
                </View>

                <Pressable onPress={() => removeItem(item.key)}>
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Cart is empty</Text>
              <Text style={styles.emptySub}>Go to Home and add pizza to start an order.</Text>
            </View>
          }
        />

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Order Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7ff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1b1f3b',
  },
  clearText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 14,
    gap: 10,
  },
  itemCard: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
    padding: 14,
    borderWidth: 1,
    borderColor: '#e1e5f6',
  },
  itemName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#192247',
  },
  itemMeta: {
    marginTop: 5,
    color: '#626b8f',
    fontSize: 12,
  },
  itemBottomRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#e7ebfb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3568',
  },
  qtyValue: {
    minWidth: 20,
    textAlign: 'center',
    fontWeight: '700',
    color: '#232a4a',
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  unitPrice: {
    fontSize: 11,
    color: '#66709b',
  },
  linePrice: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '800',
    color: '#0b4a9a',
  },
  removeText: {
    marginTop: 12,
    color: '#b3261e',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyBox: {
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e5f6',
    padding: 20,
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2e3558',
  },
  emptySub: {
    marginTop: 8,
    color: '#69729a',
  },
  totalBox: {
    borderRadius: 14,
    backgroundColor: '#1f2a59',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: '#d5dcff',
    fontSize: 14,
  },
  totalValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
});
