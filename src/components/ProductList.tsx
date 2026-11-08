import React, { useState, useMemo } from 'react';
import { Product, PriceEntry, getStandardUnitPrice, formatWon } from '../types';
import {
  Search,
  Plus,
  ArrowUpDown,
  Filter,
  Tag,
  Package,
  Award,
  ChevronRight,
  TrendingDown,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onOpenAddPrice: (product: Product) => void;
  onOpenNewProduct: () => void;
  onDeleteProduct: (productId: string) => void;
}

type SortOption = 'recent' | 'name' | 'historyCount' | 'lowestPrice';

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onSelectProduct,
  onOpenAddPrice,
  onOpenNewProduct,
  onDeleteProduct,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Derive categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['전체', ...Array.from(set)];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== '전체' && p.category !== selectedCategory) {
          return false;
        }
        // Search query
        if (!q) return true;
        const inName = p.name.toLowerCase().includes(q);
        const inStores = p.history.some((h) => h.store.toLowerCase().includes(q));
        const inNotes = (p.notes || '').toLowerCase().includes(q);
        return inName || inStores || inNotes;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name, 'ko');
        }
        if (sortBy === 'historyCount') {
          return b.history.length - a.history.length;
        }
        if (sortBy === 'lowestPrice') {
          const getMin = (p: Product) => {
            if (!p.history.length) return Infinity;
            return Math.min(...p.history.map((h) => getStandardUnitPrice(p, h).standardPrice));
          };
          return getMin(a) - getMin(b);
        }
        // 'recent' default
        const dateA = a.history.length ? a.history[a.history.length - 1].date : a.createdAt;
        const dateB = b.history.length ? b.history[b.history.length - 1].date : b.createdAt;
        return dateB.localeCompare(dateA);
      });
  }, [products, search, selectedCategory, sortBy]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="상품명, 구매처, 메모 검색..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                지우기
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>정렬:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            >
              <option value="recent">최근 기록순</option>
              <option value="name">상품명 가나다순</option>
              <option value="historyCount">기록 횟수 많은순</option>
              <option value="lowestPrice">단위가격 낮은순</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        {categories.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product List Count & Action */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          총 <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{filteredProducts.length}</span>개 상품
        </div>
      </div>

      {/* Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {search ? '검색된 상품이 없습니다' : '등록된 상품이 없습니다'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {search
              ? '다른 검색어를 입력하거나 필터를 초기화해 보세요.'
              : '자주 장보는 상품을 등록하고 단위 가격과 최저가를 비교해 보세요.'}
          </p>
          {!search && (
            <button
              onClick={onOpenNewProduct}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>첫 상품 등록하기</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((product) => {
            // Find lowest unit price entry
            let lowest: { entry: PriceEntry; standardPrice: number; standardUnitLabel: string } | null = null;
            for (const h of product.history) {
              const c = getStandardUnitPrice(product, h);
              if (!lowest || c.standardPrice < lowest.standardPrice) {
                lowest = { entry: h, standardPrice: c.standardPrice, standardUnitLabel: c.standardUnitLabel };
              }
            }

            // Latest entry
            const sorted = [...product.history].sort((a, b) => b.date.localeCompare(a.date));
            const latest = sorted[0];
            const latestCalc = latest ? getStandardUnitPrice(product, latest) : null;

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start gap-3.5">
                    {product.photo ? (
                      <img
                        src={product.photo}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0 shadow-xs"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-400 shrink-0">
                        <Package className="w-6 h-6 stroke-[1.5]" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                        <span className="truncate">{product.category || '기타'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="whitespace-nowrap">
                          {product.amount.toLocaleString()} {product.unit}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectProduct(product)}
                        className="text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 line-clamp-1 transition-colors"
                      >
                        {product.name}
                      </button>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-slate-950 dark:text-slate-100 tabular-nums">
                          {latest ? formatWon(latest.paidPrice) : '가격 기록 없음'}
                        </span>
                        {latest && (
                          <span className="text-[11px] text-slate-400 truncate">
                            ({latest.store})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        최근 단위가
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums mt-0.5">
                        {latestCalc
                          ? `${Math.round(latestCalc.standardPrice).toLocaleString('ko-KR')}원 / ${latestCalc.standardUnitLabel}`
                          : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                        <Award className="w-3 h-3" />
                        역대 최저
                      </div>
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 tabular-nums mt-0.5 truncate">
                        {lowest
                          ? `${Math.round(lowest.standardPrice).toLocaleString('ko-KR')}원 / ${lowest.standardUnitLabel}`
                          : '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="text-[11px] text-slate-400">
                    기록 <span className="font-semibold text-slate-700 dark:text-slate-300">{product.history.length}</span>회
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenAddPrice(product)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 rounded-lg transition-colors"
                    >
                      + 가격 추가
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700 rounded-lg transition-colors"
                    >
                      <span>이력 보기</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
