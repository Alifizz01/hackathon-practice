import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

// ╔══════════════════════════════════════════════════════════════╗
// ║  🔧 CHANGE THIS SECTION TO MATCH YOUR HACKATHON TOPIC 🔧   ║
// ╠══════════════════════════════════════════════════════════════╣
// ║  Just edit CONFIG below — the entire dashboard updates!     ║
// ╚══════════════════════════════════════════════════════════════╝

const CONFIG = {
  // --- BASIC INFO ---
  title: "GRIDWATCH",
  subtitle: "Stromnetz-Lagezentrum",
  unit: "Hz",
  normalValue: 50.0,
  warningThreshold: 0.05,   // yellow if deviation > this
  dangerThreshold: 0.1,     // red if deviation > this

  // --- REGIONS (change names/coords for any country/topic) ---
  regions: [
    { id: "north",     name: "Nord",          x: 52, y: 18, value: 50.01 },
    { id: "east",      name: "Ost",           x: 72, y: 38, value: 49.94 },
    { id: "west",      name: "West",          x: 25, y: 45, value: 50.02 },
    { id: "south",     name: "Süd",           x: 50, y: 72, value: 49.89 },
    { id: "central",   name: "Mitte",         x: 48, y: 42, value: 50.00 },
  ],

  // --- ALERTS (sample — replace with real data) ---
  alerts: [
    { id: 1, severity: "critical", region: "Süd",  message: "Frequency below threshold", time: "14:32" },
    { id: 2, severity: "warning",  region: "Ost",  message: "Unusual deviation detected", time: "14:28" },
    { id: 3, severity: "info",     region: "Nord", message: "Wind farm output normalized", time: "14:15" },
    { id: 4, severity: "warning",  region: "West", message: "Solar output dropping (cloud cover)", time: "13:58" },
  ],
};

// ═══════════════════════════════════════════════════
//  HELPER FUNCTIONS (no need to change these)
// ═══════════════════════════════════════════════════

function getStatus(value) {
  const dev = Math.abs(value - CONFIG.normalValue);
  if (dev >= CONFIG.dangerThreshold) return "critical";
  if (dev >= CONFIG.warningThreshold) return "warning";
  return "normal";
}

const STATUS_COLORS = {
  normal: "#00e676",
  warning: "#ffab00",
  critical: "#ff1744",
  info: "#40c4ff",
};

const STATUS_GLOW = {
  normal: "0 0 18px rgba(0,230,118,0.5)",
  warning: "0 0 18px rgba(255,171,0,0.5)",
  critical: "0 0 18px rgba(255,23,68,0.6)",
};

function generateHistory(hours = 6) {
  const data = [];
  const now = new Date();
  for (let i = hours * 60; i >= 0; i -= 5) {
    const t = new Date(now - i * 60000);
    const base = CONFIG.normalValue;
    const noise = (Math.sin(i * 0.05) * 0.04) + (Math.random() - 0.5) * 0.06;
    const spike = (i > 100 && i < 115) ? -0.12 : 0;
    data.push({
      time: `${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`,
      value: +(base + noise + spike).toFixed(3),
      min: +(base - 0.05 + (Math.random() - 0.5) * 0.02).toFixed(3),
      max: +(base + 0.05 + (Math.random() - 0.5) * 0.02).toFixed(3),
    });
  }
  return data;
}

// ═══════════════════════════════════════════════════
//  COMPONENTS
// ═══════════════════════════════════════════════════

function StatusDot({ status }) {
  return (
    <span style={{
      display: "inline-block", width: 10, height: 10, borderRadius: "50%",
      background: STATUS_COLORS[status] || STATUS_COLORS.info,
      boxShadow: STATUS_GLOW[status] || "none",
      marginRight: 8,
    }} />
  );
}

function TopBar({ currentValue }) {
  const status = getStatus(currentValue);
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 24px",
      background: "linear-gradient(90deg, #0a0e17, #111827)",
      borderBottom: `1px solid ${STATUS_COLORS[status]}33`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: `${STATUS_COLORS[status]}18`,
          border: `1.5px solid ${STATUS_COLORS[status]}55`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>⚡</div>
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 18, fontWeight: 700, color: "#e2e8f0", letterSpacing: 3,
          }}>{CONFIG.title}</div>
          <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1 }}>{CONFIG.subtitle}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>Current</div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700,
            color: STATUS_COLORS[status],
            textShadow: `0 0 20px ${STATUS_COLORS[status]}44`,
          }}>
            {currentValue.toFixed(3)} {CONFIG.unit}
          </div>
        </div>
        <div style={{
          padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: 1,
          background: `${STATUS_COLORS[status]}18`,
          color: STATUS_COLORS[status],
          border: `1px solid ${STATUS_COLORS[status]}44`,
        }}>
          {status === "normal" ? "● Stable" : status === "warning" ? "▲ Warning" : "◆ Critical"}
        </div>
      </div>
    </div>
  );
}

