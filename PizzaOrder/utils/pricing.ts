import type { Product, SelectedOptions } from '@/types/menu';

export function calculateUnitPrice(
  product: Product,
  selectedOptions: SelectedOptions,
  selectedAddOnIds: string[]
): number {
  const optionDelta = product.optionGroups.reduce((sum, group) => {
    const selectedId = selectedOptions[group.id];
    const selectedOption = group.options.find((option) => option.id === selectedId);
    return sum + (selectedOption?.priceDelta ?? 0);
  }, 0);

  const addOnTotal = product.addOns
    .filter((addOn) => selectedAddOnIds.includes(addOn.id))
    .reduce((sum, addOn) => sum + addOn.price, 0);

  return product.basePrice + optionDelta + addOnTotal;
}

export function formatCurrency(amount: number): string {
  return `VND ${amount.toLocaleString('vi-VN')}`;
}

export function buildCartItemKey(
  productId: string,
  selectedOptions: SelectedOptions,
  selectedAddOnIds: string[]
): string {
  const optionParts = Object.keys(selectedOptions)
    .sort()
    .map((groupId) => `${groupId}:${selectedOptions[groupId]}`)
    .join('|');

  const addOnParts = [...selectedAddOnIds].sort().join('|');

  return `${productId}__${optionParts}__${addOnParts}`;
}