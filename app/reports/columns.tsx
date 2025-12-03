'use client';

import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';

// This type is used to define the shape of our report rows.
// Adjust fields to match the columns shown in the UI.
export type Payment = {
    id: string;
    type: string;
    startTime: string; // ISO datetime string
    duration: string; // human readable, e.g. "00:45"
    electricityAmount: number; // in kWh
    station: string;
    charger: string;
    money: number; // in VND (numeric)
};

export const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: 'type',
        header: 'Loại xe',
    },
    {
        accessorKey: 'startTime',
        header: 'Thời gian bắt đầu',
    },
    {
        accessorKey: 'duration',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Thời lượng
                    <ArrowUpDown className="ml-2 w-4 h-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'electricityAmount',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Lượng điện (kWh)
                    <ArrowUpDown className="ml-2 w-4 h-4" />
                </Button>
            );
        },
        cell: ({ getValue }) => `${getValue() ?? 0} kWh`,
    },
    {
        accessorKey: 'station',
        header: 'Trạm',
    },
    {
        accessorKey: 'charger',
        header: 'Trụ',
    },
    {
        accessorKey: 'money',
        header: 'Số tiền (VND)',
        cell: ({ getValue }) => {
            const v = Number(getValue());
            if (!v && v !== 0) return '0 VND';
            return new Intl.NumberFormat('vi-VN').format(v) + ' VND';
        },
    },
];
