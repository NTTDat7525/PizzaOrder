export function calculateUnitPrice(product, selectedOptions, selectedAddOnIds) {
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

export function formatCurrency(amount) {
  return `VND ${amount.toLocaleString('vi-VN')}`;
}

export function buildCartItemKey(productId, selectedOptions, selectedAddOnIds) {
  const optionParts = Object.keys(selectedOptions)
    .sort()
    .map((groupId) => `${groupId}:${selectedOptions[groupId]}`)
    .join('|');

  const addOnParts = [...selectedAddOnIds].sort().join('|');

  return `${productId}__${optionParts}__${addOnParts}`;
}
