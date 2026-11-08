export interface PriceEntry {
  id: string;
  store: string;
  date: string;
  regularPrice: number; // 정가 (0이면 미입력)
  paidPrice: number;    // 실제 구매가
  memo?: string;        // 특이사항 (1+1 행사, 쿠폰 할인 등)
  amount?: number;      // 번들 묶음이나 특별 용량일 경우 덮어쓰기 (없으면 상품 기본 용량)
}

export type UnitType = 'g' | 'ml' | 'count';

export interface Product {
  id: string;
  name: string;
  category: string;     // 예: 가공식품, 음료/생수, 신선식품, 생활용품 등
  amount: number;       // 기본 총 용량/수량
  unit: UnitType;       // g, ml, 개(count)
  photo?: string | null;// WebP 압축 base64 데이터 URI
  notes?: string;       // 상품 메모
  targetPrice?: number; // 목표 구매가 (기준 규격당 권장 가격)
  history: PriceEntry[];
  createdAt: string;
  updatedAt: string;
}

// 장보기 메모 / 체크리스트 아이템
export interface ShoppingListItem {
  id: string;
  productId?: string;   // 기존 등록 상품과 연동되어 있다면 상품 ID
  name: string;
  targetPrice?: number; // 목표 구매가 (예: 100g당 2000원 이하, 또는 총액)
  targetUnit?: string;  // 단위 라벨
  completed: boolean;   // 장바구니에 담았는지 여부
  memo?: string;        // 수량이나 메모
  createdAt: string;
}

// 100g 또는 100ml 또는 1개당 기준 환산 단위 가격
export function getStandardUnitPrice(product: Product, entry: PriceEntry): {
  unitPrice: number;          // 1 단위당 가격 (원/g 등)
  standardPrice: number;      // 100g, 100ml, 또는 1개당 가격
  standardUnitLabel: string;  // "100g", "100ml", "1개"
  discountAmount: number;
  discountRate: number;
} {
  const effectiveAmount = (entry.amount && entry.amount > 0) ? entry.amount : product.amount;
  const unitPrice = effectiveAmount > 0 ? entry.paidPrice / effectiveAmount : 0;
  
  let standardPrice = unitPrice;
  let standardUnitLabel = '1g';

  if (product.unit === 'g') {
    standardPrice = unitPrice * 100;
    standardUnitLabel = '100g';
  } else if (product.unit === 'ml') {
    standardPrice = unitPrice * 100;
    standardUnitLabel = '100ml';
  } else {
    standardPrice = unitPrice;
    standardUnitLabel = '1개';
  }

  const regular = entry.regularPrice > 0 ? entry.regularPrice : 0;
  const discountAmount = regular > entry.paidPrice ? regular - entry.paidPrice : 0;
  const discountRate = regular > 0 ? (discountAmount / regular) * 100 : 0;

  return {
    unitPrice,
    standardPrice,
    standardUnitLabel,
    discountAmount,
    discountRate,
  };
}

export function formatWon(val: number): string {
  return `${Math.round(val).toLocaleString('ko-KR')}원`;
}

export function formatStandardPrice(product: Product, entry: PriceEntry): string {
  const { standardPrice, standardUnitLabel } = getStandardUnitPrice(product, entry);
  return `${Math.round(standardPrice).toLocaleString('ko-KR')}원 / ${standardUnitLabel}`;
}
