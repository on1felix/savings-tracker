import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Activity, Trophy, Coins, BarChart3, CalendarDays, Flame, TrendingUp, TrendingDown } from 'lucide-react';
import CountUp from './CountUp';

const currencySymbols = { RUB: '₽', USD: '$', EUR: '€', KGS: 'с' };

const monthsShortRu = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

const pluralDays = (n) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'день';
  if ([2, 3, 4].includes(m10) && ![12, 13, 14].includes(m100)) return 'дня';
  return 'дней';
};

const fmtNum = (n) => n.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
const fmtNum2 = (n) => n.toLocaleString('ru-RU', { maximumFractionDigits: 2 });

function startOfDay(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

const formatDayLabel = (d) => `${d.getDate()} ${monthsShortRu[d.getMonth()]}`;
const formatDayShort = (d) => `${d.getDate()}`;

const SVG_W = 600;
const SVG_H = 130;
const DAYS = 14;

const cardMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: 0.25 },
};
const chartFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 },
};

function makeBarMotion(i, targetY, targetHeight) {
  return {
    initial: { y: SVG_H, height: 0 },
    animate: { y: targetY, height: targetHeight },
    transition: { duration: 0.8, delay: 0.05 + i * 0.04, ease: [0.16, 1, 0.3, 1] },
  };
}

