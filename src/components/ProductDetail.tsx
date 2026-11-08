import React, { useState } from 'react';
import { Product, PriceEntry, getStandardUnitPrice, formatWon } from '../types';
import {
  ArrowLeft,
  Calendar,
  Store,
  Tag,
  TrendingDown,
  TrendingUp,
  Award,
  Trash2,
  Plus,
  Pencil,
  Share2,
  Package
} from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onOpenAddPrice: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onDeleteHistoryEntry: (productId: string, entryId: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onBack,
  onOpenAddPrice,
  onEditProduct,
  onDeleteProduct,
  onDeleteHistoryEntry,
}) => {
  const [copied, setCopied] = useState(false);

  // Sort history newest first
  const sortedHistory = [...product.history].sort((a, b) => b.date.localeCompare(a.date));

  // Compute lowest standard unit price
  let minEntry: { entry: PriceEntry; standardPrice: number; standardUnitLabel: string } | null = null;
  let maxEntry: { entry: PriceEntry; standardPrice: number } | null = null;
  let latestEntry: PriceEntry | null = sortedHistory[0] || null;

  for (const h of product.history) {
    const calc = getStandardUnitPrice(product, h);
    if (!minEntry || calc.standardPrice < minEntry.standardPrice) {
      minEntry = { entry: h, standardPrice: calc.standardPrice, standardUnitLabel: calc.standardUnitLabel };
    }
    if (!maxEntry || calc.standardPrice > maxEntry.standardPrice) {
      maxEntry = { entry: h, standardPrice: calc.standardPrice };
    }
  }

  // Price difference between latest and lowest
  const latestCalc = latestEntry ? getStandardUnitPrice(product, latestEntry) : null;
  const isCurrentlyLowest = latestCalc && minEntry && Math.abs(latestCalc.standardPrice - minEntry.standardPrice) < 0.01;

  const handleShare = async () => {
    const text = `${product.name} 최저가 정보: ${minEntry ? `${Math.round(minEntry.standardPrice).toLocaleString('ko-KR')}원/${minEntry.standardUnitLabel} (${minEntry.entry.store})` : '기록 없음'}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text });
      } catch {
        // cancelled
      }
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top navigation row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>상품 목록으로</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditProduct(product)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-500" />
            <span>수정</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-lg transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{copied ? '복사됨!' : '공유'}</span>
          </button>
          <button
            onClick={() => {
              if (confirm(`'${product.name}' 상품과 모든 가격 이력을 삭제하시겠습니까?`)) {
                onDeleteProduct(product.id);
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>삭제</span>
          </button>
        </div>
      </div>

      {/* Hero card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {product.photo ? (
            <img
              src={product.photo}
              alt={product.name}
              className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex flex-col items-center justify-center text-slate-400 shrink-0">
              <Package className="w-8 h-8 stroke-[1.5]" />
              <span className="text-[11px] mt-1 font-medium text-slate-500">사진 없음</span>
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{product.category || '기타'}</span>
              <span aria-hidden="true">·</span>
              <span>기준 {product.amount.toLocaleString()} {product.unit}</span>
              <span aria-hidden="true">·</span>
              <span>총 {product.history.length}회 기록</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
              {product.name}
            </h1>

            {product.notes && (
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                💡 메모: {product.notes}
              </p>
            )}

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={() => onOpenAddPrice(product)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:scale-[0.98] rounded-xl shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>새 가격 기록 추가</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Metric Summary Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center justify-between text-xs font-medium text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                역대 최저 단위가
              </span>
              {isCurrentlyLowest && (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  최근 기록 일치
                </span>
              )}
            </div>
            <div className="text-lg sm:text-xl font-bold text-emerald-950 dark:text-emerald-200 tabular-nums mt-1">
              {minEntry ? `${Math.round(minEntry.standardPrice).toLocaleString('ko-KR')}원 / ${minEntry.standardUnitLabel}` : '-'}
            </div>
            <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-1">
              {minEntry ? `${minEntry.entry.store} (${minEntry.entry.date})` : '기록 없음'}
            </div>
          </div>

          <div className="p-3.5 bg-sky-50/60 dark:bg-sky-950/20 rounded-xl border border-sky-100 dark:border-sky-900/40">
            <div className="text-xs font-medium text-sky-800 dark:text-sky-300">
              최근 구매 가격
            </div>
            <div className="text-lg sm:text-xl font-bold text-sky-950 dark:text-sky-200 tabular-nums mt-1">
              {latestEntry ? formatWon(latestEntry.paidPrice) : '-'}
            </div>
            <div className="text-[11px] text-sky-700/80 dark:text-sky-400 mt-1">
              {latestCalc ? `${Math.round(latestCalc.standardPrice).toLocaleString('ko-KR')}원 / ${latestCalc.standardUnitLabel} (${latestEntry?.store})` : '-'}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
              가격 변동 폭
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 tabular-nums mt-1">
              {minEntry && maxEntry
                ? `${Math.round(maxEntry.standardPrice - minEntry.standardPrice).toLocaleString('ko-KR')}원 차이`
                : '-'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              총 {product.history.length}번의 장보기 내역
            </div>
          </div>
        </div>
      </div>

      {/* Purchase History Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            구매 가격 이력 ({sortedHistory.length}회)
          </h2>
          <span className="text-xs text-slate-400">최신순 정렬</span>
        </div>

        {sortedHistory.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            기록된 구매 내역이 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {sortedHistory.map((item) => {
              const calc = getStandardUnitPrice(product, item);
              const isBest = minEntry && Math.abs(calc.standardPrice - minEntry.standardPrice) < 0.01;

              return (
                <div
                  key={item.id}
                  className="py-4 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {item.date}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {item.store}
                      </span>
                      {isBest && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                          역대 최저
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>단위가 {Math.round(calc.standardPrice).toLocaleString('ko-KR')}원 / {calc.standardUnitLabel}</span>
                      {item.amount && item.amount !== product.amount && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>별도 용량 {item.amount.toLocaleString()} {product.unit}</span>
                        </>
                      )}
                      {item.regularPrice > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>정가 {formatWon(item.regularPrice)}</span>
                          {calc.discountRate > 0 && (
                            <span className="text-rose-500 font-semibold">
                              ({calc.discountRate.toFixed(1)}% 할인)
                            </span>
                          )}
                        </>
                      )}
                      {item.memo && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-600 dark:text-slate-300 italic">
                            &ldquo;{item.memo}&rdquo;
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatWon(item.paidPrice)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {calc.unitPrice.toFixed(2)}원 / {product.unit}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`${item.date} (${item.store}) 기록을 삭제하시겠습니까?`)) {
                          onDeleteHistoryEntry(product.id, item.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="이 기록 삭제"
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
    </div>
  );
};
