import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import type { ChartConfig } from "./ui/chart";
import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis } from "recharts";
import { AxisSelector } from "./axis-selector";
import { Button } from "./ui/button";

type SingleOptionData = {
  bsmPrice: number;
  daysToExpiry: number;
  logMoneyness: number;
  markIV: number;
  moneyness: number;
  markPrice: number;
  riskFreeRate: number;
  spotPrice: number;
  strikePrice: number;
  symbol: string;
  timeToExpiry: number;
};

type SVIPoint = {
  impliedVolatility: number;
  logMoneyness: number;
  moneyness: number;
  strikePrice: number;
};

type VolChartProps = {
  callData?: SingleOptionData[];
  putData?: SingleOptionData[];
  xAxis?: "logMoneyness" | "strikePrice" | "moneyness";
  sviPoints?: SVIPoint[];
};

const chartConfig = {
  Calls: {
    label: "Calls",
    color: "hsl(var(--chart-1))",
  },
  Puts: {
    label: "Puts",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

const CustomTooltipContent = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: SingleOptionData }[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const dollarFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });
    return (
      <CardContent className="p-2">
        <div className="text-sm font-medium">{data.symbol}</div>
        <div>Strike Price: {dollarFormatter.format(data.strikePrice)}</div>
        <div>IV: {(data.markIV * 100).toFixed(2)}%</div>
        <div>Log Moneyness: {data.logMoneyness.toFixed(2)}</div>
        <div>Moneyness: {data.moneyness.toFixed(2)}</div>
      </CardContent>
    );
  }
  return null;
};

export function VolChart({
  callData,
  putData,
  xAxis = "logMoneyness",
  sviPoints,
}: VolChartProps) {
  const [selectedAxis, setSelectedAxis] = useState<string>(xAxis);
  const formatXAxisTick = (value: number) => {
    if (xAxis === "logMoneyness") {
      return value.toFixed(2).toString();
    }
    if (xAxis === "strikePrice") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      })
        .format(value)
        .toString();
    }
    if (xAxis === "moneyness") {
      return value.toFixed(2).toString();
    }
    return value.toString();
  };

  const formatYAxisTick = (value: number) => {
    return value.toFixed(2).toString();
  };

  const handleAxisChange = (value: string) => {
    console.log("Selected axis:", value);
    setSelectedAxis(value);
  };
  return (
    <Card className="my-2 mr-2 h-[calc(100vh-16px)]">
      <CardHeader className="flex flex-row items-center relative">
        <div>
          <AxisSelector onValueChange={handleAxisChange} value={selectedAxis} />
        </div>
        <CardTitle className="absolute left-1/2 transform -translate-x-1/2">
          Implied Volatility Curve
        </CardTitle>
      </CardHeader>
      <ChartContainer config={chartConfig} className="h-full">
        <ScatterChart margin={{ top: 20, right: 40, bottom: 20 }}>
          <CartesianGrid />
          <XAxis
            dataKey={selectedAxis}
            type="number"
            domain={["dataMin", "dataMax"]}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatXAxisTick}
            tickCount={10}
          />
          <YAxis
            dataKey={"markIV"}
            type="number"
            domain={["dataMin", "dataMax"]}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxisTick}
            tickCount={5}
          />
          {callData && (
            <Scatter
              name="Calls"
              data={callData}
              fill="var(--chart-1)"
              shape="circle"
            />
          )}
          {putData && (
            <Scatter
              name="Puts"
              data={putData}
              fill="var(--chart-5)"
              shape="circle"
            />
          )}
          <ChartTooltip content={<CustomTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
        </ScatterChart>
      </ChartContainer>
    </Card>
  );
}
