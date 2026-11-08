import React, { useState } from 'react';
import { UnitType } from '../types';
import { Calculator, RotateCcw } from 'lucide-react';

interface QuickCompareItem {
  id: string;
  name: string;
  amount: number | '';
  bundleCount: number | '';
  unit: UnitType;
  price: number | '';
}

export const QuickCalculator: React.FC = () => {
  const [compareCount, setCompareCount] = useState<2 | 3>(2);
  const [unit, setUnit] = useState<UnitType>('g');
  const [itemA, setItemA] = useState<QuickCompareItem>({
    id: 'a',
    name: 'A 상품',
    amount: 500,
    bundleCount: 1,
    unit: 'g',
    price: 3800,
  });
  const [itemB, setItemB] = useState<QuickCompareItem>({
    id: 'b',
    name: 'B 상품',
    amount: 600,
    bundleCount: 2,
    unit: 'g',
    price: 8500,
  });
  const [itemC, setItemC] = useState<QuickCompareItem>({
    id: 'c',
    name: 'C 상품',
    amount: 800,
    bundleCount: 1,
    unit: 'g',
    price: 6000,
  });

  const handleUnitChange = (newUnit: UnitType) => {
    setUnit(newUnit);
    setItemA((prev) => ({
      ...prev,
      unit: newUnit,
      bundleCount: prev.bundleCount || 1,
    }));
    setItemB((prev) => ({
      ...prev,
      unit: newUnit,
      bundleCount: prev.bundleCount || 1,
    }));
    setItemC((prev) => ({
      ...prev,
      unit: newUnit,
      bundleCount: prev.bundleCount || 1,
    }));
  };

  const isCount = unit === 'count';

  const calcTotalAmount = (item: QuickCompareItem) => {
    const singleAmt = typeof item.amount === 'number' ? item.amount : 0;
    const bundle = typeof item.bundleCount === 'number' && item.bundleCount > 0 ? item.bundleCount : 1;
    return isCount
      ? (typeof item.bundleCount === 'number' && item.bundleCount > 0 ? item.bundleCount : singleAmt)
      : (singleAmt * bundle);
  };

  const calcUnitCost = (item: QuickCompareItem) => {
    const totalAmt = calcTotalAmount(item);
    const prc = typeof item.price === 'number' ? item.price : 0;
    if (totalAmt <= 0 || prc <= 0) return 0;
    return prc / totalAmt;
  };

  const totalAmtA = calcTotalAmount(itemA);
  const totalAmtB = calcTotalAmount(itemB);
  const totalAmtC = calcTotalAmount(itemC);
  const costA = calcUnitCost(itemA);
  const costB = calcUnitCost(itemB);
  const costC = compareCount === 3 ? calcUnitCost(itemC) : 0;

  const stdCostA = isCount ? costA : costA * 100;
  const stdCostB = isCount ? costB : costB * 100;
  const stdCostC = isCount ? costC : costC * 100;
  const stdLabel = isCount ? '1개' : `100${unit}`;

  const candidates = [
    { id: 'a', name: 'A 상품', cost: costA, std: stdCostA },
    { id: 'b', name: 'B 상품', cost: costB, std: stdCostB }
  ];
  if (compareCount === 3) {
    candidates.push({ id: 'c', name: 'C 상품', cost: costC, std: stdCostC });
  }

  const valid = candidates.filter(c => c.cost > 0);
  let winnerText = '';
  let winningId = '';

  if (valid.length >= 2) {
    const sorted = [...valid].sort((a, b) => a.cost - b.cost);
    const winner = sorted[0];
    const runnerUp = sorted[1];
    const allEqual = valid.every(c => Math.abs(c.cost - winner.cost) < 0.0001);

    if (allEqual) {
      winnerText = '모든 상품의 단위 가격이 완벽히 동일합니다.';
    } else {
      winningId = winner.id;
      const diffWon = runnerUp.std - winner.std;
      const diffRate = ((runnerUp.cost - winner.cost) / runnerUp.cost) * 100;

      if (compareCount === 3 && valid.length === 3) {
        winnerText = `★ ${winner.name}이 1위! 2위보다 ${stdLabel}당 ${Math.round(diffWon).toLocaleString('ko-KR')}원 (${diffRate.toFixed(1)}%) 더 저렴합니다.`;
      } else {
        winnerText = `${winner.name}이 ${stdLabel}당 ${Math.round(diffWon).toLocaleString('ko-KR')}원 (${diffRate.toFixed(1)}%) 더 저렴합니다!`;
      }
    }
  }

  const reset = () => {
    setItemA({
      id: 'a',
      name: 'A 상품',
      amount: '',
      bundleCount: 1,
      unit,
      price: '',
    });
    setItemB({
      id: 'b',
      name: 'B 상품',
      amount: '',
      bundleCount: 1,
      unit,
      price: '',
    });
    setItemC({
      id: 'c',
      name: 'C 상품',
      amount: '',
      bundleCount: 1,
      unit,
      price: '',
    });
  };

  const boxHeight = isCount ? 'h-[46px] sm:h-[48px]' : 'h-[58px]';

  const renderCard = (
    item: QuickCompareItem,
    setItem: React.Dispatch<React.SetStateAction<QuickCompareItem>>,
    totalAmt: number,
    cost: number,
    stdCost: number
  ) => {
    const isWinner = winningId === item.id;
    const isLoser = winningId !== '' && winningId !== item.id && cost > 0;

    return (
      <div
        className={`p-3.5 sm:p-4 rounded-xl border transition-all space-y-2.5 sm:space-y-3 ${
          isWinner
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700/60 ring-1 ring-emerald-400'
            : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {item.name}
          </span>
          {isWinner && (
            <span className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-md">
              ★ 가성비 승리
            </span>
          )}
        </div>

        <div className="grid grid-cols-12 gap-2 sm:gap-2.5 items-end">
          {/* Single Capacity (g/ml only) */}
          {!isCount && (
            <div className="col-span-4 sm:col-span-3">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">
                개당용량
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="any"
                  value={item.amount}
                  onChange={(e) =>
                    setItem({ ...item, amount: e.target.value === '' ? '' : Number(e.target.value) })
                  }
                  placeholder="500"
                  className="w-full pl-2 sm:pl-2.5 pr-6 sm:pr-7 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white tabular-nums focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                />
                <span className="absolute right-1.5 sm:right-2 text-[10px] sm:text-xs text-slate-400 font-semibold pointer-events-none">
                  {unit}
                </span>
              </div>
            </div>
          )}

          {/* Bundle / Count Input */}
          <div className={isCount ? 'col-span-6' : 'col-span-3 sm:col-span-3'}>
            <label className="block text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">
              {isCount ? '수량 (개수)' : '수량'}
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min="1"
                step="1"
                value={isCount ? (item.bundleCount || item.amount) : item.bundleCount}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Number(e.target.value);
                  if (isCount) {
                    setItem({ ...item, bundleCount: val, amount: val });
                  } else {
                    setItem({ ...item, bundleCount: val });
                  }
                }}
                placeholder="1"
                className="w-full pl-2 sm:pl-2.5 pr-5 sm:pr-6 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white tabular-nums focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
              />
              <span className="absolute right-1.5 sm:right-2 text-[10px] sm:text-xs text-slate-400 font-semibold pointer-events-none">
                개
              </span>
            </div>
          </div>

          {/* Total Capacity Summary Badge (g/ml only) */}
          {!isCount && (
            <div className="col-span-5 sm:col-span-6">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">
                총 용량
              </label>
              <div className="h-[38px] px-2 sm:px-3 bg-sky-50/80 dark:bg-sky-950/40 rounded-lg border border-sky-200/80 dark:border-sky-800/80 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-extrabold text-sky-800 dark:text-sky-300 tabular-nums truncate whitespace-nowrap">
                  {totalAmt > 0 ? (
                    (typeof item.bundleCount === 'number' && item.bundleCount > 1)
                      ? `${totalAmt.toLocaleString()}${unit} (${item.bundleCount}개)`
                      : `${totalAmt.toLocaleString()}${unit}`
                  ) : '-'}
                </span>
              </div>
            </div>
          )}

          {/* Price (Always col-span-6) */}
          <div className="col-span-6">
            <label className="block text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">
              전체 구매 가격
            </label>
            <div className="h-[38px] px-2.5 sm:px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center focus-within:ring-1 focus-within:ring-sky-500 cursor-text">
              <input
                type="number"
                min="0"
                step="10"
                value={item.price}
                onChange={(e) =>
                  setItem({ ...item, price: e.target.value === '' ? '' : Number(e.target.value) })
                }
                placeholder="0"
                className="min-w-0 bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-white tabular-nums focus:outline-none p-0 m-0 border-none"
                style={{ width: `${Math.max(1.5, String(item.price || '0').length + 0.5)}ch` }}
              />
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 select-none pointer-events-none ml-0.5">
                원
              </span>
            </div>
          </div>

          {/* Converted Price Box */}
          <div className={isCount ? 'col-span-12' : 'col-span-6'}>
            <div
              className={`${boxHeight} px-2.5 sm:px-3 rounded-lg flex items-center justify-center transition-all shadow-2xs ${
                isWinner
                  ? 'bg-emerald-100/95 dark:bg-emerald-950/80 border-2 border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-400/30'
                  : isLoser
                  ? 'bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700'
                  : 'bg-sky-50/90 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-800'
              }`}
            >
              <span
                className={`tabular-nums truncate whitespace-nowrap ${
                  isWinner
                    ? 'text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-100'
                    : isLoser
                    ? 'text-base sm:text-lg font-bold text-slate-500 dark:text-slate-400'
                    : 'text-lg sm:text-xl font-black text-sky-950 dark:text-sky-100'
                }`}
              >
                {stdCost > 0
                  ? isCount
                    ? `1개당 ${Math.round(stdCost).toLocaleString('ko-KR')}원`
                    : `${stdLabel}당 ${Math.round(stdCost).toLocaleString('ko-KR')}원`
                  : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
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

        {/* Switch (2-way vs 3-way) & Unit Selector & Reset */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Compare Count Switch */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setCompareCount(2)}
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                compareCount === 2
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              2개 비교
            </button>
            <button
              type="button"
              onClick={() => setCompareCount(3)}
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                compareCount === 3
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              3개 비교
            </button>
          </div>

          {/* Unit Selector */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleUnitChange('g')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
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
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
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
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
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

      {/* Comparison Grid (2 items: 2 cols, 3 items: 3 cols) */}
      <div className={`grid gap-4 ${compareCount === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
        {renderCard(itemA, setItemA, totalAmtA, costA, stdCostA)}
        {renderCard(itemB, setItemB, totalAmtB, costB, stdCostB)}
        {compareCount === 3 && renderCard(itemC, setItemC, totalAmtC, costC, stdCostC)}
      </div>

      {/* Result Callout Banner (Compact padding, bold and high visibility) */}
      {winnerText && (
        <div
          className={`py-2 sm:py-2.5 px-4 rounded-xl border text-center shadow-xs transition-all ${
            winningId
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
              : 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800'
          }`}
        >
          <p
            className={`text-base sm:text-lg font-black ${
              winningId
                ? 'text-emerald-950 dark:text-emerald-100'
                : 'text-sky-950 dark:text-sky-100'
            }`}
          >
            {winnerText}
          </p>
        </div>
      )}
    </div>
  );
};
