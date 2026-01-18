"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

type Player = { id: string; name: string };

type TurnsMap = Record<string, Array<number | null | undefined>>;

type Props = {
  players: Player[];
  turns: TurnsMap;
  targetScore?: number; // default 100
  maxScore?: number; // default 140
};

type ChartRow = {
  turn: string;
  _i: number;
  [playerId: string]: number | string;
};

function buildSeries(players: Player[], turns: TurnsMap) {
  const maxTurns = Math.max(0, ...players.map((p) => turns[p.id]?.length ?? 0));

  const data: ChartRow[] = Array.from(
    { length: Math.max(1, maxTurns) },
    (_, i): ChartRow => {
      const row: ChartRow = { turn: `T${i + 1}`, _i: i };

      for (const p of players) {
        const arr = turns[p.id] ?? [];
        let sum = 0;

        for (let k = 0; k <= i; k++) sum += Number(arr[k] ?? 0);

        row[p.id] = sum;
      }

      return row;
    }
  );

  return data;
}

export default function ChinchonEvolutionChart({
  players,
  turns,
  targetScore = 100,
  maxScore = 140,
}: Props) {
  const data = React.useMemo(
    () => buildSeries(players, turns),
    [players, turns]
  );

  // Config shadcn: asocia cada línea a un color chart-1..chart-6
  const chartConfig = React.useMemo(() => {
    const cfg: Record<string, { label: string; color: string }> = {};
    players.slice(0, 6).forEach((p, idx) => {
      cfg[p.id] = {
        label: p.name,
        color: `hsl(var(--chart-${idx + 1}))`,
      };
    });
    return cfg;
  }, [players]);

  if (!players.length) return null;

  return (
    <Card className="border-white/10 bg-slate-800 text-slate-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-extrabold">
          Evolución por turno
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
              dataKey="turn"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={12}
            />

            {/* ✅ escala fija */}
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={40}
              domain={[0, maxScore]}
              ticks={[0, 20, 40, 60, 80, 100, 120, 140]}
            />

            {/* ✅ que se note el 100 */}
            <ReferenceLine
              y={targetScore}
              stroke="rgba(34, 197, 94, 0.9)" // verde
              strokeWidth={2}
              strokeDasharray="6 6"
              ifOverflow="extendDomain"
              label={{
                value: `${targetScore}`,
                position: "right",
                fill: "rgba(34, 197, 94, 0.95)",
                fontSize: 10,
                fontWeight: 800,
              }}
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
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
