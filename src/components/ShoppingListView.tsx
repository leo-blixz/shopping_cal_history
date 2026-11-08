import React, { useState } from 'react';
import { Product, ShoppingListItem, getStandardUnitPrice, formatWon } from '../types';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Package,
  Sparkles,
  Award,
  ExternalLink,
  Tag,
  ShoppingBag,
  CheckCheck
} from 'lucide-react';

interface ShoppingListViewProps {
  products: Product[];
  items: ShoppingListItem[];
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: ShoppingListItem) => void;
  onClearCompleted: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenAddPrice: (product: Product) => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  products,
  items,
  onToggleItem,
  onDeleteItem,
  onAddItem,
  onClearCompleted,
  onSelectProduct,
  onOpenAddPrice,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [memo, setMemo] = useState('');
  const [targetPrice, setTargetPrice] = useState<number | ''>('');
  const [showAddForm, setShowAddForm] = useState(false);

  // If selected a registered product, auto-fill lowest price & standard unit
  const handleProductSelectChange = (pId: string) => {
    setSelectedProductId(pId);
    if (pId) {
      const prod = products.find((p) => p.id === pId);
      if (prod) {
        setCustomName(prod.name);
        // Find best price recorded
        if (prod.history.length > 0) {
          let minStd = Infinity;
          let minPaid = 0;
          for (const h of prod.history) {
            const c = getStandardUnitPrice(prod, h);
            if (c.standardPrice < minStd) {
              minStd = c.standardPrice;
              minPaid = h.paidPrice;
            }
          }
          setTargetPrice(minPaid);
        }
      }
    }
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      alert('품목명을 입력해 주세요.');
      return;
    }

    const linkedProd = selectedProductId ? products.find((p) => p.id === selectedProductId) : undefined;
    let targetUnit = '';
    if (linkedProd) {
      targetUnit = linkedProd.unit === 'count' ? '1개 기준' : `100${linkedProd.unit} 환산`;
    }

    const newItem: ShoppingListItem = {
      id: crypto.randomUUID(),
      productId: selectedProductId || undefined,
      name: customName.trim(),
      targetPrice: typeof targetPrice === 'number' && targetPrice > 0 ? targetPrice : undefined,
      targetUnit,
      completed: false,
      memo: memo.trim(),
      createdAt: new Date().toISOString(),
    };

    onAddItem(newItem);
    setCustomName('');
    setSelectedProductId('');
    setMemo('');
    setTargetPrice('');
    setShowAddForm(false);
  };

  const uncompleted = items.filter((i) => !i.completed);
  const completed = items.filter((i) => i.completed);

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span>스마트 장보기 메모 & 체크리스트</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            마트 가기 전 살 것을 적어두면 내가 기록해 둔 ‘역대 최저가’가 자동으로 표시됩니다!
          </p>
        </div>

        <div className="flex items-center gap-2">
          {completed.length > 0 && (
            <button
              type="button"
              onClick={onClearCompleted}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              완료된 {completed.length}개 비우기
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:scale-[0.98] rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{showAddForm ? '입력창 닫기' : '품목 추가'}</span>
          </button>
        </div>
      </div>

      {/* Add Item Form Card */}
      {showAddForm && (
        <form
          onSubmit={handleAddNewItem}
          className="bg-sky-50/50 dark:bg-slate-900/90 rounded-2xl border border-sky-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
        >
          <div className="text-xs font-bold text-sky-950 dark:text-sky-300">
            새 장보기 품목 추가
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                기존 등록 상품에서 선택 (최저가 자동연동)
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductSelectChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
              >
                <option value="">-- 직접 입력 또는 선택 --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.amount}{p.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                품목명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="예: 삼다수 생수, 계란 30구, 대파"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                목표 구매가 / 최저가 상한선 (원)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="예: 5000원 이하일 때 구매"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                수량 또는 장보기 메모
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="예: 2묶음, 행사 스티커 붙은 것"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
            >
              목록에 추가
            </button>
          </div>
        </form>
      )}

      {/* Checklist Sections */}
      <div className="space-y-4">
        {/* Uncompleted Items */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>구매해야 할 품목 ({uncompleted.length}개)</span>
            <span className="text-slate-400 font-normal">터치하여 장바구니 담기</span>
          </div>

          {uncompleted.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              구매 예정 품목이 없습니다! 상단의 &apos;품목 추가&apos; 버튼으로 장볼 것을 메모하세요.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {uncompleted.map((item) => {
                const linkedProduct = item.productId
                  ? products.find((p) => p.id === item.productId)
                  : null;

                // Lowest price computation if linked
                let lowestInfo: { standardPrice: number; standardUnitLabel: string; store: string } | null = null;
                if (linkedProduct && linkedProduct.history.length > 0) {
                  let minStd = Infinity;
                  let bestStore = '';
                  let unitLabel = '';
                  for (const h of linkedProduct.history) {
                    const c = getStandardUnitPrice(linkedProduct, h);
                    if (c.standardPrice < minStd) {
                      minStd = c.standardPrice;
                      bestStore = h.store;
                      unitLabel = c.standardUnitLabel;
                    }
                  }
                  lowestInfo = { standardPrice: minStd, standardUnitLabel: unitLabel, store: bestStore };
                }

                return (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-start justify-between gap-3 group hover:bg-slate-50/70 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => onToggleItem(item.id)}
                        className="mt-0.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors shrink-0"
                      >
                        <Circle className="w-5 h-5 stroke-[1.8]" />
                      </button>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.name}
                          </span>
                          {linkedProduct && (
                            <span className="text-[10px] text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                              연동됨
                            </span>
                          )}
                        </div>

                        {/* Best Price Hint or Target Price */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {lowestInfo && (
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" />
                              역대 최저 {Math.round(lowestInfo.standardPrice).toLocaleString('ko-KR')}원 / {lowestInfo.standardUnitLabel} ({lowestInfo.store})
                            </span>
                          )}

                          {item.targetPrice && (
                            <span className="text-slate-600 dark:text-slate-400 font-medium">
                              목표가: {formatWon(item.targetPrice)} 이하
                            </span>
                          )}

                          {item.memo && (
                            <span className="text-slate-500 italic">
                              &ldquo;{item.memo}&rdquo;
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {linkedProduct && (
                        <button
                          type="button"
                          onClick={() => onOpenAddPrice(linkedProduct)}
                          className="px-2 py-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-colors whitespace-nowrap"
                          title="구매 후 가격 기록 추가"
                        >
                          + 가격 기록
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                        title="품목 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Items */}
        {completed.length > 0 && (
          <div className="bg-slate-100/60 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800/60 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>장바구니에 담은 품목 ({completed.length}개)</span>
            </div>

            <div className="divide-y divide-slate-200/60 dark:divide-slate-800/40">
              {completed.map((item) => (
                <div
                  key={item.id}
                  className="py-2.5 flex items-center justify-between gap-3 px-2 opacity-65 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleItem(item.id)}
                      className="text-emerald-600 dark:text-emerald-400 transition-colors shrink-0"
                    >
                      <CheckCircle2 className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950" />
                    </button>
                    <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-through">
                      {item.name}
                    </span>
                    {item.memo && (
                      <span className="text-[11px] text-slate-400 italic line-through">
                        ({item.memo})
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
