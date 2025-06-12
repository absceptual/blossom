"use client"

import { CardFooter } from "@/components/ui/card"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
const chartData = [
  { conference: "invitational", submissions: 275, fill: "#f4f4f4" },
  { conference: "district", submissions: 200, fill: "#e7a2c2" },
  { conference: "region", submissions: 187, fill: "#ea78ab" },
  { conference: "state", submissions: 173, fill: "#e45093" },
  { conference: "other", submissions: 90, fill: "#e42079" },
]

const chartConfig = {
  submissions: {
    label: "Submissions", // Changed from "Visitors"
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
    label: "Other",
    color: "#e42079",
  },
} satisfies ChartConfig

export default function Component() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Total Completed Problems</CardTitle>
        <CardDescription>All Time</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px] px-0">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
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