export default function SavingsStats({ transactions = [], currency = 'RUB' }) {
  const symbol = currencySymbols[currency] || '₽';

  const stats = useMemo(() => {
    if (!transactions.length) {
      return {
        total: 0,
        count: 0,
        biggest: 0,
        avgDeposit: 0,
        thisMonth: 0,
        prevMonth: 0,
        days: [],
        maxDay: 0,
        streak: 0,
      };
    }

    const txs = transactions
      .map((t) => ({ amount: parseFloat(t.amount), date: new Date(t.created_at) }))
      .sort((a, b) => a.date - b.date);

    const total = txs.reduce((s, t) => s + t.amount, 0);
    const count = txs.length;
    const biggest = Math.max(...txs.map((t) => t.amount));
    const avgDeposit = total / count;

    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();
    const prevDate = new Date(curYear, curMonth - 1, 1);
    const prevMonth = prevDate.getMonth();
    const prevYear = prevDate.getFullYear();

    const thisMonthTotal = txs
      .filter((t) => t.date.getMonth() === curMonth && t.date.getFullYear() === curYear)
      .reduce((s, t) => s + t.amount, 0);
    const prevMonthTotal = txs
      .filter((t) => t.date.getMonth() === prevMonth && t.date.getFullYear() === prevYear)
      .reduce((s, t) => s + t.amount, 0);

    const days = [];
    const today = startOfDay(now);
    for (let i = DAYS - 1; i >= 0; i--) {
      const ds = new Date(today);
      ds.setDate(ds.getDate() - i);
      const de = new Date(ds);
      de.setDate(de.getDate() + 1);
      const sum = txs
        .filter((t) => t.date >= ds && t.date < de)
        .reduce((s, t) => s + t.amount, 0);
      days.push({ start: ds, amount: sum });
    }
    const maxDay = Math.max(...days.map((d) => d.amount), 1);

    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].amount > 0) streak++;
      else break;
    }

    return {
      total,
      count,
      biggest,
      avgDeposit,
      thisMonth: thisMonthTotal,
      prevMonth: prevMonthTotal,
      days,
      maxDay,
      streak,
    };
  }, [transactions]);

  const monthDelta = stats.thisMonth - stats.prevMonth;
  const chartKey = `${transactions.length}-${stats.total}-${stats.thisMonth}`;

  const bars = useMemo(() => {
    if (!stats.days.length || stats.maxDay <= 0) return [];
    const slotW = SVG_W / stats.days.length;
    const barWidth = slotW * 0.6;
    return stats.days.map((d, i) => {
      const rawH = (d.amount / stats.maxDay) * (SVG_H - 6);
      const barHeight = d.amount > 0 ? Math.max(6, rawH) : 4;
      const barY = SVG_H - barHeight;
      const barX = i * slotW + (slotW - barWidth) / 2;
      return {
        x: barX,
        y: barY,
        width: barWidth,
        height: barHeight,
        amount: d.amount,
        isActive: d.amount > 0,
      };
    });
  }, [stats.days, stats.maxDay]);

  const dateGridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${stats.days.length || DAYS}, minmax(0, 1fr))`,
    }),
    [stats.days.length],
  );

  return (
    <motion.div
      {...cardMotion}
      className="relative overflow-hidden backdrop-blur-sm bg-dark-light/30 border-2 border-primary/20 rounded-3xl p-5 md:p-6"
    >
      <div className="pointer-events-none absolute -top-32 -left-32 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-72 h-72 bg-accent/15 rounded-full blur-3xl" />

      <div className="relative flex items-center gap-3 mb-5">
        <div className="p-2 border border-accent/20 rounded-xl bg-accent/5">
          <Activity className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold">Активность</h2>
          <p className="text-sm text-gray-400">Динамика по дням и личные рекорды</p>
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-3 mb-5">
        <MiniStat
          icon={<Coins className="w-4 h-4 text-success" />}
          label="Этот месяц"
          numValue={stats.thisMonth}
          numSuffix={` ${symbol}`}
          delta={stats.count > 0 ? monthDelta : null}
          deltaSymbol={symbol}
        />
        <MiniStat
          icon={<Trophy className="w-4 h-4 text-secondary" />}
          label="Самое крупное"
          numValue={stats.biggest}
          numSuffix={` ${symbol}`}
          numDecimals={2}
        />
        <MiniStat
          icon={<BarChart3 className="w-4 h-4 text-primary" />}
          label="Всего пополнений"
          numValue={stats.count}
          sub={stats.avgDeposit > 0 ? `~${fmtNum2(stats.avgDeposit)} ${symbol} в среднем` : null}
        />
        <MiniStat
          icon={<Flame className="w-4 h-4 text-secondary" />}
          label="Серия"
          numValue={stats.streak}
          numSuffix={stats.streak > 0 ? ` ${pluralDays(stats.streak)}` : ''}
          sub="подряд с пополнением"
        />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-accent" />
            Последние {DAYS} дней
          </span>
          {stats.maxDay > 0 && (
            <span className="text-xs text-gray-500">
              Макс за день: {fmtNum(stats.maxDay)} {symbol}
            </span>
          )}
        </div>

        {bars.length > 0 ? (
          <>
            <motion.svg
              key={chartKey}
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full h-28"
              preserveAspectRatio="none"
              {...chartFade}
            >
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6584" />
                  <stop offset="50%" stopColor="#00D9FF" />
                  <stop offset="100%" stopColor="#6C63FF" />
                </linearGradient>
                <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {bars.map((b, i) => (
                <motion.rect
                  key={`bar-${i}`}
                  x={b.x}
                  width={b.width}
                  rx="4"
                  fill={b.isActive ? 'url(#barGrad)' : 'rgba(108,99,255,0.12)'}
                  filter={b.isActive ? 'url(#barGlow)' : undefined}
                  {...makeBarMotion(i, b.y, b.height)}
                >
                  <title>{`${formatDayLabel(stats.days[i].start)}: ${fmtNum2(b.amount)} ${symbol}`}</title>
                </motion.rect>
              ))}
            </motion.svg>

            <div className="grid mt-1.5" style={dateGridStyle}>
              {stats.days.map((d, i) => {
                const showMonth = i === 0 || i === stats.days.length - 1 || d.start.getDate() === 1 || i % 3 === 0;
                return (
                  <span
                    key={`lbl-${i}`}
                    className="text-[9px] text-gray-500 text-center truncate"
                  >
                    {showMonth ? formatDayLabel(d.start) : formatDayShort(d.start)}
                  </span>
                );
              })}
            </div>
          </>
        ) : (
          <div className="h-28 flex items-center justify-center text-gray-500 text-sm border border-primary/10 rounded-2xl">
            Пополни копилку — появится график по дням
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MiniStat({ icon, label, numValue, numPrefix, numSuffix, numDecimals, sub, delta, deltaSymbol }) {
  const hasValue = numValue != null && numValue > 0;
  return (
    <div className="bg-dark-light/40 backdrop-blur-sm border border-primary/10 rounded-2xl p-3 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="text-base md:text-lg font-display font-semibold text-white">
        {hasValue ? (
          <CountUp
            end={numValue}
            duration={1.2}
            prefix={numPrefix || ''}
            suffix={numSuffix || ''}
            decimals={numDecimals || 0}
          />
        ) : (
          '—'
        )}
      </div>
      {delta != null && delta !== 0 && (
        <div
          className={`flex items-center gap-1 text-[11px] mt-0.5 ${
            delta >= 0 ? 'text-success' : 'text-secondary'
          }`}
        >
          {delta >= 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>
            {delta >= 0 ? '+' : '−'}
            {fmtNum(Math.abs(delta))} {deltaSymbol} к прош. мес.
          </span>
        </div>
      )}
      {sub && <div className="text-[11px] text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}
