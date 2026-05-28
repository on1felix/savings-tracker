import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, CalendarClock, Zap, Sparkles, Target, Repeat } from 'lucide-react';

const currencySymbols = { RUB: '₽', USD: '$', EUR: '€', KGS: 'с' };

const monthsRu = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

const formatDateRu = (d) => `${d.getDate()} ${monthsRu[d.getMonth()]} ${d.getFullYear()}`;

const pluralDays = (n) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'день';
  if ([2, 3, 4].includes(m10) && ![12, 13, 14].includes(m100)) return 'дня';
  return 'дней';
};

const pluralDeposits = (n) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'пополнение';
  if ([2, 3, 4].includes(m10) && ![12, 13, 14].includes(m100)) return 'пополнения';
  return 'пополнений';
};

const fmtNum = (n) => n.toLocaleString('ru-RU', { maximumFractionDigits: 2 });

// motion presets вынесены в константы, чтобы избежать двойных фигурных в JSX
const cardMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: 0.15 },
};
const svgMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 },
};
const lineMotion = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: { duration: 1.0, ease: 'easeOut' },
};
const areaMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8, delay: 0.2 },
};
const projMotion = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: { duration: 1.1, delay: 0.4, ease: 'easeOut' },
};
const dotMotion = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: 'spring', stiffness: 220, damping: 18, delay: 1.2 },
};
const valueSwap = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35 },
};

const hoverLift = { y: -2 };
const hoverTransition = { duration: 0.2 };

const legendDashStyle = {
  backgroundImage: 'repeating-linear-gradient(90deg, #00D9FF 0 4px, transparent 4px 8px)',
};

function computeForecast(transactions, currentAmount, targetAmount) {
  const remaining = Math.max(0, targetAmount - currentAmount);
  const done = targetAmount > 0 && currentAmount >= targetAmount;

  if (!transactions.length || done) {
    return {
      remaining,
      done,
      avgDeposit: 0,
      avgInterval: 0,
      avgPerDay: 0,
      daysLeft: done ? 0 : null,
      depositsLeft: done ? 0 : null,
      daysUntilNext: 0,
      eta: done ? new Date() : null,
    };
  }

  const sorted = [...transactions]
    .map((t) => ({ amount: parseFloat(t.amount), date: new Date(t.created_at) }))
    .sort((a, b) => a.date - b.date);

  let wSum = 0;
  let wAmt = 0;
  sorted.forEach((t, i) => {
    const w = i + 1;
    wSum += w;
    wAmt += t.amount * w;
  });
  const avgDeposit = wAmt / wSum;

  const intervals = [];
  for (let i = 1; i < sorted.length; i++) {
    intervals.push((sorted[i].date - sorted[i - 1].date) / 86400000);
  }
  let avgInterval;
  if (intervals.length === 0) {
    avgInterval = Math.max(1, (Date.now() - sorted[0].date.getTime()) / 86400000);
  } else {
    let iwSum = 0;
    let iwVal = 0;
    intervals.forEach((iv, i) => {
      const w = i + 1;
      iwSum += w;
      iwVal += iv * w;
    });
    avgInterval = Math.max(0.5, iwVal / iwSum);
  }

  if (avgDeposit <= 0) {
    return { remaining, done, avgDeposit: 0, avgInterval, avgPerDay: 0, daysLeft: null, depositsLeft: null, daysUntilNext: 0, eta: null };
  }

  const avgPerDay = avgDeposit / avgInterval;
  const depositsLeft = Math.ceil(remaining / avgDeposit);
  const daysSinceLast = (Date.now() - sorted[sorted.length - 1].date.getTime()) / 86400000;
  const daysUntilNext = Math.max(0, avgInterval - Math.max(0, daysSinceLast));
  const daysLeft = Math.ceil(daysUntilNext + Math.max(0, depositsLeft - 1) * avgInterval);
  const eta = new Date(Date.now() + daysLeft * 86400000);

  return { remaining, done, avgDeposit, avgInterval, avgPerDay, depositsLeft, daysUntilNext, daysLeft, eta };
}

