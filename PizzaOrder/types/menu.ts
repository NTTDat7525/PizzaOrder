export type Category = {
  id: string;
  name: string;
};

export type ProductOption = {
  id: string;
  name: string;
  priceDelta: number;
};

export type ProductOptionGroup = {
  id: string;
  title: string;
  required: boolean;
  options: ProductOption[];
};

export type ProductAddOn = {
  id: string;
  name: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  optionGroups: ProductOptionGroup[];
  addOns: ProductAddOn[];
};

export type MenuData = {
  categories: Category[];
  products: Product[];
};

export type SelectedOptions = Record<string, string>;

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  basePrice: number;
  selectedOptions: SelectedOptions;
  selectedAddOnIds: string[];
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};