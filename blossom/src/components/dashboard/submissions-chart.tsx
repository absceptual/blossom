"use client"

import { Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { getAcceptedSubmissionsByLevel } from "@/actions/problems"

const chartConfig = {
  submissions: {
    label: "Problems Solved",
  },
  "invitational-a": {
    label: "Invitational A",
    color: "#f4f4f4",
  },
  "invitational-b": {
    label: "Invitational B",
    color: "#e7a2c2",
  },
  district: {
    label: "District",
    color: "#ea78ab",
  },
  region: {
    label: "Region",
    color: "#e45093",
  },
  state: {
    label: "State",
    color: "#e42079",
  },
  other: {
    label: "Practice/Other",
    color: "#e42079",
  },
} satisfies ChartConfig

export default function Component({ username }: { username: string }) {
  const [chartData, setChartData] = useState<Array<{ conference: string; submissions: number; fill: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAcceptedSubmissionsByLevel(username);
      if (data) {
        setChartData(data);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [username]);

  const totalSolved = chartData.reduce((sum, item) => sum + item.submissions, 0);

  if (isLoading) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader className="items-center pb-0">
          <CardTitle>UIL Problems Completed</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center">
          <div className="animate-pulse w-48 h-48 rounded-full bg-muted/20" />
        </CardContent>
      </Card>
    );
  }

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