'use client';

import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { he } from 'date-fns/locale';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';

export const description = 'A bar chart';

const chartData = [
    { month: 'January', data: 186 },
    { month: 'February', data: 305 },
    { month: 'March', data: 237 },
    { month: 'April', data: 73 },
    { month: 'May', data: 209 },
    { month: 'June', data: 214 },
];

const chartConfig = {
    data: {
        label: 'data',
        color: 'var(--primary)',
    },
} satisfies ChartConfig;

export function ChartBarDefault() {
    return (
        <div>
            <div className="flex justify-end">
                <NativeSelect className="shadow">
                    <NativeSelectOption value="">Select status</NativeSelectOption>
                    <NativeSelectOption value="todo">Todo</NativeSelectOption>
                    <NativeSelectOption value="in-progress">In Progress</NativeSelectOption>
                    <NativeSelectOption value="done">Done</NativeSelectOption>
                    <NativeSelectOption value="cancelled">Cancelled</NativeSelectOption>
                </NativeSelect>
            </div>
            <ChartContainer config={chartConfig} className="mt-4 w-full h-80">
                <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value: any) => value.slice(0, 3)}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="data" fill="var(--color-data)" radius={8} />
                </BarChart>
            </ChartContainer>
        </div>
    );
}
