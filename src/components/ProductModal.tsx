import React, { useState, useEffect } from 'react';
import { Product, UnitType } from '../types';
import { compressImage } from '../storage';
import {
  X,
  Upload,
  Calendar,
  Store,
  Tag,
  DollarSign,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialProduct?: Product | null;
}

const CATEGORIES = [
  '음료/생수',
  '정육/계란',
  '신선/채소·과일',
  '수산/건어물',
  '유제품/냉장',
  '가공식품/라면',
  '간식/베이커리',
  '생활/세제·위생',
  '건강/영양제',
  '기타',
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState<number | ''>('');
  const [unit, setUnit] = useState<UnitType>('g');
  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // Initial purchase entry (for new products)
  const [store, setStore] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [regularPrice, setRegularPrice] = useState<number | ''>('');
  const [paidPrice, setPaidPrice] = useState<number | ''>('');
  const [memo, setMemo] = useState('');

  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setCategory(initialProduct.category || CATEGORIES[0]);
      setAmount(initialProduct.amount);
      setUnit(initialProduct.unit);
      setPhoto(initialProduct.photo || null);
      setNotes(initialProduct.notes || '');
    } else {
      setName('');
      setCategory(CATEGORIES[0]);
      setAmount('');
      setUnit('g');
      setPhoto(null);
      setNotes('');
      setStore('');
      setDate(new Date().toISOString().slice(0, 10));
      setRegularPrice('');
      setPaidPrice('');
      setMemo('');
    }
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
    } catch {
      alert('이미지를 불러오지 못했습니다. 다른 사진을 선택해 주세요.');
    } finally {
      setIsCompressing(false);
    }
  };

  // Preview live unit calculations
  const numAmount = typeof amount === 'number' ? amount : 0;
  const numPaid = typeof paidPrice === 'number' ? paidPrice : 0;
  const numRegular = typeof regularPrice === 'number' ? regularPrice : 0;

  let unitPreview = '-';
  if (numAmount > 0 && numPaid > 0) {
    if (unit === 'g' || unit === 'ml') {
      const per100 = (numPaid / numAmount) * 100;
      unitPreview = `${Math.round(per100).toLocaleString('ko-KR')}원 / 100${unit}`;
    } else {
      unitPreview = `${Math.round(numPaid / numAmount).toLocaleString('ko-KR')}원 / 1개`;
    }
  }

  const discountAmount = numRegular > numPaid ? numRegular - numPaid : 0;
  const discountRate = numRegular > 0 && discountAmount > 0 ? (discountAmount / numRegular) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('상품명을 입력해 주세요.');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      alert('총 용량/수량을 0보다 크게 입력해 주세요.');
      return;
    }

    if (initialProduct) {
      // Edit existing product meta
      const updated: Product = {
        ...initialProduct,
        name: name.trim(),
        category,
        amount: numAmount,
        unit,
        photo,
        notes: notes.trim(),
        updatedAt: new Date().toISOString(),
      };
      onSave(updated);
    } else {
      // New product with initial purchase history
      if (!numPaid || numPaid < 0) {
        alert('첫 구매 가격을 입력해 주세요.');
        return;
      }
      const newProduct: Product = {
        id: crypto.randomUUID(),
        name: name.trim(),
        category,
        amount: numAmount,
        unit,
        photo,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [
          {
            id: crypto.randomUUID(),
            store: store.trim() || '구매처 미입력',
            date: date || new Date().toISOString().slice(0, 10),
            regularPrice: numRegular,
            paidPrice: numPaid,
            memo: memo.trim(),
          },
        ],
      };
      onSave(newProduct);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {initialProduct ? '상품 정보 수정' : '새 상품 등록'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {initialProduct ? '상품 규격 및 카테고리를 변경합니다.' : '기본 용량과 첫 구매 가격을 기록해 두세요.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                상품명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 코카콜라 제로 1.5L, 삼겹살 600g"
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  카테고리
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  기준 단위 규격 <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="예: 500, 1000"
                    className="flex-1 px-3 py-2.5 text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as UnitType)}
                    className="w-24 px-2 py-2.5 text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="g">그램 (g)</option>
                    <option value="ml">밀리리터 (ml)</option>
                    <option value="count">개 / 팩</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Photo & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  상품 사진 (선택)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition-colors border border-dashed border-slate-300 dark:border-slate-700">
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span>{photo ? '사진 변경' : '사진 첨부'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {photo && (
                    <div className="relative group">
                      <img
                        src={photo}
                        alt="미리보기"
                        className="w-11 h-11 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setPhoto(null)}
                        className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 shadow hover:bg-rose-600"
                        title="사진 제거"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {isCompressing && <span className="text-xs text-sky-600">압축 중...</span>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  상품 메모 (선택)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="예: 100g당 2,500원 이하 권장"
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: First Purchase Entry (Only for new product creation) */}
          {!initialProduct && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  첫 구매 기록 등록
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  등록과 동시에 첫 가격이 저장됩니다.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    구매처
                  </label>
                  <input
                    type="text"
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                    placeholder="예: 이마트, 쿠팡, 동네 슈퍼"
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    구매 날짜 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    정가 / 권장소비자가 (원)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="모르면 비워두세요"
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    실제 구매가 (원) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    required
                    value={paidPrice}
                    onChange={(e) => setPaidPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="예: 9900"
                    className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  행사 / 특이사항 메모 (선택)
                </label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="예: 2+1 행사, 카드사 청구할인 5%"
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Real-time Calculation Summary Box */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-sky-50/70 dark:bg-sky-950/30 rounded-xl border border-sky-100 dark:border-sky-900/40 text-center">
                <div>
                  <div className="text-[11px] text-sky-700 dark:text-sky-300 font-medium">단위 환산가</div>
                  <div className="text-xs sm:text-sm font-bold text-sky-950 dark:text-sky-200 tabular-nums mt-0.5">
                    {unitPreview}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-sky-700 dark:text-sky-300 font-medium">할인 금액</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
                    {discountAmount > 0 ? `${Math.round(discountAmount).toLocaleString('ko-KR')}원` : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-sky-700 dark:text-sky-300 font-medium">할인율</div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                    {discountRate > 0 ? `${discountRate.toFixed(1)}%` : '-'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:scale-[0.98] rounded-xl shadow-sm transition-all"
            >
              {initialProduct ? '변경사항 저장' : '상품 등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
