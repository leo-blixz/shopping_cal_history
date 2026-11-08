import React, { useState } from 'react';
import { UnitType, formatWon } from '../types';
import { Calculator, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

interface QuickCompareItem {
  id: string;
  name: string;
  amount: number | '';
  unit: UnitType;
  price: number | '';
}

export const QuickCalculator: React.FC = () => {
  const [unit, setUnit] = useState<UnitType>('g');
  const [itemA, setItemA] = useState<QuickCompareItem>({
    id: 'a',
    name: 'A 상품 (예: 낱개/소용량)',
    amount: 500,
    unit: 'g',
    price: 3800,
  });
  const [itemB, setItemB] = useState<QuickCompareItem>({
    id: 'b',
    name: 'B 상품 (예: 대용량/묶음팩)',
    amount: 1200,
    unit: 'g',
    price: 8500,
  });

  const handleUnitChange = (newUnit: UnitType) => {
    setUnit(newUnit);
    setItemA((prev) => ({ ...prev, unit: newUnit }));
    setItemB((prev) => ({ ...prev, unit: newUnit }));
  };

  const calcUnitCost = (item: QuickCompareItem) => {
    const amt = typeof item.amount === 'number' ? item.amount : 0;
    const prc = typeof item.price === 'number' ? item.price : 0;
    if (amt <= 0 || prc <= 0) return 0;
    return prc / amt;
  };

  const costA = calcUnitCost(itemA);
  const costB = calcUnitCost(itemB);

  const stdCostA = unit === 'count' ? costA : costA * 100;
  const stdCostB = unit === 'count' ? costB : costB * 100;
  const stdLabel = unit === 'count' ? '1개' : `100${unit}`;

  let winnerText = '';
  let savingPercent = 0;
  let savingWon = 0;

  if (costA > 0 && costB > 0) {
    if (costA < costB) {
      savingPercent = ((costB - costA) / costB) * 100;
      savingWon = stdCostB - stdCostA;
      winnerText = `A 상품이 ${stdLabel}당 ${Math.round(savingWon).toLocaleString('ko-KR')}원 (${savingPercent.toFixed(1)}%) 더 저렴합니다!`;
    } else if (costB < costA) {
      savingPercent = ((costA - costB) / costA) * 100;
      savingWon = stdCostA - stdCostB;
      winnerText = `B 상품이 ${stdLabel}당 ${Math.round(savingWon).toLocaleString('ko-KR')}원 (${savingPercent.toFixed(1)}%) 더 저렴합니다!`;
    } else {
      winnerText = '두 상품의 단위 가격이 완벽히 동일합니다.';
    }
  }

  const reset = () => {
    setItemA({
      id: 'a',
      name: 'A 상품',
      amount: '',
      unit,
      price: '',
    });
    setItemB({
      id: 'b',
      name: 'B 상품',
      amount: '',
      unit,
      price: '',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span>현장 즉석 단위가격 비교기</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            마트 매대 앞에서 소용량과 대용량 중 어느 쪽이 진짜 이득인지 1초 만에 확인하세요.
          </p>
        </div>

        {/* Unit Selector & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleUnitChange('g')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                unit === 'g'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              그램 (g)
            </button>
            <button
              type="button"
              onClick={() => handleUnitChange('ml')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                unit === 'ml'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              밀리리터 (ml)
            </button>
            <button
              type="button"
              onClick={() => handleUnitChange('count')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                unit === 'count'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              개수 (개)
            </button>
          </div>

          <button
            type="button"
            onClick={reset}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Item A */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            costA > 0 && costB > 0 && costA < costB
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700/60 ring-1 ring-emerald-400'
              : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              A 상품 (비교 대상 1)
            </span>
            {costA > 0 && costB > 0 && costA < costB && (
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                ★ 가성비 승리
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                용량/수량 ({unit})
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={itemA.amount}
                onChange={(e) =>
                  setItemA({ ...itemA, amount: e.target.value === '' ? '' : Number(e.target.value) })
                }
                placeholder="예: 500"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white tabular-nums"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                가격 (원)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={itemA.price}
                onChange={(e) =>
                  setItemA({ ...itemA, price: e.target.value === '' ? '' : Number(e.target.value) })
                }
                placeholder="예: 3800"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white tabular-nums font-semibold"
              />
            </div>
          </div>

          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">{stdLabel} 환산 가격</span>
            <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
              {stdCostA > 0 ? `${Math.round(stdCostA).toLocaleString('ko-KR')}원` : '-'}
            </span>
          </div>
        </div>

        {/* Item B */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            costA > 0 && costB > 0 && costB < costA
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700/60 ring-1 ring-emerald-400'
              : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              B 상품 (비교 대상 2)
            </span>
            {costA > 0 && costB > 0 && costB < costA && (
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                ★ 가성비 승리
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                용량/수량 ({unit})
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={itemB.amount}
                onChange={(e) =>
                  setItemB({ ...itemB, amount: e.target.value === '' ? '' : Number(e.target.value) })
                }
                placeholder="예: 1200"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white tabular-nums"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                가격 (원)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={itemB.price}
                onChange={(e) =>
                  setItemB({ ...itemB, price: e.target.value === '' ? '' : Number(e.target.value) })
                }
                placeholder="예: 8500"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white tabular-nums font-semibold"
              />
            </div>
          </div>

          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">{stdLabel} 환산 가격</span>
            <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
              {stdCostB > 0 ? `${Math.round(stdCostB).toLocaleString('ko-KR')}원` : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Result Callout Banner */}
      {winnerText && (
        <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-800 text-center">
          <p className="text-xs sm:text-sm font-bold text-sky-900 dark:text-sky-200">
            {winnerText}
          </p>
        </div>
      )}
    </div>
  );
};
