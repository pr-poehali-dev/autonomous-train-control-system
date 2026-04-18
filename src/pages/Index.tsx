import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

type Section = "dashboard" | "monitoring" | "diagnostics" | "routes" | "safety" | "statistics" | "settings";

const NAV_ITEMS: { id: Section; label: string; icon: string }[] = [
  { id: "dashboard", label: "Панель", icon: "LayoutDashboard" },
  { id: "monitoring", label: "Монитор", icon: "Activity" },
  { id: "diagnostics", label: "Диагност.", icon: "Cpu" },
  { id: "routes", label: "Маршруты", icon: "Map" },
  { id: "safety", label: "Безопасн.", icon: "ShieldCheck" },
  { id: "statistics", label: "Статист.", icon: "BarChart3" },
  { id: "settings", label: "Настройки", icon: "Settings2" },
];

function useSimulatedData() {
  const [speed, setSpeed] = useState(187);
  const [acceleration, setAcceleration] = useState(0.8);
  const [power, setPower] = useState(74);
  const [brakeForce, setBrakeForce] = useState(2);
  const [distance, setDistance] = useState(142.7);
  const [temp, setTemp] = useState(82);
  const [voltage, setVoltage] = useState(24.8);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(s => Math.max(0, Math.min(320, s + (Math.random() - 0.5) * 3)));
      setAcceleration(a => Math.max(-2, Math.min(3, a + (Math.random() - 0.5) * 0.3)));
      setPower(p => Math.max(0, Math.min(100, p + (Math.random() - 0.5) * 2)));
      setBrakeForce(b => Math.max(0, Math.min(100, b + (Math.random() - 0.48) * 1)));
      setDistance(d => d + 0.001);
      setTemp(t => Math.max(70, Math.min(110, t + (Math.random() - 0.5) * 0.5)));
      setVoltage(v => Math.max(22, Math.min(28, v + (Math.random() - 0.5) * 0.1)));
      setTime(new Date());
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return { speed, acceleration, power, brakeForce, distance, temp, voltage, time };
}

function StatusDot({ active, color = "#00ffcc" }: { active: boolean; color?: string }) {
  return (
    <div className="w-2 h-2 rounded-full shrink-0" style={{
      background: active ? color : "#1a2535",
      boxShadow: active ? `0 0 6px ${color}` : "none",
      animation: active ? "pulse-neon 2s ease-in-out infinite" : "none"
    }} />
  );
}

function SpeedGauge({ speed }: { speed: number }) {
  const maxSpeed = 320;
  const pct = speed / maxSpeed;
  const circumference = 2 * Math.PI * 54;
  const color = speed > 250 ? "#ff2244" : speed > 180 ? "#ffcc00" : "#00ffcc";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
      <svg width="180" height="180" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#1a2535" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={circumference * 0.125}
          transform="rotate(135 60 60)" />
        <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${circumference * pct * 0.75} ${circumference * (1 - pct * 0.75)}`}
          strokeDashoffset={circumference * 0.125}
          transform="rotate(135 60 60)"
          style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 6px ${color})` }} />
        <circle cx="60" cy="60" r="44" fill="#0d1117" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
          const angle = (-225 + i * (270 / 8)) * (Math.PI / 180);
          const x1 = 60 + 48 * Math.cos(angle);
          const y1 = 60 + 48 * Math.sin(angle);
          const x2 = 60 + 42 * Math.cos(angle);
          const y2 = 60 + 42 * Math.sin(angle);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a2535" strokeWidth="1.5" />;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-bold leading-none" style={{ color, textShadow: `0 0 12px ${color}66` }}>
          {Math.round(speed)}
        </span>
        <span className="text-xs mt-1" style={{ color: "var(--text-mid)" }}>км/ч</span>
      </div>
    </div>
  );
}

