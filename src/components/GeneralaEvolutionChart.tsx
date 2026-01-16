"use client";

import * as React from "react";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  CATEGORY_DEFS,
  CategoryKey,
  GeneralaHistoryEvent,
  ScoreCell,
} from "@/hooks/use-generala-store";

type Player = { id: string; name: string };

type ChartRow = {
  step: number;
  label: string;
  [playerId: string]: number | string;
};

function scoreValue(v: ScoreCell | undefined) {
  return typeof v === "number" ? v : 0;
}

function buildSeriesByHistory(
  players: Player[],
  history: GeneralaHistoryEvent[] | undefined
): ChartRow[] {
  const safeHistory = history ?? []; // ✅ acá está la corrección

  const scores: Record<string, Partial<Record<CategoryKey, ScoreCell>>> = {};

  const rows: ChartRow[] = [
    {
      step: 0,
      label: "0",
      ...Object.fromEntries(players.map((p) => [p.id, 0])),
    },
  ];

  safeHistory.forEach((ev, idx) => {
    scores[ev.playerId] = scores[ev.playerId] ?? {};
    scores[ev.playerId]![ev.category] = ev.value;

    const row: ChartRow = { step: idx + 1, label: String(idx + 1) };

    for (const p of players) {
      const s = scores[p.id] ?? {};
      let total = 0;
      for (const { key } of CATEGORY_DEFS) total += scoreValue(s[key]);
      row[p.id] = total;
    }

    rows.push(row);
  });

  if (rows.length === 1) {
    rows.push({
      step: 1,
      label: "1",
      ...Object.fromEntries(players.map((p) => [p.id, 0])),
    });
  }

  return rows;
}

export default function GeneralaEvolutionChart({
  players,
  history,
}: {
  players: Player[];
  history?: GeneralaHistoryEvent[]; // ✅ opcional
}) {
  const data = React.useMemo(
    () => buildSeriesByHistory(players, history),
    [players, history]
  );

  const chartConfig = React.useMemo(() => {
    const cfg: Record<string, { label: string; color: string }> = {};
    players.slice(0, 6).forEach((p, idx) => {
      cfg[p.id] = { label: p.name, color: `hsl(var(--chart-${idx + 1}))` };
    });
    return cfg;
  }, [players]);

  if (!players.length) return null;

  return (
    <Card className="border-white/10 bg-slate-800 text-slate-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-extrabold">
          Evolución (por orden real de carga)
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeOpacity={0.15} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={40}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />

            {players.slice(0, 6).map((p) => (
              <Line
                key={p.id}
                dataKey={p.id}
                type="monotone"
                stroke={`var(--color-${p.id})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ChartContainer>

        <div className="mt-2 text-[11px] text-slate-300">
          X = cada casillero cargado (step) · Y = total acumulado.
        </div>
      </CardContent>
    </Card>
  );
}
