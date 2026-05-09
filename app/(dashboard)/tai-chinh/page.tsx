"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/ToastProvider";
import { formatVND, formatVNDShort, formatDateVN } from "@/lib/utils";
import { useFinanceState, useFinanceStore } from "@/hooks/useFinanceStore";
import { PhieuThuFormModal } from "./phieu-thu/components/PhieuThuFormModal";
import { PhieuChiFormModal } from "./phieu-chi/components/PhieuChiFormModal";

type Period = "month" | "quarter" | "year";

export default function FinanceHomePage() {
  const state = useFinanceState();
  const store = useFinanceStore();
  const toast = useToast();
  const [period, setPeriod] = useState<Period>("month");
  const [showThuForm, setShowThuForm] = useState(false);
  const [showChiForm, setShowChiForm] = useState(false);

  const { from } = useMemo(() => {
    const now = new Date();
    const from = new Date(now);
    if (period === "month") from.setDate(now.getDate() - 30);
    else if (period === "quarter") from.setMonth(now.getMonth() - 3);
    else from.setFullYear(now.getFullYear() - 1);
    return { from, to: now };
  }, [period]);

  const filteredPT = state.phieuThu.filter((p) => new Date(p.ngayYeuCau) >= from);
  const filteredPC = state.phieuChi.filter((p) => new Date(p.ngayYeuCau) >= from);

  const totalThu = filteredPT.reduce((s, p) => s + p.soTien, 0);
  const totalChi = filteredPC.reduce((s, p) => s + p.soTien, 0);
  const tonQuy = state.quy.reduce((s, q) => s + q.soDu, 0);
  const phaiThu = state.congNo.reduce((s, kh) => s + kh.phaiThu, 0);
  const phaiTra = state.congNo.reduce((s, kh) => s + kh.phaiTra, 0);

  const onReset = () => {
    if (!confirm("Reset toàn bộ dữ liệu mock về trạng thái ban đầu?")) return;
    store.reset();
    toast.success("Đã reset dữ liệu mock");
  };

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Tổng thu" value={totalThu} color="green" />
        <KpiCard label="Tổng chi" value={totalChi} color="orange" />
        <KpiCard label="Tồn quỹ" value={tonQuy} color="primary" />
        <KpiCard label="Phải thu" value={phaiThu} color="blue" />
        <KpiCard label="Phải trả" value={phaiTra} color="gray" />
      </div>

      {/* Cash flow chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h3 className="font-semibold">Dòng tiền thu chi</h3>
          <div className="ml-auto flex items-center gap-2">
            <Button onClick={() => setShowThuForm(true)}>
              Tạo phiếu Thu
            </Button>
            <Button onClick={() => setShowChiForm(true)}>
              Tạo phiếu Chi
            </Button>
            <div className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
                options={[
                  { value: "month", label: "Tháng này" },
                  { value: "quarter", label: "Quý này" },
                  { value: "year", label: "Năm này" },
                ]}
              />
            </div>
          </div>
        </div>
        <CashFlowChart phieuThu={filteredPT} phieuChi={filteredPC} from={from} tonQuy={tonQuy} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cán cân thu chi */}
        {/* Cán cân thu chi */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold mb-3">Cán cân thu chi</h3>
          <Donut thu={totalThu} chi={totalChi} />
        </div>

        {/* Cơ cấu doanh thu */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold mb-3">Cơ cấu doanh thu theo sản phẩm</h3>
          <div className="text-center text-gray-400 py-8 text-sm">
            Chưa có dữ liệu sản phẩm
          </div>
        </div>

        {/* Hoạt động gần nhất */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold mb-3">Hoạt động gần nhất</h3>
          <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
            {state.hoatDong.slice(0, 8).map((h) => (
              <li key={h.id} className="flex items-start gap-2 border-l-2 border-primary-300 pl-2">
                <div className="flex-1">
                  <div className="text-gray-900">{h.noiDung}</div>
                  <div className="text-xs text-gray-500">
                    {h.nguoi} · {formatDateVN(h.thoiGian)}
                  </div>
                </div>
              </li>
            ))}
            {state.hoatDong.length === 0 && (
              <li className="text-gray-400">Chưa có hoạt động</li>
            )}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tồn quỹ */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Tồn quỹ</h3>
            <Link href="/tai-chinh/quy" className="text-sm text-primary-600 hover:underline">
              Xem tất cả
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {state.quy.slice(0, 5).map((q) => (
              <li key={q.id} className="flex justify-between py-2 text-sm">
                <span>{q.ten}</span>
                <span className="font-semibold text-orange-600">{formatVND(q.soDu)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Công nợ */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Công nợ</h3>
            <Link href="/tai-chinh/cong-no" className="text-sm text-primary-600 hover:underline">
              Xem tất cả
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500">
              <tr>
                <th className="text-left py-1">Tên công ty</th>
                <th className="text-right py-1">Phải thu</th>
                <th className="text-right py-1">Phải trả</th>
              </tr>
            </thead>
            <tbody>
              {state.congNo.slice(0, 6).map((kh) => (
                <tr key={kh.id} className="border-t border-gray-100">
                  <td className="py-2">{kh.ten}</td>
                  <td className="py-2 text-right text-orange-600">
                    {formatVND(kh.phaiThu)}
                  </td>
                  <td className="py-2 text-right">{formatVND(kh.phaiTra)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button variant="outline" size="sm" onClick={onReset}>
          Reset dữ liệu mock
        </Button>
      </div>

      <PhieuThuFormModal
        isOpen={showThuForm}
        onClose={() => setShowThuForm(false)}
        editing={null}
      />
      <PhieuChiFormModal
        isOpen={showChiForm}
        onClose={() => setShowChiForm(false)}
        editing={null}
      />
    </div>
  );
}

function KpiCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "green" | "orange" | "primary" | "blue" | "gray";
}) {
  const colors: Record<string, string> = {
    green: "border-green-200 bg-green-50 text-green-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    primary: "border-primary-200 bg-primary-50 text-primary-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    gray: "border-gray-200 bg-gray-50 text-gray-700",
  };
  return (
    <div className={`border rounded-lg p-4 ${colors[color]}`}>
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className="text-2xl font-bold mt-1">{formatVNDShort(value)}</div>
      <div className="text-xs mt-1 opacity-70">{formatVND(value)}</div>
    </div>
  );
}

function Donut({ thu, chi }: { thu: number; chi: number }) {
  const total = thu + chi;
  if (total === 0) {
    return <div className="text-center text-gray-400 py-8 text-sm">Chưa có dữ liệu</div>;
  }
  const thuPct = (thu / total) * 100;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const thuLen = (thuPct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#fb923c"
          strokeWidth="20"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth="20"
          strokeDasharray={`${thuLen} ${circumference}`}
          transform="rotate(-90 80 80)"
        />
      </svg>
      <div className="flex gap-4 text-sm mt-2">
        <span>
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1" />
          Thu: {formatVND(thu)}
        </span>
        <span>
          <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-1" />
          Chi: {formatVND(chi)}
        </span>
      </div>
    </div>
  );
}

function formatTr(v: number): string {
  if (v === 0) return "0";
  const tr = v / 1_000_000;
  return `${tr % 1 === 0 ? tr.toFixed(0) : tr.toFixed(2)} Tr`;
}

function CashFlowChart({
  phieuThu,
  phieuChi,
  from,
  tonQuy,
}: {
  phieuThu: { ngayYeuCau: string; soTien: number }[];
  phieuChi: { ngayYeuCau: string; soTien: number }[];
  from: Date;
  tonQuy: number;
}) {
  const days = Math.max(
    7,
    Math.ceil((Date.now() - from.getTime()) / (1000 * 60 * 60 * 24)),
  );

  const data = Array.from({ length: days }, (_, i) => {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const thu = phieuThu
      .filter((p) => p.ngayYeuCau.startsWith(key))
      .reduce((s, p) => s + p.soTien, 0);
    const chi = phieuChi
      .filter((p) => p.ngayYeuCau.startsWith(key))
      .reduce((s, p) => s + p.soTien, 0);
    return { label: `${dd}/${mm}`, thu, chi };
  });

  let running = tonQuy;
  const balances: number[] = [];
  for (const d of data) {
    running = running + d.thu - d.chi;
    balances.push(running);
  }

  const barMax = Math.max(...data.map((d) => Math.max(d.thu, d.chi)), 1);
  const lineMin = Math.min(...balances, 0);
  const lineMax = Math.max(...balances, 1);

  const mLeft = 80;
  const mRight = 16;
  const mTop = 16;
  const mBottom = 44;
  const chartW = 900;
  const chartH = 340;
  const plotW = chartW - mLeft - mRight;
  const plotH = chartH - mTop - mBottom;

  const tickCount = 10;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const v = lineMin + ((lineMax - lineMin) * (tickCount - i)) / tickCount;
    return { v, y: mTop + (plotH * i) / tickCount };
  });

  const colW = plotW / data.length;

  const linePoints = balances.map((b, i) => {
    const x = mLeft + colW * i + colW / 2;
    const y =
      lineMax === lineMin
        ? mTop + plotH / 2
        : mTop + ((lineMax - b) / (lineMax - lineMin)) * plotH;
    return { x, y };
  });
  const polyline = linePoints.map((p) => `${p.x},${p.y}`).join(" ");

  type Tooltip = { i: number; x: number; y: number } | null;
  const [tooltip, setTooltip] = useState<Tooltip>(null);
  const hide = useCallback(() => setTooltip(null), []);

  const TOOLTIP_W = 160;
  const TOOLTIP_H = 72;

  return (
    <div>
      <svg
        viewBox={`0 0 ${chartW} ${chartH}`}
        className="w-full"
        style={{ minHeight: 280 }}
        onMouseLeave={hide}
      >
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={mLeft}
              y1={t.y}
              x2={chartW - mRight}
              y2={t.y}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <text
              x={mLeft - 8}
              y={t.y + 4}
              textAnchor="end"
              fontSize={10}
              fill="#6b7280"
            >
              {formatTr(t.v)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const x = mLeft + colW * i;
          const thuH = (d.thu / barMax) * plotH * 0.4;
          const chiH = (d.chi / barMax) * plotH * 0.4;
          const barW = Math.max(colW * 0.25, 4);
          const gap = 2;
          return (
            <g key={i}>
              <rect
                x={x + colW / 2 - barW - gap / 2}
                y={mTop + plotH - thuH}
                width={barW}
                height={thuH}
                fill="#f59e0b"
                rx={1}
              />
              <rect
                x={x + colW / 2 + gap / 2}
                y={mTop + plotH - chiH}
                width={barW}
                height={chiH}
                fill="#f87171"
                rx={1}
              />
              {/* invisible hit area for the whole column */}
              <rect
                x={x}
                y={mTop}
                width={colW}
                height={plotH}
                fill="transparent"
                style={{ cursor: "crosshair" }}
                onMouseEnter={() =>
                  setTooltip({
                    i,
                    x: x + colW / 2,
                    y: linePoints[i].y,
                  })
                }
              />
            </g>
          );
        })}

        <polyline
          points={polyline}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
        />
        {linePoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#3b82f6" />
        ))}

        {data.map((d, i) => {
          const x = mLeft + colW * i + colW / 2;
          const show =
            data.length <= 15 ||
            i === 0 ||
            i === data.length - 1 ||
            i % Math.ceil(data.length / 15) === 0;
          if (!show) return null;
          return (
            <text
              key={i}
              x={x}
              y={chartH - 8}
              textAnchor="middle"
              fontSize={10}
              fill="#6b7280"
            >
              {d.label}
            </text>
          );
        })}

        {/* Tooltip */}
        {tooltip !== null && (() => {
          const d = data[tooltip.i];
          const bal = balances[tooltip.i];
          let tx = tooltip.x - TOOLTIP_W / 2;
          if (tx < mLeft) tx = mLeft;
          if (tx + TOOLTIP_W > chartW - mRight) tx = chartW - mRight - TOOLTIP_W;
          let ty = tooltip.y - TOOLTIP_H - 10;
          if (ty < 4) ty = tooltip.y + 14;
          return (
            <g style={{ pointerEvents: "none" }}>
              <rect
                x={tx}
                y={ty}
                width={TOOLTIP_W}
                height={TOOLTIP_H}
                rx={6}
                fill="white"
                stroke="#e5e7eb"
                strokeWidth={1}
                filter="drop-shadow(0 2px 6px rgba(0,0,0,.12))"
              />
              <text x={tx + 10} y={ty + 16} fontSize={11} fontWeight="600" fill="#111827">
                {d.label}
              </text>
              <circle cx={tx + 10} cy={ty + 30} r={4} fill="#f59e0b" />
              <text x={tx + 18} y={ty + 34} fontSize={10} fill="#374151">
                Thu: {formatTr(d.thu)}
              </text>
              <circle cx={tx + 10} cy={ty + 46} r={4} fill="#f87171" />
              <text x={tx + 18} y={ty + 50} fontSize={10} fill="#374151">
                Chi: {formatTr(d.chi)}
              </text>
              <circle cx={tx + 10} cy={ty + 62} r={4} fill="#3b82f6" />
              <text x={tx + 18} y={ty + 66} fontSize={10} fill="#374151">
                Dòng tiền: {formatTr(bal)}
              </text>
            </g>
          );
        })()}
      </svg>

      <div className="flex items-center justify-center gap-6 text-xs text-gray-600 mt-2">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 bg-blue-500 rounded-sm" />
          Dòng tiền
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 bg-amber-500 rounded-sm" />
          Thu
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 bg-red-400 rounded-sm" />
          Chi
        </span>
      </div>
    </div>
  );
}
