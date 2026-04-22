export interface Product {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images: { url: string; publicId?: string }[];
  featured: boolean;
  active: boolean;
  tags: string[];
  instagramUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  _id?: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    area: 'inside-dhaka' | 'outside-dhaka';
    notes?: string;
  };
  items: {
    productId: string;
    name: string;
    price: number;
    qty: number;
    image: string;
  }[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: 'COD' | 'bKash' | 'Nagad' | 'Bank';
  transactionId?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  internalNote?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsapp: string;
  bkashNumber: string;
  nagadNumber: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  freeDeliveryAbove: number;
  flatDeliveryCharge: number;
  outsideDhakaCharge: number;
  contactNumber: string;
  instagramUrl: string;
  facebookUrl: string;
  announcementText: string;
  announcementActive: boolean;
  categories: string[];
}
