'use client';

import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { getAllStation } from '@/api/stationApi';
import { getAllChargers } from '@/api/chargerApi';
import { addData } from '@/api/addDataApi';

export default function AddDataPage() {
    const [stations, setStations] = useState<Array<{ value: string; label: string }>>([]);
    const [currentStationID, setCurrentStationID] = useState<string>('');
    const [listCharger, setListCharger] = useState<Array<any>>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [customerId, setCustomerId] = useState<string>('');
    const [carType, setCarType] = useState<string>('');
    const [selectedPostId, setSelectedPostId] = useState<string>('');

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
        if (!currentStationID) return showToast('Vui lòng chọn trạm', 'error');
        if (!selectedPostId) return showToast('Vui lòng chọn trụ', 'error');
        if (!carType) return showToast('Vui lòng chọn loại xe', 'error');
        if (!durationMinutes) return showToast('Vui lòng nhập thời gian sạc', 'error');
        if (!electricalConsumption) return showToast('Vui lòng nhập lượng điện', 'error');

        // check duration and electricalConsumption are positive numbers
        if (Number(durationMinutes) <= 0) return showToast('Thời gian sạc phải là số dương', 'error');
        if (Number(electricalConsumption) <= 0) return showToast('Lượng điện phải là số dương', 'error');

        // enforce maximum limits
        if (Number(durationMinutes) > 180) return showToast('Thời gian sạc tối đa là 180 phút', 'error');
        if (Number(electricalConsumption) > 200) return showToast('Lượng điện tối đa là 200 kwh', 'error');

        // Use current system date/time for startTime
        const startTime = new Date().toISOString();

        const payload = {
            customerId: 'anonymous',
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
                        <FieldLabel>Loại xe</FieldLabel>
                        <Select value={carType} onValueChange={(v) => setCarType(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn loại xe" />
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
                        <div className="items-center gap-3 grid w-full max-w-sm">
                            <Label htmlFor="duration">Thời gian sạc (phút)</Label>
                            <Input
                                type="number"
                                id="duration"
                                placeholder="Phút"
                                required={true}
                                value={durationMinutes}
                                min={1}
                                max={180}
                                step={1}
                                onChange={(e) => {
                                    const v = e.target.value ? Number(e.target.value) : '';
                                    setDurationMinutes(v);
                                }}
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
                            min={0.01}
                            max={200}
                            step={0.1}
                            onChange={(e) => {
                                const v = e.target.value ? Number(e.target.value) : '';
                                setElectricalConsumption(v);
                            }}
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
