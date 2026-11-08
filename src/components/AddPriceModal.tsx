import React, { useState } from 'react';
import { Product, PriceEntry, getStandardUnitPrice } from '../types';
import { X, Plus, Calendar, Store, Tag } from 'lucide-react';

interface AddPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddPrice: (productId: string, entry: PriceEntry) => void;
}

export const AddPriceModal: React.FC<AddPriceModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddPrice,
}) => {
  const [store, setStore] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [regularPrice, setRegularPrice] = useState<number | ''>('');
  const [paidPrice, setPaidPrice] = useState<number | ''>('');
  const [overrideAmount, setOverrideAmount] = useState<number | ''>('');
  const [memo, setMemo] = useState('');

  if (!isOpen || !product) return null;

  const currentAmount = typeof overrideAmount === 'number' && overrideAmount > 0 ? overrideAmount : product.amount;
  const numPaid = typeof paidPrice === 'number' ? paidPrice : 0;
  const numRegular = typeof regularPrice === 'number' ? regularPrice : 0;

  const dummyEntry: PriceEntry = {
    id: 'preview',
    store: store || '구매처',
    date,
    regularPrice: numRegular,
    paidPrice: numPaid,
    amount: currentAmount,
  };

  const { standardPrice, standardUnitLabel, discountAmount, discountRate } = getStandardUnitPrice(
    product,
    dummyEntry
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numPaid || numPaid < 0) {
      alert('실제 구매가를 올바르게 입력해 주세요.');
      return;
    }

    const newEntry: PriceEntry = {
      id: crypto.randomUUID(),
      store: store.trim() || '구매처 미입력',
      date: date || new Date().toISOString().slice(0, 10),
      regularPrice: numRegular,
      paidPrice: numPaid,
      memo: memo.trim(),
      amount: typeof overrideAmount === 'number' && overrideAmount > 0 ? overrideAmount : undefined,
    };

    onAddPrice(product.id, newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{product.name}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              기준 규격: {product.amount.toLocaleString()} {product.unit} · 새 구매 가격 추가
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                구매처
              </label>
              <input
                type="text"
                value={store}
                onChange={(e) => setStore(e.target.value)}
                placeholder="예: 이마트, 마켓컬리, 코스트코"
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
                정가 / 정상가 (원)
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
                placeholder="예: 8900"
                className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white tabular-nums"
              />
            </div>
          </div>

          {/* Optional 용량 변경 (대용량 기획세트 등) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                구매 용량 ({product.unit})
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={overrideAmount}
                onChange={(e) => setOverrideAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={`기본 ${product.amount}${product.unit}`}
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                이번에 다른 용량(대용량 묶음 등)을 샀다면 입력
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                행사 내용 / 메모 (선택)
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="예: 현대카드 7% 청구할인, 1+1"
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Real-time Calculation Summary Box */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-sky-50/70 dark:bg-sky-950/30 rounded-xl border border-sky-100 dark:border-sky-900/40 text-center">
            <div>
              <div className="text-[11px] text-sky-700 dark:text-sky-300 font-medium">단위 환산가</div>
              <div className="text-xs sm:text-sm font-bold text-sky-950 dark:text-sky-200 tabular-nums mt-0.5">
                {numPaid > 0 ? `${Math.round(standardPrice).toLocaleString('ko-KR')}원 / ${standardUnitLabel}` : '-'}
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
              가격 기록 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