function RegionMap({ regions, selectedRegion, onSelect }) {
  return (
    <div style={{
      background: "#0d1117", borderRadius: 12, padding: 16,
      border: "1px solid #1e293b", position: "relative", height: "100%", minHeight: 320,
    }}>
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
        Regional Status Map
      </div>
      {/* Simple SVG map outline — replace with real map SVG for your country */}
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: "calc(100% - 30px)" }}>
        {/* Basic country shape — swap this path for any country */}
        <path d="M35,5 L55,3 L70,10 L78,25 L80,45 L72,60 L65,75 L55,85 L45,90 L35,82 L28,70 L20,55 L18,40 L22,25 L30,12 Z"
          fill="#1a2332" stroke="#2d3f56" strokeWidth="0.8" />
        {regions.map(r => {
          const status = getStatus(r.value);
          const isSelected = selectedRegion === r.id;
          return (
            <g key={r.id} onClick={() => onSelect(r.id)} style={{ cursor: "pointer" }}>
              <circle cx={r.x} cy={r.y} r={isSelected ? 7 : 5}
                fill={`${STATUS_COLORS[status]}33`}
                stroke={STATUS_COLORS[status]}
                strokeWidth={isSelected ? 2 : 1} />
              <circle cx={r.x} cy={r.y} r={2.5}
                fill={STATUS_COLORS[status]}>
                <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
              </circle>
              <text x={r.x} y={r.y - 10} textAnchor="middle"
                fill="#94a3b8" fontSize="4.5" fontFamily="monospace">
                {r.name}
              </text>
              <text x={r.x} y={r.y + 14} textAnchor="middle"
                fill={STATUS_COLORS[status]} fontSize="4" fontFamily="monospace" fontWeight="bold">
                {r.value.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function FrequencyChart({ data }) {
  return (
    <div style={{
      background: "#0d1117", borderRadius: 12, padding: 16,
      border: "1px solid #1e293b",
    }}>
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
        Frequency Timeline ({CONFIG.unit})
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="freqGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00e676" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#00e676" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10, fill: "#64748b" }}
            interval={Math.floor(data.length / 8)} />
          <YAxis domain={[CONFIG.normalValue - 0.15, CONFIG.normalValue + 0.15]}
            stroke="#475569" tick={{ fontSize: 10, fill: "#64748b" }}
            tickFormatter={v => v.toFixed(2)} />
          <Tooltip
            contentStyle={{ background: "#1a2332", border: "1px solid #2d3f56", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#94a3b8" }}
            formatter={(v) => [`${v} ${CONFIG.unit}`, "Frequency"]} />
          <Area type="monotone" dataKey="value" stroke="#00e676" strokeWidth={2}
            fill="url(#freqGrad)" dot={false} />
          {/* Normal line */}
          <Line type="monotone" dataKey={() => CONFIG.normalValue} stroke="#475569"
            strokeDasharray="5 5" dot={false} strokeWidth={1} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function AlertsFeed({ alerts }) {
  const sevOrder = { critical: 0, warning: 1, info: 2 };
  const sorted = [...alerts].sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);
  return (
    <div style={{
      background: "#0d1117", borderRadius: 12, padding: 16,
      border: "1px solid #1e293b", height: "100%",
    }}>
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
        Active Alerts ({alerts.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map(a => (
          <div key={a.id} style={{
            padding: "10px 12px", borderRadius: 8,
            background: `${STATUS_COLORS[a.severity]}08`,
            borderLeft: `3px solid ${STATUS_COLORS[a.severity]}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <StatusDot status={a.severity} />
                <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{a.region}</span>
              </div>
              <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 3, paddingLeft: 18 }}>
                {a.message}
              </div>
            </div>
            <div style={{
              fontFamily: "monospace", fontSize: 11, color: "#64748b",
              whiteSpace: "nowrap", marginLeft: 12,
            }}>{a.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RegionDetail({ region }) {
  if (!region) return (
    <div style={{
      background: "#0d1117", borderRadius: 12, padding: 16,
      border: "1px solid #1e293b", height: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#475569", fontSize: 13,
    }}>
      Click a region on the map
    </div>
  );
  const status = getStatus(region.value);
  const deviation = (region.value - CONFIG.normalValue).toFixed(3);
  const sign = deviation >= 0 ? "+" : "";
  return (
    <div style={{
      background: "#0d1117", borderRadius: 12, padding: 16,
      border: "1px solid #1e293b",
    }}>
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
        Region Detail
      </div>
      <div style={{
        fontSize: 20, fontWeight: 700, color: "#e2e8f0",
        fontFamily: "monospace", marginBottom: 8,
      }}>{region.name}</div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 100 }}>
          <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Current</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: STATUS_COLORS[status], fontFamily: "monospace" }}>
            {region.value.toFixed(3)}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 100 }}>
          <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Deviation</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: STATUS_COLORS[status], fontFamily: "monospace" }}>
            {sign}{deviation}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 100 }}>
          <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Status</div>
          <div style={{
            marginTop: 4, padding: "4px 10px", borderRadius: 6, display: "inline-block",
            fontSize: 12, fontWeight: 600, textTransform: "uppercase",
            background: `${STATUS_COLORS[status]}18`, color: STATUS_COLORS[status],
            border: `1px solid ${STATUS_COLORS[status]}44`,
          }}>
            {status}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeSlider({ value, onChange }) {
  return (
    <div style={{
      background: "#0d1117", borderRadius: 12, padding: "12px 16px",
      border: "1px solid #1e293b",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, whiteSpace: "nowrap" }}>
        Timeline
      </span>
      <input type="range" min={0} max={100} value={value} onChange={e => onChange(+e.target.value)}
        style={{
          flex: 1, accentColor: "#00e676", height: 4,
          background: "#1e293b", borderRadius: 2,
        }} />
      <span style={{ fontFamily: "monospace", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>
        {value === 100 ? "LIVE" : `-${((100 - value) * 3.6).toFixed(0)} min`}
      </span>
    </div>
  );
}

function StatsRow({ data }) {
  const latest = data[data.length - 1]?.value || CONFIG.normalValue;
  const min = Math.min(...data.map(d => d.value));
  const max = Math.max(...data.map(d => d.value));
  const avg = (data.reduce((s, d) => s + d.value, 0) / data.length);
  const stats = [
    { label: "Min", value: min.toFixed(3), color: "#ff1744" },
    { label: "Avg", value: avg.toFixed(3), color: "#40c4ff" },
    { label: "Max", value: max.toFixed(3), color: "#00e676" },
    { label: "Samples", value: data.length, color: "#b388ff" },
  ];
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {stats.map(s => (
        <div key={s.label} style={{
          flex: 1, minWidth: 80, background: "#0d1117", borderRadius: 10,
          padding: "10px 14px", border: "1px solid #1e293b",
        }}>
          <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "monospace", marginTop: 2 }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  MAIN DASHBOARD
// ═══════════════════════════════════════════════════

export default function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [timeSlider, setTimeSlider] = useState(100);
  const [tick, setTick] = useState(0);

  // Simulate live updates every 3 seconds
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  // Generate fake data (replace with real API fetch)
  const historyData = useMemo(() => generateHistory(6), [tick]);

  // Simulate small live fluctuations in region values
  const liveRegions = useMemo(() =>
    CONFIG.regions.map(r => ({
      ...r,
      value: +(r.value + (Math.random() - 0.5) * 0.02).toFixed(3),
    })), [tick]);

  const overallValue = liveRegions.reduce((s, r) => s + r.value, 0) / liveRegions.length;
  const selected = liveRegions.find(r => r.id === selectedRegion);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #060a10 0%, #0a0e17 100%)",
      color: "#e2e8f0",
      fontFamily: "'Segoe UI', 'SF Pro', system-ui, sans-serif",
    }}>
      <TopBar currentValue={overallValue} />

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Stats Row */}
        <StatsRow data={historyData} />

        {/* Main Content: Map + Alerts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, minHeight: 340 }}>
          <RegionMap regions={liveRegions} selectedRegion={selectedRegion} onSelect={setSelectedRegion} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <RegionDetail region={selected} />
            <div style={{ flex: 1 }}>
              <AlertsFeed alerts={CONFIG.alerts} />
            </div>
          </div>
        </div>

        {/* Timeline Slider */}
        <TimeSlider value={timeSlider} onChange={setTimeSlider} />

        {/* Chart */}
        <FrequencyChart data={historyData} />

        {/* Footer */}
        <div style={{
          textAlign: "center", padding: "12px 0", fontSize: 11, color: "#334155",
          borderTop: "1px solid #1e293b", marginTop: 4,
        }}>
          🔧 HACKATHON TEMPLATE — Edit CONFIG at top of code to change topic, regions, thresholds
        </div>
      </div>
    </div>
  );
}
