"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

type Player = { id: string; name: string };

type Props = {
  players: Player[];
  turns: Record<string, Array<number | null | undefined>>;
  targetScore?: number; // default 10000
};

type ChartRow = {
  turn: string;
  _i: number;
  [playerId: string]: number | string;
};

function buildSeries(
  players: Player[],
  turns: Record<string, Array<number | null | undefined>>,
  targetScore: number
) {
  // max cantidad de turnos cargados entre todos
  const maxTurns = Math.max(0, ...players.map((p) => turns[p.id]?.length ?? 0));

  // data: [{ turn: "T1", [playerId]: acumulado, ... }, ...]
  const data: ChartRow[] = Array.from(
    { length: Math.max(1, maxTurns) },
    (_, i): ChartRow => {
      const row: ChartRow = { turn: `T${i + 1}`, _i: i };
      for (const p of players) {
        const arr = turns[p.id] ?? [];
        let sum = 0;
        for (let k = 0; k <= i; k++) sum += Number(arr[k] ?? 0);
        row[p.id] = sum;
        row[`${p.id}__rest`] = targetScore - sum; // opcional por si querés mostrar restante
      }
      return row;
    }
  );

  return data;
}

export default function DiezMilEvolutionChart({
  players,
  turns,
  targetScore = 10000,
}: Props) {
  const data = React.useMemo(
    () => buildSeries(players, turns, targetScore),
    [players, turns, targetScore]
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

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={40}
              domain={[0, targetScore]}
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
      </CardContent>
    </Card>
  );
}
