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
  const rankMap: Record<string, { rank: number; badgeText: string; isWinner: boolean; isRunnerUp: boolean; isThird: boolean }> = {};
  let winnerText = '';
  let isAllEqual = false;

  if (valid.length >= 2) {
    const sorted = [...valid].sort((a, b) => a.cost - b.cost);
    const minCost = sorted[0].cost;
    const firstPlace = sorted.filter(c => Math.abs(c.cost - minCost) < 0.0001);

    if (firstPlace.length === valid.length) {
      isAllEqual = true;
      // 모든 상품이 동일한 단위가격일 때
      valid.forEach(c => {
        rankMap[c.id] = {
          rank: 1,
          badgeText: '공동 1위 (동일)',
          isWinner: true,
          isRunnerUp: false,
          isThird: false,
        };
      });
      winnerText = '★ 모든 상품의 단위 가격이 완벽히 동일합니다! (공동 1위)';
    } else if (firstPlace.length === 2 && valid.length === 3) {
      // 3개 중 2개 상품이 공동 1위일 때
      const thirdPlace = sorted.find(c => Math.abs(c.cost - minCost) >= 0.0001)!;
      firstPlace.forEach(c => {
        rankMap[c.id] = {
          rank: 1,
          badgeText: '🥇 공동 1위',
          isWinner: true,
          isRunnerUp: false,
          isThird: false,
        };
      });
      rankMap[thirdPlace.id] = {
        rank: 3,
        badgeText: '3위',
        isWinner: false,
        isRunnerUp: false,
        isThird: true,
      };

      const diffWon = thirdPlace.std - firstPlace[0].std;
      const diffRate = ((thirdPlace.cost - firstPlace[0].cost) / thirdPlace.cost) * 100;
      winnerText = `★ ${firstPlace[0].name}, ${firstPlace[1].name} 공동 1위! 3위(${thirdPlace.name})보다 ${stdLabel}당 ${Math.round(diffWon).toLocaleString('ko-KR')}원 (${diffRate.toFixed(1)}%) 더 저렴합니다.`;
    } else if (firstPlace.length === 1 && valid.length === 3) {
      // 1위 1개, 나머지 2개 확인
      const winner = firstPlace[0];
      const remaining = sorted.slice(1);
      const isSecondTie = Math.abs(remaining[0].cost - remaining[1].cost) < 0.0001;

      rankMap[winner.id] = {
        rank: 1,
        badgeText: '🥇 1위 (가성비 승리)',
        isWinner: true,
        isRunnerUp: false,
        isThird: false,
      };

      if (isSecondTie) {
        // 2위가 공동 2위일 때
        remaining.forEach(c => {
          rankMap[c.id] = {
            rank: 2,
            badgeText: '🥈 공동 2위',
            isWinner: false,
            isRunnerUp: true,
            isThird: false,
          };
        });
        const diffWon = remaining[0].std - winner.std;
        const diffRate = ((remaining[0].cost - winner.cost) / remaining[0].cost) * 100;
        winnerText = `★ ${winner.name}이 1위! 공동 2위(${remaining[0].name}, ${remaining[1].name})보다 ${stdLabel}당 ${Math.round(diffWon).toLocaleString('ko-KR')}원 (${diffRate.toFixed(1)}%) 더 저렴합니다.`;
      } else {
        // 단독 1위, 2위, 3위
        const runnerUp = remaining[0];
        const third = remaining[1];
        rankMap[runnerUp.id] = {
          rank: 2,
          badgeText: '🥈 2위',
          isWinner: false,
          isRunnerUp: true,
          isThird: false,
        };
        rankMap[third.id] = {
          rank: 3,
          badgeText: '3위',
          isWinner: false,
          isRunnerUp: false,
          isThird: true,
        };
        const diffWon = runnerUp.std - winner.std;
        const diffRate = ((runnerUp.cost - winner.cost) / runnerUp.cost) * 100;
        winnerText = `★ ${winner.name}이 1위! 2위(${runnerUp.name})보다 ${stdLabel}당 ${Math.round(diffWon).toLocaleString('ko-KR')}원 (${diffRate.toFixed(1)}%) 더 저렴합니다.`;
      }
    } else {
      // 2개 상품 비교
      const isTie2 = Math.abs(sorted[0].cost - sorted[1].cost) < 0.0001;
      if (isTie2) {
        sorted.forEach(c => {
          rankMap[c.id] = {
            rank: 1,
            badgeText: '공동 1위 (동일)',
            isWinner: true,
            isRunnerUp: false,
            isThird: false,
          };
        });
        winnerText = `★ ${sorted[0].name}과 ${sorted[1].name}의 단위 가격이 동일합니다! (공동 1위)`;
      } else {
        const winner = sorted[0];
        const runnerUp = sorted[1];
        rankMap[winner.id] = {
          rank: 1,
          badgeText: '★ 가성비 승리',
          isWinner: true,
          isRunnerUp: false,
          isThird: false,
        };
        rankMap[runnerUp.id] = {
          rank: 2,
          badgeText: '',
          isWinner: false,
          isRunnerUp: false,
          isThird: false,
        };
        const diffWon = runnerUp.std - winner.std;
        const diffRate = ((runnerUp.cost - winner.cost) / runnerUp.cost) * 100;
        winnerText = `${winner.name}이 2위(${runnerUp.name})보다 ${stdLabel}당 ${Math.round(diffWon).toLocaleString('ko-KR')}원 (${diffRate.toFixed(1)}%) 더 저렴합니다!`;
      }
    }
  }

  const defaultNames: Record<string, string> = {
    a: 'A 상품',
    b: 'B 상품',
    c: 'C 상품',
  };

  const resetAll = () => {
    setItemA({
      id: 'a',
      name: 'A 상품',
      amount: '',
      bundleCount: '',
      unit,
      price: '',
    });
    setItemB({
      id: 'b',
      name: 'B 상품',
      amount: '',
      bundleCount: '',
      unit,
      price: '',
    });
    setItemC({
      id: 'c',
      name: 'C 상품',
      amount: '',
      bundleCount: '',
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
    const defaultName = defaultNames[item.id] || `${item.id.toUpperCase()} 상품`;
    const isCustomName = item.name.trim() !== defaultName;

    const rankInfo = rankMap[item.id] || { rank: 0, badgeText: '', isWinner: false, isRunnerUp: false, isThird: false };
    const { isWinner, isRunnerUp, isThird, badgeText } = rankInfo;
    const isLoser = !isWinner && rankInfo.rank > 0;

    const colPrice = !isCount ? (compareCount === 3 ? 'col-span-5' : 'col-span-6') : 'col-span-6';
    const colResult = !isCount ? (compareCount === 3 ? 'col-span-7' : 'col-span-6') : 'col-span-12';

    return (
      <div
        className={`p-3.5 sm:p-4 rounded-xl border transition-all space-y-2.5 sm:space-y-3 ${
          isWinner
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700/60 ring-1 ring-emerald-400'
            : isRunnerUp
            ? 'bg-sky-50/30 dark:bg-sky-950/20 border-sky-300 dark:border-sky-800 ring-1 ring-sky-300/50'
            : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <input
              type="text"
              value={item.name}
              onChange={(e) => setItem({ ...item, name: e.target.value })}
              placeholder={defaultName}
              title="클릭하여 상품 이름 변경"
              className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 bg-transparent hover:bg-slate-200/60 dark:hover:bg-slate-700/50 focus:bg-white dark:focus:bg-slate-900 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-sky-500 rounded px-1.5 py-0.5 w-[100px] sm:w-[130px] lg:w-[150px] truncate focus:outline-none transition-all cursor-text"
            />
            {isCustomName && (
              <button
                type="button"
                onClick={() => setItem({ ...item, name: defaultName })}
                title={`'${defaultName}' 기본 이름으로 리셋`}
                className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-medium text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 bg-slate-100 hover:bg-sky-50 dark:bg-slate-800 dark:hover:bg-sky-950/50 rounded border border-slate-200 dark:border-slate-700 hover:border-sky-300 transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>이름 리셋</span>
              </button>
            )}
          </div>
          {badgeText && (
            <span
              className={`text-xs sm:text-sm font-extrabold px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 border ${
                isWinner
                  ? 'text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/60 border-emerald-300 dark:border-emerald-700'
                  : isRunnerUp
                  ? 'text-sky-800 dark:text-sky-200 bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-700'
                  : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold'
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>

        {/* Row 1: 개당용량, 수량, 총 용량 (3.5 : 2 : 4.5 비율, g/ml 모드 전용) */}
        {!isCount && (
          <div className="grid grid-cols-[3.5fr_2fr_4.5fr] gap-2 sm:gap-2.5 items-end">
            {/* 1. 개당용량 (3.5fr) */}
            <div className="min-w-0">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">
                개당용량
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  value={item.amount}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^0-9]/g, '');
                    setItem({ ...item, amount: sanitized === '' ? '' : Number(sanitized) });
                  }}
                  onKeyDown={(e) => {
                    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
                    }
                  }}
                  placeholder={isCount ? "1" : "500"}
                  className="w-full pl-2 sm:pl-2.5 pr-6 sm:pr-7 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white tabular-nums focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                />
                <span className="absolute right-1.5 sm:right-2 text-[10px] sm:text-xs text-slate-400 font-semibold pointer-events-none">
                  {unit}
                </span>
              </div>
            </div>

            {/* 2. 수량 (2fr) */}
            <div className="min-w-0">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">
                수량
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  value={item.bundleCount}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^0-9]/g, '');
                    setItem({ ...item, bundleCount: sanitized === '' ? '' : Number(sanitized) });
                  }}
                  onKeyDown={(e) => {
                    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
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

            {/* 3. 총 용량 (4.5fr) */}
            <div className="min-w-0">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">
                총 용량
              </label>
              <div className="h-[38px] px-1.5 sm:px-2.5 bg-sky-50/80 dark:bg-sky-950/40 rounded-lg border border-sky-200/80 dark:border-sky-800/80 flex items-center justify-center">
                <span className="text-sm sm:text-base font-black text-sky-900 dark:text-sky-200 tabular-nums truncate whitespace-nowrap">
                  {totalAmt > 0 ? (
                    (typeof item.bundleCount === 'number' && item.bundleCount > 1)
                      ? `${totalAmt.toLocaleString()}${unit} (${item.bundleCount}개)`
                      : `${totalAmt.toLocaleString()}${unit}`
                  ) : '-'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Row 2: In Count mode, 수량 is here; Price and Converted Price */}
        <div className="grid grid-cols-12 gap-2 sm:gap-2.5 items-end">
          {isCount && (
            <div className="col-span-6">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">
                수량 (개수)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  value={item.bundleCount || item.amount}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^0-9]/g, '');
                    const val = sanitized === '' ? '' : Number(sanitized);
                    setItem({ ...item, bundleCount: val, amount: val });
                  }}
                  onKeyDown={(e) => {
                    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
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
          )}

          {/* Price (col-span-5 in 3-way, col-span-6 in 2-way) */}
          <div className={colPrice}>
            <label className="block text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">
              전체 구매 가격
            </label>
            <div className="h-[38px] px-2 sm:px-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center focus-within:ring-1 focus-within:ring-sky-500 cursor-text">
              <input
                type="text"
                inputMode="numeric"
                value={item.price}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^0-9]/g, '');
                  setItem({ ...item, price: sanitized === '' ? '' : Number(sanitized) });
                }}
                onKeyDown={(e) => {
                  if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                  }
                }}
                placeholder="0"
                className="min-w-0 bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-white tabular-nums focus:outline-none p-0 m-0 border-none shrink-0"
                style={{ width: `${Math.max(1, String(item.price !== '' ? item.price : '0').length)}ch` }}
              />
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 select-none pointer-events-none ml-[2px]">
                원
              </span>
            </div>
          </div>

          {/* Converted Price Box (col-span-7 in 3-way, col-span-6 in 2-way, col-span-12 in count) */}
          <div className={colResult}>
            <div
              className={`${boxHeight} px-1.5 sm:px-2 rounded-lg flex items-center justify-center transition-all shadow-2xs ${
                isWinner
                  ? 'bg-emerald-100/95 dark:bg-emerald-950/80 border-2 border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-400/30'
                  : isRunnerUp
                  ? 'bg-sky-100/70 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-700'
                  : isLoser
                  ? 'bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700'
                  : 'bg-sky-50/90 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-800'
              }`}
            >
              <span
                className={`tabular-nums truncate whitespace-nowrap ${
                  isWinner
                    ? 'text-base sm:text-lg lg:text-xl font-black text-emerald-950 dark:text-emerald-100'
                    : isRunnerUp
                    ? 'text-sm sm:text-base lg:text-lg font-extrabold text-sky-900 dark:text-sky-100'
                    : isLoser
                    ? 'text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400'
                    : 'text-base sm:text-lg font-black text-sky-950 dark:text-sky-100'
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
            onClick={resetAll}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 rounded-xl transition-all shadow-xs"
            title="모든 상품의 이름, 용량, 수량, 가격을 전체 초기화합니다"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>전체 리셋</span>
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
            !isAllEqual
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
              : 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800'
          }`}
        >
          <p
            className={`text-base sm:text-lg font-black ${
              !isAllEqual
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
