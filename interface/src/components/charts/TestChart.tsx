"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, Legend, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
// const chartData = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
// ]


const makeChartData = (numPoints: number, numLines: number) => {
  const data = Array.from({ length: numPoints }, (_, i) => {
    // Create base exponential values for each line
    const baseValues = Array.from({ length: numLines }, (_, j) => {
      // Different growth rate for each line
      const growthRate = 0.1 + (j * 0.05); 
      // Exponential growth with random noise
      const baseValue = Math.exp(i * growthRate) / Math.exp(numPoints * growthRate);
      const noise = (Math.random() - 0.5) * 0.25; // Random noise between -0.05 and 0.05
      return [`prob-${j}`, Math.max(0, Math.min(1, baseValue + noise))]; // Clamp between 0 and 1
    });

    return {
      layer: i,
      ...Object.fromEntries(baseValues)
    };
  });
  return data;
};

const numLines = 2;

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface TestChartProps {
  title: string;
  description: string;
}

export function TestChart({title, description}: TestChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={makeChartData(24, numLines)}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <Legend />
            <YAxis 
              label={{ value: 'Probability', angle: -90, position: 'insideLeft' }}
              tickLine={false}
              axisLine={false}
            />
            <XAxis
              dataKey="layer"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              // tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {Array.from({ length: numLines }, (_, i) => (
              <Line
                key={`line-${i}`}
                dataKey={`prob-${i}`}
                type="linear"
                stroke={`var(--color-${i === 0 ? 'desktop' : 'mobile'})`}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing total visitors for the last 6 months
            </div>
          </div>
        </div>
      </CardFooter> */}
    </Card>
  )
}