function MiniBar({ value, max = 100, color = "#00ffcc", label, unit = "%" }: {
  value: number; max?: number; color?: string; label: string; unit?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs" style={{ color: "var(--text-mid)" }}>{label}</span>
        <span className="font-mono text-sm font-semibold" style={{ color }}>
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "var(--surface-4)" }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}66` }} />
      </div>
    </div>
  );
}

function DashboardSection({ data }: { data: ReturnType<typeof useSimulatedData> }) {
  const { speed, acceleration, power, brakeForce, distance, temp, voltage, time } = data;
  const events = [
    { time: "14:23:01", msg: "Автопилот: скорость откорректирована до 185 км/ч", type: "info" },
    { time: "14:21:47", msg: "Маршрут: пройдена станция Краснодар-1", type: "ok" },
    { time: "14:19:33", msg: "Торможение: снижение перед кривой R=800", type: "warn" },
    { time: "14:17:20", msg: "Связь: переключение на ретранслятор #4", type: "info" },
    { time: "14:15:08", msg: "Система: все параметры в норме", type: "ok" },
  ];

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto p-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4 surface-card rounded-xl p-5 flex flex-col items-center gap-3 border neon-border-cyan animate-fade-in-up">
          <div className="w-full flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-mid)" }}>Скорость</span>
            <div className="flex items-center gap-1.5">
              <StatusDot active={true} />
              <span className="font-mono text-xs neon-text-cyan">АВТО</span>
            </div>
          </div>
          <SpeedGauge speed={speed} />
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="surface-card-elevated rounded-lg p-2.5 text-center">
              <div className="font-mono text-lg font-bold" style={{ color: "var(--neon-blue)" }}>
                {acceleration >= 0 ? "+" : ""}{acceleration.toFixed(2)}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-mid)" }}>м/с² разгон</div>
            </div>
            <div className="surface-card-elevated rounded-lg p-2.5 text-center">
              <div className="font-mono text-lg font-bold" style={{ color: "var(--neon-orange)" }}>
                {brakeForce.toFixed(1)}%
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-mid)" }}>торможение</div>
            </div>
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-4">
          <div className="surface-card rounded-xl p-4 border neon-border-blue flex-1 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-mid)" }}>Тяговые системы</div>
            <div className="space-y-3.5">
              <MiniBar value={power} label="Мощность тяги" color="var(--neon-cyan)" />
              <MiniBar value={brakeForce} label="Тормозное усилие" color="var(--neon-orange)" />
              <MiniBar value={temp} max={120} label="Температура двигателя" unit="°C" color={temp > 100 ? "var(--neon-red)" : "var(--neon-green)"} />
              <MiniBar value={voltage} max={30} label="Напряжение бортсети" unit=" В" color="var(--neon-blue)" />
            </div>
          </div>
          <div className="surface-card rounded-xl p-4 border neon-border-blue animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-mid)" }}>Состояние систем</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Автопилот", ok: true, warn: false },
                { name: "Торможение", ok: true, warn: false },
                { name: "Навигация", ok: true, warn: false },
                { name: "Связь", ok: true, warn: false },
                { name: "КЛУБ-У", ok: true, warn: true },
                { name: "АРС", ok: true, warn: false },
              ].map(s => (
                <div key={s.name} className="flex items-center gap-2 rounded-lg px-2.5 py-2" style={{ background: "var(--surface-3)" }}>
                  <StatusDot active={s.ok} color={s.warn ? "var(--neon-yellow)" : "var(--neon-green)"} />
                  <span className="text-xs" style={{ color: "var(--text-bright)" }}>{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-4">
          <div className="surface-card rounded-xl p-4 border animate-fade-in-up" style={{ animationDelay: "0.15s", borderColor: "var(--surface-4)" }}>
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-mid)" }}>Текущий маршрут</div>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Откуда", value: "Москва-Казанская" },
                { label: "Куда", value: "Казань-Пассажирская" },
              ].map(r => (
                <div key={r.label} className="flex justify-between">
                  <span style={{ color: "var(--text-mid)" }} className="text-sm">{r.label}</span>
                  <span className="font-semibold text-sm" style={{ color: "var(--text-bright)" }}>{r.value}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span style={{ color: "var(--text-mid)" }} className="text-sm">Пройдено</span>
                <span className="font-mono font-semibold text-sm neon-text-cyan">{distance.toFixed(1)} км</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-mid)" }} className="text-sm">Прибытие</span>
                <span className="font-semibold text-sm" style={{ color: "var(--neon-green)" }}>17:42 (+0 мин)</span>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-4)" }}>
              <div className="h-full rounded-full" style={{
                width: `${(distance / 818) * 100}%`,
                background: "linear-gradient(90deg, var(--neon-blue), var(--neon-cyan))",
                transition: "width 0.5s"
              }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{ color: "var(--text-dim)" }}>0 км</span>
              <span className="text-xs" style={{ color: "var(--text-dim)" }}>818 км</span>
            </div>
          </div>
          <div className="surface-card rounded-xl p-4 border animate-fade-in-up" style={{ animationDelay: "0.2s", borderColor: "var(--surface-4)" }}>
            <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-mid)" }}>Системное время</div>
            <div className="font-mono text-3xl font-bold neon-text-cyan tracking-widest">
              {time.toLocaleTimeString("ru-RU")}
            </div>
            <div className="font-mono text-xs mt-1" style={{ color: "var(--text-mid)" }}>
              {time.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
          </div>
          <div className="surface-card rounded-xl p-4 border flex-1 animate-fade-in-up" style={{ animationDelay: "0.25s", borderColor: "var(--surface-4)" }}>
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-mid)" }}>Журнал событий</div>
            <div className="space-y-2">
              {events.map((e, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="font-mono text-xs shrink-0 mt-0.5" style={{ color: "var(--text-dim)" }}>{e.time}</span>
                  <span className="text-xs leading-tight" style={{
                    color: e.type === "ok" ? "var(--neon-green)" : e.type === "warn" ? "var(--neon-yellow)" : "var(--text-bright)"
                  }}>{e.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonitoringSection({ data }: { data: ReturnType<typeof useSimulatedData> }) {
  const historyRef = useRef<number[]>(Array(40).fill(187));
  const [history, setHistory] = useState<number[]>(Array(40).fill(187));

  useEffect(() => {
    historyRef.current = [...historyRef.current.slice(1), data.speed];
    setHistory([...historyRef.current]);
  }, [data.speed]);

  const maxH = Math.max(...history) + 5;
  const minH = Math.min(...history) - 5;

  const points = history.map((v, i) => {
    const x = (i / (history.length - 1)) * 100;
    const y = 100 - ((v - minH) / (maxH - minH)) * 90 - 5;
    return `${x},${y}`;
  }).join(" ");

  const params = [
    { label: "Скорость", value: data.speed.toFixed(1), unit: "км/ч", color: "var(--neon-cyan)", icon: "Gauge" },
    { label: "Ускорение", value: (data.acceleration >= 0 ? "+" : "") + data.acceleration.toFixed(2), unit: "м/с²", color: "var(--neon-blue)", icon: "TrendingUp" },
    { label: "Мощность", value: data.power.toFixed(1), unit: "%", color: "var(--neon-green)", icon: "Zap" },
    { label: "Температура", value: data.temp.toFixed(1), unit: "°C", color: data.temp > 100 ? "var(--neon-red)" : "var(--neon-orange)", icon: "Thermometer" },
    { label: "Напряжение", value: data.voltage.toFixed(2), unit: "В", color: "var(--neon-yellow)", icon: "Battery" },
    { label: "Торможение", value: data.brakeForce.toFixed(1), unit: "%", color: "var(--neon-orange)", icon: "Disc" },
  ];

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto p-4">
      <div className="grid grid-cols-3 gap-3">
        {params.map(p => (
          <div key={p.label} className="surface-card rounded-xl p-4 border flex gap-4 items-center" style={{ borderColor: "var(--surface-4)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${p.color}18` }}>
              <Icon name={p.icon} size={20} style={{ color: p.color }} />
            </div>
            <div>
              <div className="text-xs mb-0.5" style={{ color: "var(--text-mid)" }}>{p.label}</div>
              <div className="font-mono text-xl font-bold" style={{ color: p.color }}>
                {p.value}<span className="text-sm ml-1" style={{ color: "var(--text-mid)" }}>{p.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="surface-card rounded-xl p-5 border flex-1" style={{ borderColor: "var(--surface-4)" }}>
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-mid)" }}>График скорости (реальное время)</span>
          <span className="font-mono text-xs neon-text-cyan">{data.speed.toFixed(1)} км/ч</span>
        </div>
        <div className="relative" style={{ height: 200 }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ffcc" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00ffcc" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 25, 50, 75, 100].map(v => (
              <line key={v} x1="0" y1={v} x2="100" y2={v} stroke="#1a2535" strokeWidth="0.5" />
            ))}
            <polyline points={`0,100 ${points} 100,100`} fill="url(#speedGrad)" stroke="none" />
            <polyline points={points} fill="none" stroke="#00ffcc" strokeWidth="0.8"
              style={{ filter: "drop-shadow(0 0 2px #00ffcc)" }} />
          </svg>
        </div>
      </div>
    </div>
  );
}

