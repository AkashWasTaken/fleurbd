import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  serverTimestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { Product, Order, StoreSettings } from '../types';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const SETTINGS_COLLECTION = 'settings';
const CONFIG_COLLECTION = 'config';

export const authService = {
  async verifyAdminPassword(password: string) {
    try {
      const configRef = doc(db, CONFIG_COLLECTION, 'security');
      const configSnap = await getDoc(configRef);
      
      if (!configSnap.exists()) {
        // Initialize with default requested password if config doesn't exist
        await setDoc(configRef, { 
          adminPassword: password === 'akashchowa67' ? 'akashchowa67' : 'akashchowa67',
          updatedAt: serverTimestamp() 
        });
        return password === 'akashchowa67';
      }
      
      const data = configSnap.data();
      return data.adminPassword === password;
    } catch (error) {
      handleFirestoreError(error, 'get', `${CONFIG_COLLECTION}/security`);
      return false;
    }
  },

  setAdminSession() {
    localStorage.setItem('fleur_admin_auth', 'true');
  },

  isAdminAuthenticated() {
    return localStorage.getItem('fleur_admin_auth') === 'true';
  },

  logout() {
    localStorage.removeItem('fleur_admin_auth');
  }
};

export const productService = {
  async getProducts(filters: { category?: string, featured?: boolean, search?: string, showInactive?: boolean } = {}) {
    try {
      const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
      
      if (filters.category && filters.category !== 'all') {
        constraints.push(where('category', '==', filters.category));
      }
      
      if (filters.featured) {
        constraints.push(where('featured', '==', true));
      }

      // Hide inactive products by default unless explicitly requested (for Admin)
      if (!filters.showInactive) {
        constraints.push(where('active', '==', true));
      }

      const q = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
      const snapshot = await getDocs(q);
      
      let products = snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, _id: doc.id, ...data } as Product;
      });

      if (filters.search) {
        const term = filters.search.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(term));
      }

      return products;
    } catch (error) {
      handleFirestoreError(error, 'list', PRODUCTS_COLLECTION);
    }
  },

  async getProductBySlug(slug: string) {
    try {
      const q = query(collection(db, PRODUCTS_COLLECTION), where('slug', '==', slug), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const d = snapshot.docs[0];
      const data = d.data();
      return { id: d.id, _id: d.id, ...data } as Product;
    } catch (error) {
      handleFirestoreError(error, 'get', `${PRODUCTS_COLLECTION}/${slug}`);
    }
  },

  async addProduct(product: Partial<Product>) {
    try {
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, 'create', PRODUCTS_COLLECTION);
    }
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, 'update', `${PRODUCTS_COLLECTION}/${id}`);
    }
  },

  async deleteProduct(id: string) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, 'delete', `${PRODUCTS_COLLECTION}/${id}`);
    }
  }
};

export const orderService = {
  async createOrder(order: Partial<Order>) {
    try {
      const orderNumber = `FLEUR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
        ...order,
        orderNumber,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, orderNumber };
    } catch (error) {
      handleFirestoreError(error, 'create', ORDERS_COLLECTION);
    }
  },

  async getOrders() {
    try {
      const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          _id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
          deliveredAt: data.deliveredAt?.toDate?.() ? data.deliveredAt.toDate().toISOString() : data.deliveredAt,
        } as Order;
      });
    } catch (error) {
      handleFirestoreError(error, 'list', ORDERS_COLLECTION);
    }
  },

  async getOrdersByNumbers(numbers: string[]) {
    if (!numbers.length) return [];
    try {
      const q = query(collection(db, ORDERS_COLLECTION), where('orderNumber', 'in', numbers));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          _id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
          deliveredAt: data.deliveredAt?.toDate?.() ? data.deliveredAt.toDate().toISOString() : data.deliveredAt,
        } as Order;
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      handleFirestoreError(error, 'list', ORDERS_COLLECTION);
    }
  },

  async updateOrder(id: string, updates: Partial<Order>) {
    try {
      const docRef = doc(db, ORDERS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, 'update', `${ORDERS_COLLECTION}/${id}`);
    }
  },

  async deleteOrder(id: string) {
    try {
      const docRef = doc(db, ORDERS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, 'delete', `${ORDERS_COLLECTION}/${id}`);
    }
  }
};

export const settingsService = {
  async getSettings() {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, 'main');
      const snapshot = await getDoc(docRef);
      
      const defaultSettings: StoreSettings = {
        storeName: "fleur",
        tagline: "A symphony of budget-friendly elegance",
        whatsapp: "017XXXXXXXX",
        bkashNumber: "017XXXXXXXX",
        nagadNumber: "",
        bankName: "",
        bankAccountName: "",
        bankAccountNumber: "",
        bankRoutingNumber: "",
        freeDeliveryAbove: 999999, // Essentially disabled as per user "no free shipping"
        flatDeliveryCharge: 70,
        outsideDhakaCharge: 130,
        contactNumber: "017XXXXXXXX",
        instagramUrl: "https://instagram.com",
        facebookUrl: "https://facebook.com",
        announcementText: "New arrivals weekly • Based in Dhaka",
        announcementActive: false,
        categories: ['jewelry', 'bangles', 'fashion', 'nails']
      };

      if (!snapshot.exists()) {
        return defaultSettings;
      }

      return { ...defaultSettings, ...snapshot.data() } as StoreSettings;
    } catch (error) {
      handleFirestoreError(error, 'get', `${SETTINGS_COLLECTION}/main`);
    }
  },

  async updateSettings(updates: Partial<StoreSettings>) {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, 'main');
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, updates);
      } else {
        await updateDoc(docRef, updates);
      }
    } catch (error) {
      handleFirestoreError(error, 'update', `${SETTINGS_COLLECTION}/main`);
    }
  }
};
