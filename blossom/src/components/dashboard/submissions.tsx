"use client"

import { Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Realistic UIL completion data
// UIL has ~12 problems per level, with difficulty increasing significantly
// Invitational: Easier problems, more completions
// District: Moderate difficulty 
// Region: Hard problems, fewer completions
// State: Very hard problems, very few completions
const chartData = [
  { conference: "invitational", submissions: 47, fill: "#f4f4f4" }, // ~47/96 invitational problems (49%)
  { conference: "district", submissions: 23, fill: "#e7a2c2" },     // ~23/72 district problems (32%)
  { conference: "region", submissions: 8, fill: "#ea78ab" },        // ~8/60 region problems (13%)
  { conference: "state", submissions: 2, fill: "#e45093" },         // ~2/48 state problems (4%)
]

const chartConfig = {
  submissions: {
    label: "Problems Solved",
  },
  invitational: {
    label: "Invitational",
    color: "#f4f4f4",
  },
  district: {
    label: "District",
    color: "#e7a2c2",
  },
  region: {
    label: "Region",
    color: "#ea78ab",
  },
  state: {
    label: "State",
    color: "#e45093",
  },
  other: {
    label: "Practice/Other",
    color: "#e42079",
  },
} satisfies ChartConfig

export default function Component() {
  const totalSolved = chartData.reduce((sum, item) => sum + item.submissions, 0);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>UIL Problems Completed</CardTitle>
        <CardDescription>Total: {totalSolved} problems solved</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px] px-0">
          <PieChart>
            <ChartTooltip 
              content={<ChartTooltipContent />} 
            />
            <Pie
              data={chartData}
              dataKey="submissions"
              labelLine={true}
              label={({ payload, ...props }) => {
                return (
                  <text
                    cx={props.cx}
                    cy={props.cy}
                    x={props.x}
                    y={props.y}
                    textAnchor={props.textAnchor}
                    dominantBaseline={props.dominantBaseline}
                    fill="hsla(var(--foreground))"
                    fontSize="12"
                  >
                    {payload.submissions}
                  </text>
                )
              }}
              nameKey="conference"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}