function DiagnosticsSection() {
  const components = [
    { name: "Тяговый двигатель #1", status: "ok", value: "82°C", detail: "Норма до 120°C" },
    { name: "Тяговый двигатель #2", status: "ok", value: "79°C", detail: "Норма до 120°C" },
    { name: "Тормозная система", status: "ok", value: "100%", detail: "Давление в норме" },
    { name: "БЛОК АРС", status: "ok", value: "v4.2.1", detail: "Прошивка актуальна" },
    { name: "КЛУБ-У", status: "warn", value: "WARN", detail: "Проверьте антенну" },
    { name: "Навигационный модуль", status: "ok", value: "GPS+ГЛОНАСС", detail: "12 спутников" },
    { name: "Радиостанция", status: "ok", value: "161.475 МГц", detail: "Канал 1, норма" },
    { name: "Бортовой компьютер", status: "ok", value: "CPU 12%", detail: "RAM: 34%" },
    { name: "Система пожаротушения", status: "ok", value: "Готова", detail: "Датчики активны" },
    { name: "Токоприёмник", status: "ok", value: "25 кВ", detail: "КС в норме" },
  ];

  const sc: Record<string, string> = { ok: "var(--neon-green)", warn: "var(--neon-yellow)", err: "var(--neon-red)" };
  const sl: Record<string, string> = { ok: "НОРМА", warn: "ВНИМАНИЕ", err: "ОШИБКА" };

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto p-4">
      <div className="grid grid-cols-3 gap-3 mb-2">
        {[
          { label: "Всего компонентов", value: "10", color: "var(--neon-cyan)" },
          { label: "В норме", value: "9", color: "var(--neon-green)" },
          { label: "Требуют внимания", value: "1", color: "var(--neon-yellow)" },
        ].map(s => (
          <div key={s.label} className="surface-card rounded-xl p-4 border text-center" style={{ borderColor: "var(--surface-4)" }}>
            <div className="font-mono text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-mid)" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="surface-card rounded-xl border overflow-hidden" style={{ borderColor: "var(--surface-4)" }}>
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b" style={{ borderColor: "var(--surface-4)", background: "var(--surface-3)" }}>
          {["Компонент", "Статус", "Значение", "Детали"].map((h, i) => (
            <span key={h} className={`${i === 0 ? "col-span-4" : i === 3 ? "col-span-4" : "col-span-2"} text-xs uppercase tracking-wider`} style={{ color: "var(--text-dim)" }}>{h}</span>
          ))}
        </div>
        {components.map((c) => (
          <div key={c.name} className="grid grid-cols-12 gap-2 px-4 py-3 border-b items-center"
            style={{ borderColor: "var(--surface-4)" }}>
            <span className="col-span-4 text-sm" style={{ color: "var(--text-bright)" }}>{c.name}</span>
            <span className="col-span-2 flex items-center gap-1.5">
              <StatusDot active={true} color={sc[c.status]} />
              <span className="text-xs font-mono font-semibold" style={{ color: sc[c.status] }}>{sl[c.status]}</span>
            </span>
            <span className="col-span-2 font-mono text-sm" style={{ color: "var(--text-bright)" }}>{c.value}</span>
            <span className="col-span-4 text-xs" style={{ color: "var(--text-mid)" }}>{c.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoutesSection() {
  const stations = [
    { name: "Москва-Казанская", km: 0, eta: "10:00", passed: true, current: false, type: "origin" },
    { name: "Петушки", km: 116, eta: "11:12", passed: true, current: false, type: "stop" },
    { name: "Владимир", km: 191, eta: "11:58", passed: false, current: true, type: "stop" },
    { name: "Нижний Новгород-Моск.", km: 441, eta: "14:05", passed: false, current: false, type: "stop" },
    { name: "Казань-Пассажирская", km: 818, eta: "17:42", passed: false, current: false, type: "destination" },
  ];

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Маршрут №43", value: "Москва — Казань", sub: "818 км · 7ч 42мин", color: "var(--text-bright)" },
          { label: "Следующая остановка", value: "Нижний Новгород", sub: "через 250 км · 14:05", color: "var(--neon-cyan)" },
          { label: "Пункт назначения", value: "Казань-Пассажирская", sub: "через 675 км · 17:42", color: "var(--neon-green)" },
        ].map(c => (
          <div key={c.label} className="surface-card rounded-xl p-4 border" style={{ borderColor: "var(--surface-4)" }}>
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-mid)" }}>{c.label}</div>
            <div className="font-semibold" style={{ color: c.color }}>{c.value}</div>
            <div className="font-mono text-xs mt-2" style={{ color: "var(--text-dim)" }}>{c.sub}</div>
          </div>
        ))}
      </div>
      <div className="surface-card rounded-xl p-5 border flex-1" style={{ borderColor: "var(--surface-4)" }}>
        <div className="text-xs uppercase tracking-widest mb-6" style={{ color: "var(--text-mid)" }}>Схема маршрута</div>
        <div className="relative">
          <div className="absolute left-6 top-3 bottom-3 w-0.5" style={{ background: "var(--surface-4)" }} />
          <div className="space-y-6">
            {stations.map((st) => (
              <div key={st.name} className="flex items-center gap-4 relative">
                <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0 z-10"
                  style={{
                    background: st.current ? "var(--neon-cyan)" : st.passed ? "var(--surface-4)" : "var(--surface-2)",
                    borderColor: st.current ? "var(--neon-cyan)" : st.passed ? "var(--neon-green)" : "var(--surface-4)",
                    boxShadow: st.current ? "0 0 20px rgba(0,255,204,0.5)" : st.passed ? "0 0 8px rgba(57,255,20,0.3)" : "none"
                  }}>
                  <Icon name={st.type === "origin" ? "MapPin" : st.type === "destination" ? "Flag" : "Circle"} size={18}
                    style={{ color: st.current ? "var(--surface-1)" : st.passed ? "var(--neon-green)" : "var(--text-dim)" }} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm" style={{
                      color: st.current ? "var(--neon-cyan)" : st.passed ? "var(--text-mid)" : "var(--text-bright)"
                    }}>{st.name}</span>
                    <span className="font-mono text-sm" style={{ color: st.passed ? "var(--text-dim)" : "var(--text-bright)" }}>{st.eta}</span>
                  </div>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-xs" style={{ color: "var(--text-dim)" }}>{st.km} км</span>
                    {st.current && <span className="text-xs font-semibold neon-text-cyan">◀ Текущее положение</span>}
                    {st.passed && !st.current && <span className="text-xs" style={{ color: "var(--neon-green)" }}>✓ Пройдено</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SafetySection() {
  const [emergencyArmed, setEmergencyArmed] = useState(false);

  const systems = [
    { name: "Экстренное торможение (ЭПТ)", active: true, level: "critical" },
    { name: "Система предупреждения столкновений", active: true, level: "critical" },
    { name: "АРС — автоматическое регулирование скорости", active: true, level: "high" },
    { name: "Дистанционная блокировка дверей", active: true, level: "high" },
    { name: "Пожарная сигнализация", active: true, level: "high" },
    { name: "Видеонаблюдение (6 камер)", active: true, level: "medium" },
    { name: "Аварийное освещение", active: true, level: "medium" },
    { name: "Резервный источник питания", active: false, level: "medium" },
  ];

  const levelColor: Record<string, string> = {
    critical: "var(--neon-red)",
    high: "var(--neon-orange)",
    medium: "var(--neon-green)"
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto p-4">
      <div className="rounded-xl p-5 border neon-border-green surface-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusDot active={true} color="var(--neon-green)" />
              <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-mid)" }}>Общий статус безопасности</span>
            </div>
            <div className="text-2xl font-bold neon-text-green">ШТАТНЫЙ РЕЖИМ</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-mid)" }}>7 из 8 систем активны</div>
          </div>
          <Icon name="ShieldCheck" size={56} style={{ color: "var(--neon-green)", opacity: 0.2 }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 flex-1">
        <div className="surface-card rounded-xl border overflow-hidden" style={{ borderColor: "var(--surface-4)" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--surface-4)", background: "var(--surface-3)" }}>
            <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-mid)" }}>Системы защиты</span>
          </div>
          <div className="p-2">
            {systems.map(s => (
              <div key={s.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                <StatusDot active={s.active} color={levelColor[s.level]} />
                <span className="text-sm flex-1" style={{ color: s.active ? "var(--text-bright)" : "var(--text-dim)" }}>{s.name}</span>
                <span className="font-mono text-xs" style={{ color: s.active ? "var(--neon-green)" : "var(--text-dim)" }}>
                  {s.active ? "ВКЛ" : "ВЫКЛ"}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="surface-card rounded-xl p-5 border flex-1" style={{ borderColor: "var(--surface-4)" }}>
            <div className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-mid)" }}>Ограничения скорости</div>
            <div className="space-y-3">
              {[
                { zone: "Текущий участок", limit: 200, color: "var(--neon-cyan)" },
                { zone: "Следующие 5 км", limit: 180, color: "var(--neon-blue)" },
                { zone: "Кривая R=800 (4 км)", limit: 120, color: "var(--neon-yellow)" },
                { zone: "Станция НН (25 км)", limit: 60, color: "var(--neon-orange)" },
              ].map(r => (
                <div key={r.zone} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 font-mono font-bold text-sm"
                    style={{ borderColor: r.color, color: r.color }}>
                    {r.limit}
                  </div>
                  <span className="text-sm" style={{ color: "var(--text-mid)" }}>{r.zone}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="surface-card rounded-xl p-5 border" style={{ borderColor: emergencyArmed ? "var(--neon-red)" : "var(--surface-4)" }}>
            <div className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-mid)" }}>Экстренное торможение</div>
            <button
              onClick={() => setEmergencyArmed(!emergencyArmed)}
              className="w-full py-4 rounded-xl font-bold text-lg tracking-widest transition-all duration-300 border-2"
              style={{
                background: emergencyArmed ? "rgba(255,34,68,0.15)" : "var(--surface-3)",
                borderColor: emergencyArmed ? "var(--neon-red)" : "var(--surface-4)",
                color: emergencyArmed ? "var(--neon-red)" : "var(--text-mid)",
                boxShadow: emergencyArmed ? "0 0 20px rgba(255,34,68,0.3)" : "none"
              }}>
              {emergencyArmed ? "⚠ АВАРИЙНЫЙ СТОП АКТИВИРОВАН" : "АВАРИЙНЫЙ СТОП"}
            </button>
            <div className="text-xs mt-2 text-center" style={{ color: "var(--text-dim)" }}>
              {emergencyArmed ? "Нажмите повторно для деактивации" : "Нажмите для активации"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatisticsSection() {
  const bars = [
    { label: "Пн", value: 87 },
    { label: "Вт", value: 92 },
    { label: "Ср", value: 78 },
    { label: "Чт", value: 95 },
    { label: "Пт", value: 88 },
    { label: "Сб", value: 72 },
    { label: "Вс", value: 65 },
  ];

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto p-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Пробег за месяц", value: "18 420", unit: "км", color: "var(--neon-cyan)", icon: "Route" },
          { label: "Средняя скорость", value: "174", unit: "км/ч", color: "var(--neon-blue)", icon: "Gauge" },
          { label: "Рейсов выполнено", value: "24", unit: "рейса", color: "var(--neon-green)", icon: "CheckCircle" },
          { label: "Точность расписания", value: "98.2", unit: "%", color: "var(--neon-yellow)", icon: "Clock" },
        ].map(s => (
          <div key={s.label} className="surface-card rounded-xl p-4 border text-center" style={{ borderColor: "var(--surface-4)" }}>
            <div className="flex justify-center mb-2">
              <Icon name={s.icon} size={20} style={{ color: s.color }} />
            </div>
            <div className="font-mono text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-mid)" }}>{s.unit}</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 flex-1">
        <div className="surface-card rounded-xl p-5 border" style={{ borderColor: "var(--surface-4)" }}>
          <div className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-mid)" }}>Пунктуальность за неделю</div>
          <div className="flex items-end gap-3 h-40">
            {bars.map(b => (
              <div key={b.label} className="flex-1 flex flex-col items-center gap-2">
                <span className="font-mono text-xs" style={{ color: "var(--neon-cyan)" }}>{b.value}%</span>
                <div className="w-full rounded-t-md" style={{
                  height: `${b.value * 1.4}px`,
                  background: "linear-gradient(180deg, var(--neon-cyan), var(--neon-blue))",
                  boxShadow: "0 0 8px rgba(0,255,204,0.3)",
                }} />
                <span className="text-xs" style={{ color: "var(--text-dim)" }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="surface-card rounded-xl p-5 border" style={{ borderColor: "var(--surface-4)" }}>
          <div className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-mid)" }}>Распределение скоростей</div>
          <div className="space-y-3">
            {[
              { range: "0–80 км/ч", pct: 8 },
              { range: "80–150 км/ч", pct: 22 },
              { range: "150–200 км/ч", pct: 41 },
              { range: "200–250 км/ч", pct: 27 },
              { range: "250+ км/ч", pct: 2 },
            ].map(r => (
              <div key={r.range} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "var(--text-mid)" }}>{r.range}</span>
                  <span className="font-mono text-xs" style={{ color: "var(--text-bright)" }}>{r.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--surface-4)" }}>
                  <div className="h-full rounded-full" style={{
                    width: `${r.pct}%`,
                    background: "linear-gradient(90deg, var(--neon-blue), var(--neon-cyan))",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsSection() {
  const [autopilot, setAutopilot] = useState(true);
  const [maxSpeed, setMaxSpeed] = useState(200);
  const [accelLimit, setAccelLimit] = useState(1.2);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [nightMode, setNightMode] = useState(false);

  function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
    return (
      <button onClick={onChange} className="relative w-12 h-6 rounded-full transition-all duration-300 shrink-0"
        style={{ background: value ? "var(--neon-cyan)" : "var(--surface-4)", boxShadow: value ? "0 0 10px rgba(0,255,204,0.4)" : "none" }}>
        <div className="absolute top-1 w-4 h-4 rounded-full transition-all duration-300"
          style={{ left: value ? "calc(100% - 20px)" : "4px", background: value ? "var(--surface-1)" : "var(--text-dim)" }} />
      </button>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="surface-card rounded-xl p-5 border" style={{ borderColor: "var(--surface-4)" }}>
          <div className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-mid)" }}>Параметры автопилота</div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--surface-4)" }}>
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--text-bright)" }}>Режим автопилота</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>Автоматическое управление движением</div>
              </div>
              <Toggle value={autopilot} onChange={() => setAutopilot(!autopilot)} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "var(--text-bright)" }}>Максимальная скорость</span>
                <span className="font-mono text-sm neon-text-cyan">{maxSpeed} км/ч</span>
              </div>
              <input type="range" min={80} max={300} value={maxSpeed} onChange={e => setMaxSpeed(+e.target.value)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(90deg, var(--neon-cyan) ${((maxSpeed - 80) / 220) * 100}%, var(--surface-4) 0)` }} />
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: "var(--text-dim)" }}>80 км/ч</span>
                <span className="text-xs" style={{ color: "var(--text-dim)" }}>300 км/ч</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "var(--text-bright)" }}>Лимит ускорения</span>
                <span className="font-mono text-sm neon-text-blue">{accelLimit.toFixed(1)} м/с²</span>
              </div>
              <input type="range" min={0.3} max={3} step={0.1} value={accelLimit} onChange={e => setAccelLimit(+e.target.value)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(90deg, var(--neon-blue) ${((accelLimit - 0.3) / 2.7) * 100}%, var(--surface-4) 0)` }} />
            </div>
          </div>
        </div>
        <div className="surface-card rounded-xl p-5 border" style={{ borderColor: "var(--surface-4)" }}>
          <div className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-mid)" }}>Интерфейс и уведомления</div>
          <div className="space-y-4">
            {[
              { label: "Звуковые оповещения", sub: "Сигналы при критических событиях", value: soundAlerts, toggle: () => setSoundAlerts(!soundAlerts) },
              { label: "Ночной режим", sub: "Приглушённая подсветка ночью", value: nightMode, toggle: () => setNightMode(!nightMode) },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-3 border-b" style={{ borderColor: "var(--surface-4)" }}>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text-bright)" }}>{s.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>{s.sub}</div>
                </div>
                <Toggle value={s.value} onChange={s.toggle} />
              </div>
            ))}
            <div className="mt-4 p-3 rounded-xl" style={{ background: "var(--surface-3)" }}>
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-dim)" }}>Версия ПО системы</div>
              <div className="font-mono text-sm" style={{ color: "var(--neon-cyan)" }}>TrainOS v2.4.1</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>Обновлено: 15.04.2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [active, setActive] = useState<Section>("dashboard");
  const data = useSimulatedData();

  return (
    <div className="h-screen flex flex-col overflow-hidden grid-bg" style={{ background: "var(--surface-1)" }}>
      <header className="flex items-center justify-between px-6 py-3 border-b shrink-0"
        style={{ background: "var(--surface-2)", borderColor: "var(--surface-4)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,255,204,0.1)", border: "1px solid rgba(0,255,204,0.3)" }}>
            <Icon name="Train" size={18} style={{ color: "var(--neon-cyan)" }} />
          </div>
          <div>
            <div className="font-mono text-sm font-bold neon-text-cyan tracking-widest">TrainOS</div>
            <div className="text-xs" style={{ color: "var(--text-dim)" }}>Система автоматического управления</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {[
            { label: "АВТОПИЛОТ", active: true, color: "var(--neon-cyan)" },
            { label: "GPS", active: true, color: "var(--neon-green)" },
            { label: "СВЯЗЬ", active: true, color: "var(--neon-blue)" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <StatusDot active={s.active} color={s.color} />
              <span className="font-mono text-xs" style={{ color: "var(--text-mid)" }}>{s.label}</span>
            </div>
          ))}
          <div className="h-5 w-px" style={{ background: "var(--surface-4)" }} />
          <div className="font-mono text-sm neon-text-cyan">
            {Math.round(data.speed)} <span className="text-xs" style={{ color: "var(--text-dim)" }}>км/ч</span>
          </div>
          <div className="font-mono text-sm" style={{ color: "var(--text-mid)" }}>
            {data.time.toLocaleTimeString("ru-RU")}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="flex flex-col py-3 px-2 gap-1 border-r shrink-0" style={{ width: 72, background: "var(--surface-2)", borderColor: "var(--surface-4)" }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className="flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-all duration-200"
              style={{
                background: active === item.id ? "rgba(0,255,204,0.1)" : "transparent",
                border: active === item.id ? "1px solid rgba(0,255,204,0.25)" : "1px solid transparent",
              }}
              title={item.label}>
              <Icon name={item.icon} size={20}
                style={{ color: active === item.id ? "var(--neon-cyan)" : "var(--text-dim)", transition: "color 0.2s" }} />
              <span className="text-center leading-tight" style={{
                fontSize: 9,
                color: active === item.id ? "var(--neon-cyan)" : "var(--text-dim)",
                transition: "color 0.2s"
              }}>{item.label}</span>
            </button>
          ))}
        </nav>

        <main className="flex-1 overflow-hidden" key={active}>
          {active === "dashboard" && <DashboardSection data={data} />}
          {active === "monitoring" && <MonitoringSection data={data} />}
          {active === "diagnostics" && <DiagnosticsSection />}
          {active === "routes" && <RoutesSection />}
          {active === "safety" && <SafetySection />}
          {active === "statistics" && <StatisticsSection />}
          {active === "settings" && <SettingsSection />}
        </main>
      </div>

      <footer className="flex items-center gap-6 px-6 py-2 border-t shrink-0"
        style={{ background: "var(--surface-2)", borderColor: "var(--surface-4)" }}>
        <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>Поезд №43 · Москва–Казань</span>
        <span style={{ color: "var(--text-dim)" }}>|</span>
        <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>Локомотив ЭП20-032</span>
        <span style={{ color: "var(--text-dim)" }}>|</span>
        <span className="font-mono text-xs neon-text-green">Все системы в норме</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse-neon" style={{ background: "var(--neon-cyan)" }} />
          <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>ONLINE</span>
        </div>
      </footer>
    </div>
  );
}