import React, { useState, useEffect } from 'react';
import { Product, PriceEntry } from './types';
import {
  getAllProducts,
  saveProduct,
  deleteProduct,
  SAMPLE_PRODUCTS,
} from './storage';
import { ProductList } from './components/ProductList';
import { ProductDetail } from './components/ProductDetail';
import { ProductModal } from './components/ProductModal';
import { AddPriceModal } from './components/AddPriceModal';
import { QuickCalculator } from './components/QuickCalculator';
import {
  ShoppingBag,
  Plus,
  Calculator,
  Download,
  Upload,
  Moon,
  Sun,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'calculator'>('list');

  // Selected product for detail view
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isAddPriceModalOpen, setIsAddPriceModalOpen] = useState(false);
  const [productForAddPrice, setProductForAddPrice] = useState<Product | null>(null);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Load products from storage
  useEffect(() => {
    async function load() {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Handlers
  const handleSaveProduct = async (product: Product) => {
    await saveProduct(product);
    const updatedList = await getAllProducts();
    setProducts(updatedList);
    // If we're looking at details of this product, update it
    if (selectedProduct && selectedProduct.id === product.id) {
      setSelectedProduct(product);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
    const updatedList = await getAllProducts();
    setProducts(updatedList);
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(null);
    }
  };

  const handleAddPrice = async (productId: string, entry: PriceEntry) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;

    const updatedProduct: Product = {
      ...p,
      history: [...p.history, entry],
      updatedAt: new Date().toISOString(),
    };

    await saveProduct(updatedProduct);
    const updatedList = await getAllProducts();
    setProducts(updatedList);

    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(updatedProduct);
    }
  };

  const handleDeleteHistoryEntry = async (productId: string, entryId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;

    const updatedProduct: Product = {
      ...p,
      history: p.history.filter((h) => h.id !== entryId),
      updatedAt: new Date().toISOString(),
    };

    await saveProduct(updatedProduct);
    const updatedList = await getAllProducts();
    setProducts(updatedList);

    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(updatedProduct);
    }
  };

  // Export & Import backup JSON
  const handleExportData = () => {
    const jsonStr = JSON.stringify(products, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `가격노트_백업_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            await saveProduct(item);
          }
          const all = await getAllProducts();
          setProducts(all);
          alert(`성공적으로 ${parsed.length}개의 상품을 가져왔습니다!`);
        } else {
          alert('올바른 백업 JSON 파일 형식이 아닙니다.');
        }
      } catch (err) {
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetSample = async () => {
    if (confirm('샘플 데이터 3건을 다시 채워 넣을까요? 기존 데이터와 함께 유지됩니다.')) {
      for (const sample of SAMPLE_PRODUCTS) {
        await saveProduct(sample);
      }
      const all = await getAllProducts();
      setProducts(all);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-sky-500 selection:text-white">
      {/* Top Bar - Strict 3-zone contract */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setSelectedProduct(null);
                setActiveTab('list');
              }}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
              </div>
              <div className="leading-tight">
                <span className="text-sm sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  가격노트
                </span>
                <span className="hidden md:inline-block ml-2 text-xs font-medium text-slate-400">
                  단위가격 & 최저가 추적
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links / Segmented Switch */}
          <nav className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-slate-100 dark:bg-slate-800 rounded-lg sm:rounded-xl shrink-0">
            <button
              onClick={() => {
                setActiveTab('list');
                setSelectedProduct(null);
              }}
              className={`h-8 sm:h-8.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-md sm:rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center justify-center ${
                activeTab === 'list' && !selectedProduct
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">내 </span>상품 목록
            </button>
            <button
              onClick={() => {
                setActiveTab('calculator');
                setSelectedProduct(null);
              }}
              className={`h-8 sm:h-8.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-md sm:rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-1 ${
                activeTab === 'calculator'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 shrink-0" />
              <span>즉석 비교<span className="hidden sm:inline">기</span></span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Tools */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                setProductToEdit(null);
                setIsProductModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:scale-[0.98] rounded-xl shadow-xs transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">상품 등록</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Quick Review / Banner Notice */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-sky-50/70 dark:bg-sky-950/20 rounded-2xl border border-sky-100 dark:border-sky-900/30">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-sky-600 text-white rounded-xl shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-sky-950 dark:text-sky-100">
                알뜰 쇼핑 팁: 100g·100ml당 환산 가격으로 진짜 싼 제품을 찾으세요!
              </h2>
              <p className="text-xs text-sky-800/80 dark:text-sky-300 mt-0.5">
                포장 크기나 할인 스티커에 속지 마세요. 구매할 때마다 가격을 톡톡 기록하면 우리 동네 최저가를 자동으로 알려드립니다.
              </p>
            </div>
          </div>

          {/* Backup & Sample Tool Buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={handleExportData}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="현재 데이터 JSON 파일로 내보내기"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>백업 저장</span>
            </button>

            <label className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>백업 불러오기</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* View Switch */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            데이터를 불러오는 중입니다...
          </div>
        ) : activeTab === 'calculator' ? (
          <QuickCalculator />
        ) : selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            onOpenAddPrice={(p) => {
              setProductForAddPrice(p);
              setIsAddPriceModalOpen(true);
            }}
            onEditProduct={(p) => {
              setProductToEdit(p);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
            onDeleteHistoryEntry={handleDeleteHistoryEntry}
          />
        ) : (
          <ProductList
            products={products}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onOpenAddPrice={(p) => {
              setProductForAddPrice(p);
              setIsAddPriceModalOpen(true);
            }}
            onOpenNewProduct={() => {
              setProductToEdit(null);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 가격노트 · 브라우저 저장소(IndexedDB) 기반 개인 맞춤 장보기 기록장</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetSample}
              className="hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-2"
            >
              샘플 데이터 채우기
            </button>
            <span aria-hidden="true">·</span>
            <span>오프라인 PWA 지원</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        onSave={handleSaveProduct}
        initialProduct={productToEdit}
      />

      <AddPriceModal
        isOpen={isAddPriceModalOpen}
        onClose={() => {
          setIsAddPriceModalOpen(false);
          setProductForAddPrice(null);
        }}
        product={productForAddPrice}
        onAddPrice={handleAddPrice}
      />
    </div>
  );
}