function buildChart(transactions, currentAmount, targetAmount, forecast) {
  const sorted = [...transactions]
    .map((t) => ({ amount: parseFloat(t.amount), time: new Date(t.created_at).getTime() }))
    .sort((a, b) => a.time - b.time);

  if (!sorted.length) return null;

  let cum = 0;
  const hist = [{ x: sorted[0].time, y: 0 }];
  sorted.forEach((t) => {
    cum += t.amount;
    hist.push({ x: t.time, y: cum });
  });
  if (Math.abs(hist[hist.length - 1].y - currentAmount) > 0.01) {
    hist.push({ x: Date.now(), y: currentAmount });
  }

  const proj = [];
  if (forecast.eta && !forecast.done && forecast.depositsLeft && forecast.avgDeposit > 0) {
    let y = currentAmount;
    let t = Date.now() + forecast.daysUntilNext * 86400000;
    proj.push({ x: Date.now(), y });
    const maxSteps = Math.min(forecast.depositsLeft, 40);
    for (let i = 0; i < maxSteps; i++) {
      proj.push({ x: t, y });
      const next = Math.min(targetAmount, y + forecast.avgDeposit);
      y = next;
      proj.push({ x: t, y });
      t += forecast.avgInterval * 86400000;
      if (y >= targetAmount) break;
    }
    if (proj[proj.length - 1].x < forecast.eta.getTime()) {
      proj.push({ x: forecast.eta.getTime(), y: targetAmount });
    }
  }

  const all = [...hist, ...proj];
  const minX = Math.min(...all.map((p) => p.x));
  const maxX = Math.max(...all.map((p) => p.x), minX + 86400000);
  const maxY = Math.max(targetAmount, ...all.map((p) => p.y), 1);

  const W = 600;
  const H = 180;
  const PAD_X = 12;
  const PAD_Y = 14;

  const sx = (x) => PAD_X + ((x - minX) / (maxX - minX)) * (W - PAD_X * 2);
  const sy = (y) => H - PAD_Y - (y / maxY) * (H - PAD_Y * 2);

  const buildPath = (pts) =>
    pts.map((p, i) => `${i ? 'L' : 'M'} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ');

  const histPath = buildPath(hist);
  const projPath = proj.length ? buildPath(proj) : '';
  const areaPath =
    hist.length > 1
      ? `${histPath} L ${sx(hist[hist.length - 1].x).toFixed(1)} ${sy(0).toFixed(1)} L ${sx(hist[0].x).toFixed(1)} ${sy(0).toFixed(1)} Z`
      : '';

  const targetY = sy(targetAmount);
  const etaPoint = forecast.eta
    ? { x: sx(forecast.eta.getTime()), y: sy(targetAmount) }
    : null;

  return { W, H, histPath, projPath, areaPath, targetY, etaPoint };
}

export default function SavingsForecast({
  transactions = [],
  currentAmount = 0,
  targetAmount = 0,
  currency = 'RUB',
}) {
  const symbol = currencySymbols[currency] || '₽';

  const forecast = useMemo(
    () => computeForecast(transactions, currentAmount, targetAmount),
    [transactions, currentAmount, targetAmount],
  );

  const svg = useMemo(
    () => buildChart(transactions, currentAmount, targetAmount, forecast),
    [transactions, currentAmount, targetAmount, forecast],
  );

  const chartKey = `${transactions.length}-${currentAmount}-${targetAmount}`;

  const etaText = forecast.done
    ? 'Уже достигнута 🎉'
    : forecast.eta
      ? formatDateRu(forecast.eta)
      : 'Недостаточно данных';

  const intervalText =
    forecast.avgInterval > 0
      ? forecast.avgInterval >= 1
        ? `каждые ~${forecast.avgInterval.toFixed(1)} ${pluralDays(Math.round(forecast.avgInterval))}`
        : 'несколько раз в день'
      : '—';

  return (
    <motion.div
      {...cardMotion}
      className="relative overflow-hidden backdrop-blur-sm bg-dark-light/30 border-2 border-primary/20 rounded-3xl p-5 md:p-7"
    >
      <div className="pointer-events-none absolute -top-32 -right-32 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 w-72 h-72 bg-secondary/15 rounded-full blur-3xl" />

      <div className="relative flex items-center gap-3 mb-5">
        <div className="p-2 border border-primary/20 rounded-xl bg-primary/5">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold">Прогноз цели</h2>
          <p className="text-sm text-gray-400">История + частота твоих пополнений</p>
        </div>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <Stat
          icon={<CalendarClock className="w-4 h-4 text-accent" />}
          label="Цель будет достигнута"
          value={etaText}
          swapKey={etaText}
          highlight
        />
        <Stat
          icon={<Repeat className="w-4 h-4 text-primary" />}
          label="Частота пополнений"
          value={intervalText}
          sub={forecast.avgDeposit > 0 ? `~${fmtNum(forecast.avgDeposit)} ${symbol} за раз` : null}
          swapKey={intervalText}
        />
        <Stat
          icon={<Target className="w-4 h-4 text-success" />}
          label={forecast.done ? 'Поздравляю!' : 'Осталось'}
          value={
            forecast.done
              ? '0'
              : forecast.daysLeft != null
                ? `${forecast.daysLeft} ${pluralDays(forecast.daysLeft)}`
                : '—'
          }
          sub={
            !forecast.done && forecast.depositsLeft != null && forecast.depositsLeft > 0
              ? `~${forecast.depositsLeft} ${pluralDeposits(forecast.depositsLeft)} · ${fmtNum(forecast.remaining)} ${symbol}`
              : null
          }
          swapKey={`${forecast.daysLeft}-${forecast.depositsLeft}`}
        />
      </div>

      <div className="relative">
        {svg ? (
          <motion.svg
            key={chartKey}
            viewBox={`0 0 ${svg.W} ${svg.H}`}
            className="w-full h-44"
            preserveAspectRatio="none"
            {...svgMotion}
          >
            <defs>
              <linearGradient id="fcArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="fcLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6C63FF" />
                <stop offset="50%" stopColor="#00D9FF" />
                <stop offset="100%" stopColor="#FF6584" />
              </linearGradient>
              <filter id="fcGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <line
              x1="0"
              x2={svg.W}
              y1={svg.targetY}
              y2={svg.targetY}
              stroke="rgba(255,255,255,0.18)"
              strokeDasharray="4 4"
            />
            <text
              x={svg.W - 6}
              y={svg.targetY - 5}
              fill="rgba(255,255,255,0.55)"
              fontSize="10"
              textAnchor="end"
            >
              Цель
            </text>

            {svg.areaPath && (
              <motion.path d={svg.areaPath} fill="url(#fcArea)" {...areaMotion} />
            )}

            <motion.path
              d={svg.histPath}
              fill="none"
              stroke="url(#fcLine)"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#fcGlow)"
              {...lineMotion}
            />

            {svg.projPath && (
              <motion.path
                d={svg.projPath}
                fill="none"
                stroke="#00D9FF"
                strokeWidth="2"
                strokeDasharray="5 5"
                strokeLinecap="round"
                {...projMotion}
              />
            )}

            {svg.etaPoint && !forecast.done && (
              <motion.circle
                cx={svg.etaPoint.x}
                cy={svg.etaPoint.y}
                r="5"
                fill="#00D9FF"
                stroke="#0a0a0f"
                strokeWidth="2"
                {...dotMotion}
              />
            )}
          </motion.svg>
        ) : (
          <div className="h-44 flex items-center justify-center gap-2 text-gray-500 text-sm border border-primary/10 rounded-2xl">
            <TrendingUp className="w-4 h-4 opacity-50" />
            Пополни копилку — и тут появится график
          </div>
        )}

        {svg && (
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-6 h-[3px] rounded-full bg-gradient-to-r from-primary via-accent to-secondary" />
              Накопления
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-6 h-[3px]" style={legendDashStyle} />
              Прогноз по частоте
            </span>
            {forecast.avgPerDay > 0 && (
              <span className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-primary" />
                ~{fmtNum(forecast.avgPerDay)} {symbol}/день
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Stat({ icon, label, value, sub, highlight, swapKey }) {
  return (
    <motion.div
      whileHover={hoverLift}
      transition={hoverTransition}
      className={`relative bg-dark-light/40 backdrop-blur-sm border rounded-2xl p-4 transition-colors ${
        highlight ? 'border-primary/40' : 'border-primary/10 hover:border-primary/30'
      }`}
    >
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
        {icon}
        <span>{label}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={swapKey || value}
          {...valueSwap}
          className={`text-base md:text-lg font-display font-semibold ${
            highlight ? 'text-gradient' : 'text-white'
          }`}
        >
          {value}
        </motion.div>
      </AnimatePresence>
      {sub && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`sub-${swapKey || sub}`}
            {...valueSwap}
            className="text-xs text-gray-500 mt-0.5"
          >
            {sub}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
