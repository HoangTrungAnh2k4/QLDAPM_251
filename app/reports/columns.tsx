'use client';

import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

// This type is used to define the shape of our report rows.
// Adjust fields to match the columns shown in the UI.
export type Payment = {
    id: string;
    phoneNumber: string;
    type: string;
    startTime: string; // ISO datetime string
    duration: string; // human readable, e.g. "00:45"
    electricityAmount: number; // in kWh
    station: string;
    charger: string;
    money: string; // in VND
};

export const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: 'phoneNumber',
        header: 'Số điện thoại',
    },
    {
        accessorKey: 'type',
        header: 'Loại xe',
    },
    {
        accessorKey: 'startTime',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Thời gian bắt đầu
                    <ArrowUpDown className="ml-2 w-4 h-4" />
                </Button>
            );
        },
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
    },
];
