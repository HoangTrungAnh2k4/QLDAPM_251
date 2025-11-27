'use client';

import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDownIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useEffect, useState } from 'react';
import { getAllStation } from '@/api/stationApi';
import { getAllChargers } from '@/api/chargerApi';
import { addData } from '@/api/addDataApi';

export default function AddDataPage() {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [stations, setStations] = useState<Array<{ value: string; label: string }>>([]);
    const [currentStationID, setCurrentStationID] = useState<string>('');
    const [listCharger, setListCharger] = useState<Array<any>>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [customerId, setCustomerId] = useState<string>('');
    const [carType, setCarType] = useState<string>('');
    const [selectedPostId, setSelectedPostId] = useState<string>('');
    const [timeString, setTimeString] = useState<string>('00:00:00');
    const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
    const [electricalConsumption, setElectricalConsumption] = useState<number | ''>('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const resetForm = () => {
        setCustomerId('');
        setCarType('');
        setDate(undefined);
        setTimeString('00:00:00');
        setDurationMinutes('');
        setElectricalConsumption('');
        // reset selected post to first available if any
        if (listCharger && listCharger.length > 0) {
            const first = listCharger[0];
            const id = first._id ?? first.id ?? first.postId ?? first.value ?? '';
            setSelectedPostId(String(id));
        } else {
            setSelectedPostId('');
        }
    };

    const handleAddData = async () => {
        // Basic validation (show toast instead of alert)
        if (!customerId) return showToast('Vui lòng nhập customerId', 'error');
        if (!currentStationID) return showToast('Vui lòng chọn trạm', 'error');
        if (!selectedPostId) return showToast('Vui lòng chọn trụ', 'error');
        if (!carType) return showToast('Vui lòng chọn loại xe', 'error');
        if (!date) return showToast('Vui lòng chọn ngày', 'error');
        if (!timeString) return showToast('Vui lòng chọn giờ', 'error');
        if (!durationMinutes) return showToast('Vui lòng nhập thời gian sạc', 'error');
        if (!electricalConsumption) return showToast('Vui lòng nhập lượng điện', 'error');

        // Build ISO startTime from selected date and time
        const [hh = '00', mm = '00', ss = '00'] = timeString.split(':');
        const dt = new Date(date as Date);
        dt.setHours(parseInt(hh, 10));
        dt.setMinutes(parseInt(mm, 10));
        dt.setSeconds(parseInt(ss, 10));
        const startTime = dt.toISOString();

        const payload = {
            customerId,
            stationId: currentStationID,
            postId: selectedPostId,
            carType,
            startTime,
            chargeTime: Number(durationMinutes),
            electricalConsumption: Number(electricalConsumption),
        };

        try {
            const res = await addData(payload);
            if (res.status === 201 || res.status === 200) {
                console.log('Data added successfully:', res.data);
                showToast('Thêm dữ liệu thành công', 'success');
                resetForm();
            } else {
                console.warn('Unexpected response', res.status, res.data);
                showToast('Thêm dữ liệu không thành công', 'error');
            }
        } catch (error) {
            console.log(error);
            showToast('Lỗi khi thêm dữ liệu', 'error');
        }
    };

    useEffect(() => {
        const fetchStations = async () => {
            const response = await getAllStation();
            const formatData = response.data.data.items.map((station: any) => ({
                value: station._id,
                label: station.name,
            }));
            setStations(formatData);
            if (formatData.length > 0) {
                setCurrentStationID(formatData[0].value);
            }
        };
        fetchStations();
    }, []);

    const fetchChargers = async () => {
        const response = await getAllChargers(currentStationID);
        setListCharger(response.data.data.posts);
        setIsLoading(false);
    };

    useEffect(() => {
        if (currentStationID) {
            fetchChargers();
        }
    }, [currentStationID]);

    // sync selectedPostId when chargers load
    useEffect(() => {
        if (listCharger && listCharger.length > 0) {
            const first = listCharger[0];
            // try common id fields
            const id = first._id ?? first.id ?? first.value ?? first.postId ?? '';
            if (id) setSelectedPostId(String(id));
        }
    }, [listCharger]);

    return (
        <div className="shadow-xl mt-6 ml-20 p-6 rounded-xl w-full max-w-xl">
            <FieldSet>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="customer_id">Customer_ID</FieldLabel>
                        <Input
                            id="customer_id"
                            type="text"
                            placeholder="Max Leiter"
                            required={true}
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                        />
                    </Field>
                    <Field>
                        <FieldLabel>Loại xe</FieldLabel>
                        <Select value={carType} onValueChange={(v) => setCarType(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose brand" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="VinFast">Vinfast</SelectItem>
                                <SelectItem value="BYD">BYD</SelectItem>
                                <SelectItem value="MG">MG</SelectItem>
                                <SelectItem value="Wuling">Wuling</SelectItem>
                                <SelectItem value="Hyundai">Hyundai</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>

                    <div className="flex gap-4">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="date-picker" className="px-1">
                                Ngày bắt đầu
                            </Label>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        id="date-picker"
                                        className="justify-between w-32 font-normal cursor-pointer"
                                    >
                                        {date ? date.toLocaleDateString() : 'Select date'}
                                        <ChevronDownIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-auto overflow-hidden" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        captionLayout="dropdown"
                                        onSelect={(date) => {
                                            setDate(date);
                                            setOpen(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="time-picker" className="px-1">
                                Giờ bắt đầu
                            </Label>
                            <Input
                                type="time"
                                id="time-picker"
                                // step="1"
                                value={timeString}
                                required={true}
                                onChange={(e) => setTimeString(e.target.value)}
                                className="[&::-webkit-calendar-picker-indicator]:hidden bg-background appearance-none [&::-webkit-calendar-picker-indicator]:appearance-none"
                            />
                        </div>
                        <div className="items-center gap-3 grid w-full max-w-sm">
                            <Label htmlFor="duration">Thời gian sạc (phút)</Label>
                            <Input
                                type="number"
                                id="duration"
                                placeholder="Phút"
                                required={true}
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(e.target.value ? Number(e.target.value) : '')}
                            />
                        </div>
                    </div>
                    <div className="items-center gap-3 grid w-full">
                        <Label htmlFor="duration">Lượng điện (kwh)</Label>
                        <Input
                            type="number"
                            id="electric"
                            placeholder="kwh"
                            required={true}
                            value={electricalConsumption}
                            onChange={(e) => setElectricalConsumption(e.target.value ? Number(e.target.value) : '')}
                        />
                    </div>
                    <Field>
                        <FieldLabel>Trạm</FieldLabel>
                        <Select value={currentStationID} onValueChange={(v) => setCurrentStationID(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn trạm" />
                            </SelectTrigger>
                            <SelectContent>
                                {stations.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field>
                        <FieldLabel>Trụ</FieldLabel>
                        <Select value={selectedPostId} onValueChange={(v) => setSelectedPostId(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn trụ" />
                            </SelectTrigger>
                            <SelectContent>
                                {listCharger.map((c: any) => {
                                    const id = c._id ?? c.id ?? c.postId ?? c.value;
                                    return (
                                        <SelectItem key={String(id)} value={String(id)}>
                                            {c.name ?? c.title ?? c.label ?? String(id)}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </Field>
                </FieldGroup>
            </FieldSet>

            {toast && (
                <div
                    className={`fixed top-6 right-6 z-50 rounded-md px-4 py-2 shadow-md text-white ${
                        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}
                    role="status"
                >
                    {toast.message}
                </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
                <Button onClick={handleAddData}>Thêm</Button>
            </div>
        </div>
    );
}
