import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ChartContainer } from "./ui/chart";
import type { ChartConfig } from "./ui/chart";
import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis } from "recharts";

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
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function VolChart({
  callData,
  putData,
  xAxis = "logMoneyness",
  sviPoints,
}: VolChartProps) {
  const [horizontalPoints, setHorizontalPoints] = useState<number[]>([]);
  const [flattenedData, setFlattenedData] = useState<SingleOptionData[]>([]);

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

  useEffect(() => {
    if (callData || putData) {
      const data = [...(callData || []), ...(putData || [])];
      setFlattenedData(data);
    }
  }, [callData, putData]);

  useEffect(() => {
    if (xAxis === "logMoneyness") {
      const points = flattenedData.map((d) => d.logMoneyness);
      setHorizontalPoints(points);
    } else if (xAxis === "strikePrice") {
      const points = flattenedData.map((d) => d.strikePrice);
      setHorizontalPoints(points);
    } else if (xAxis === "moneyness") {
      const points = flattenedData.map((d) => d.moneyness);
      setHorizontalPoints(points);
    }
  }, [xAxis, flattenedData]);

  return (
    <Card className="my-2 mr-2 h-[calc(100vh-16px)]">
      <CardHeader>
        <CardTitle>Implied Volatility Curve</CardTitle>
      </CardHeader>
      <ChartContainer config={chartConfig} className="h-full">
        <ScatterChart margin={{ left: 20, right: 20 }}>
          <CartesianGrid />
          <XAxis
            dataKey={xAxis}
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
        </ScatterChart>
      </ChartContainer>
    </Card>
  );
}
