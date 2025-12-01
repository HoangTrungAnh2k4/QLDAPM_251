import type { Payment } from './columns';

export const mockPayments: Payment[] = Array.from({ length: 50 }, (_, index) => ({
    id: (index + 1).toString(),
    phoneNumber: `090512345${index % 10}`,
    type: index % 2 === 0 ? 'Xe máy điện' : 'Ô tô điện',
    startTime: new Date(2025, 4, (index % 28) + 1, 8 + (index % 10), 0, 0).toISOString(),
    duration: (30 + (index % 120)).toString(), // duration between 30 mins to 150 mins
    electricityAmount: 5 + (index % 45), // amount between 5 kWh to 50 kWh
    station: `Trạm Sạc ${(index % 5) + 1}`,
    charger: `Trụ ${(index % 3) + 1}`,
    money: ((5 + (index % 45)) * 2000).toString(), // assuming 2000 VND per kWh
}));

export async function getMockPayments(): Promise<Payment[]> {
    // Simulate async fetch (could add delay if desired)
    return mockPayments;
}
