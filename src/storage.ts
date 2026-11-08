import { Product, ShoppingListItem } from './types';

const DB_NAME = 'shopping-cal-history';
const STORE_PRODUCTS = 'products';
const STORE_SHOPPING_LIST = 'shopping_list';
const DB_VERSION = 3;

// Initial sample data if storage is empty
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'sample-water',
    name: '삼다수 생수 2L 6개입',
    category: '음료/생수',
    amount: 12000,
    unit: 'ml',
    photo: null,
    notes: '가정용 주 생수. 100ml당 45원 이하일 때 특가!',
    targetPrice: 5400,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-11-02T12:00:00.000Z',
    history: [
      {
        id: 'h-1',
        store: '이마트 트레이더스',
        date: '2026-10-02',
        regularPrice: 6500,
        paidPrice: 5380,
        memo: '묶음 할인 프로모션',
      },
      {
        id: 'h-2',
        store: '쿠팡 로켓배송',
        date: '2026-10-18',
        regularPrice: 6200,
        paidPrice: 5900,
        memo: '정기배송 5% 할인',
      },
      {
        id: 'h-3',
        store: '동네 하나로마트',
        date: '2026-11-02',
        regularPrice: 6400,
        paidPrice: 4980,
        memo: '주말 깜짝 타임세일 (역대 최저)',
      },
    ],
  },
  {
    id: 'sample-pork',
    name: '국내산 냉장 삼겹살 구이용',
    category: '정육/계란',
    amount: 600,
    unit: 'g',
    photo: null,
    notes: '100g당 2,100원 이하면 바로 구입하기',
    targetPrice: 12600,
    createdAt: '2026-10-10T09:00:00.000Z',
    updatedAt: '2026-11-05T17:30:00.000Z',
    history: [
      {
        id: 'h-4',
        store: '롯데마트',
        date: '2026-10-10',
        regularPrice: 16800,
        paidPrice: 14400,
        memo: '엘포인트 적립 할인 (100g 2,400원)',
      },
      {
        id: 'h-5',
        store: '전통시장 정육점',
        date: '2026-11-05',
        regularPrice: 14000,
        paidPrice: 12000,
        memo: '온누리상품권 10% 추가 체감',
      },
    ],
  },
  {
    id: 'sample-detergent',
    name: '퍼실 파워젤 세탁세제 리필',
    category: '생활용품',
    amount: 2700,
    unit: 'ml',
    photo: null,
    notes: '2.7L 대용량 리필팩. 100ml당 450원 기준',
    targetPrice: 12150,
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-10-25T14:15:00.000Z',
    history: [
      {
        id: 'h-6',
        store: '홈플러스',
        date: '2026-09-15',
        regularPrice: 17900,
        paidPrice: 14900,
        memo: '1+1 전단지 행사',
      },
      {
        id: 'h-7',
        store: '네이버 공식몰',
        date: '2026-10-25',
        regularPrice: 16500,
        paidPrice: 11900,
        memo: '라이브 방송 알림 쿠폰 적용',
      },
    ],
  },
];

export const SAMPLE_SHOPPING_LIST: ShoppingListItem[] = [
  {
    id: 'item-1',
    productId: 'sample-water',
    name: '삼다수 생수 2L 6개입',
    targetPrice: 5000,
    targetUnit: '100ml당 41원 이하',
    completed: false,
    memo: '다 떨어져감! 5천원대 보이면 바로 구입',
    createdAt: '2026-11-07T12:00:00.000Z',
  },
  {
    id: 'item-2',
    productId: 'sample-pork',
    name: '국내산 냉장 삼겹살 구이용',
    targetPrice: 13000,
    targetUnit: '100g당 2,160원 이하',
    completed: true,
    memo: '주말 바베큐 파티용 2근',
    createdAt: '2026-11-07T14:30:00.000Z',
  },
  {
    id: 'item-3',
    name: '대파 1단',
    targetPrice: 2000,
    targetUnit: '1단',
    completed: false,
    memo: '싱싱한 흙대파로 고르기',
    createdAt: '2026-11-07T18:00:00.000Z',
  },
];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
        db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SHOPPING_LIST)) {
        db.createObjectStore(STORE_SHOPPING_LIST, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const db = await openDB();
    const items = await new Promise<Product[]>((resolve, reject) => {
      const tx = db.transaction(STORE_PRODUCTS, 'readonly');
      const store = tx.objectStore(STORE_PRODUCTS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (items.length === 0) {
      for (const p of SAMPLE_PRODUCTS) {
        await saveProduct(p);
      }
      return SAMPLE_PRODUCTS;
    }
    return items;
  } catch (err) {
    console.error('Failed to load products from IndexedDB', err);
    return SAMPLE_PRODUCTS;
  }
}

export async function saveProduct(product: Product): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
      const store = tx.objectStore(STORE_PRODUCTS);
      const req = store.put(product);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save product in IndexedDB', err);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
      const store = tx.objectStore(STORE_PRODUCTS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete from IndexedDB', err);
  }
}

// Shopping list operations
export async function getShoppingList(): Promise<ShoppingListItem[]> {
  try {
    const db = await openDB();
    const items = await new Promise<ShoppingListItem[]>((resolve, reject) => {
      const tx = db.transaction(STORE_SHOPPING_LIST, 'readonly');
      const store = tx.objectStore(STORE_SHOPPING_LIST);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (items.length === 0) {
      for (const item of SAMPLE_SHOPPING_LIST) {
        await saveShoppingListItem(item);
      }
      return SAMPLE_SHOPPING_LIST;
    }
    return items;
  } catch (err) {
    console.error('Failed to load shopping list', err);
    return SAMPLE_SHOPPING_LIST;
  }
}

export async function saveShoppingListItem(item: ShoppingListItem): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_SHOPPING_LIST, 'readwrite');
      const store = tx.objectStore(STORE_SHOPPING_LIST);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save shopping item', err);
  }
}

export async function deleteShoppingListItem(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_SHOPPING_LIST, 'readwrite');
      const store = tx.objectStore(STORE_SHOPPING_LIST);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete shopping item', err);
  }
}

export async function clearCompletedShoppingList(): Promise<void> {
  const all = await getShoppingList();
  for (const item of all) {
    if (item.completed) {
      await deleteShoppingListItem(item.id);
    }
  }
}

// Compress user image to WebP or JPEG thumbnail data URL
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxSide = 400;
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error('Canvas context failed'));
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      
      let quality = 0.85;
      let data = canvas.toDataURL('image/webp', quality);
      if (!data.startsWith('data:image/webp')) {
        data = canvas.toDataURL('image/jpeg', quality);
      }
      while (data.length > 180000 && quality > 0.45) {
        quality -= 0.1;
        data = canvas.toDataURL('image/webp', quality);
      }
      resolve(data);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to read image'));
    };
    img.src = url;
  });
}
