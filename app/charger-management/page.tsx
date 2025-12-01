'use client';

import { useEffect, useState } from 'react';
import { BsLightningChargeFill } from 'react-icons/bs';
import { FiEdit } from 'react-icons/fi';
import { MdDelete } from 'react-icons/md';
import { FaCar } from 'react-icons/fa';
import { addCharger, deleteCharger, getAllChargers, updateCharger } from '@/api/chargerApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getAllStation } from '@/api/stationApi';
import Image from 'next/image';
import { Label } from '@/components/ui/label';

interface formDataProps {
    name?: string;
    power?: string;
    stationId?: string;
    supportBrands?: string[];
}

export default function ManageCharger() {
    const [deleteIsOpen, setDeleteIsOpen] = useState<boolean>(false);
    const [addIsOpen, setAddIsOpen] = useState<boolean>(false);
    const [formData, setFormData] = useState<formDataProps>({});
    const [stations, setStations] = useState<{ value: string; label: string }[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [brands, setBrands] = useState<Record<string, boolean>>({
        Vinfast: false,
        BYD: false,
        MG: false,
        Wuling: false,
        Hyundai: false,
    });
    const [currentStationID, setCurrentStationID] = useState<string>('');
    const [selectedCharger, setSelectedCharger] = useState<any>(null);
    const [listCharger, setListCharger] = useState<any[]>([]);
    const [editIsOpen, setEditIsOpen] = useState<boolean>(false);

    const handleSelectChange = (value: string) => {
        setCurrentStationID(value);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available':
                return (
                    <span className="bg-green-500 px-2 py-1 rounded-sm font-semibold text-[#eaeaea] text-xs">
                        Hoạt động
                    </span>
                );
            case 'maintenance':
                return <span className="bg-red px-2 py-1 rounded font-semibold text-[#69120B] text-xs">Bảo trì</span>;
            case 'error':
                return <span className="bg-red-500 px-2 py-1 rounded text-white text-xs">Lỗi</span>;
            default:
                return null;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddCharger = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const supportBrands = Object.entries(brands)
            .filter(([, checked]) => checked)
            .map(([brand]) => brand);

        const chargerData = {
            stationId: currentStationID,
            name: formData.name,
            power: formData.power,
            supportBrands,
            state: 'available',
        };

        try {
            setIsLoading(true);
            setAddIsOpen(false);
            const res = await addCharger(chargerData);

            if (res.status === 200) {
                fetchChargers();
            }
        } catch (error) {
            console.error('Error adding charger:', error);
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            handleDeleteCloseModal();
            const res = await deleteCharger(selectedCharger._id);
            if (res.status === 200) {
                fetchChargers();
            }
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    };

    const handleOpenDeleteModal = () => {
        setDeleteIsOpen(true);
    };

    const handleDeleteCloseModal = () => {
        setDeleteIsOpen(false);
    };

    const handleOpenEditModal = (charger: any) => {
        setSelectedCharger(charger);
        // Prefill form data
        setFormData({
            name: charger?.name,
            power: charger?.power,
            stationId: charger?.stationId,
        });
        // set current station so the select reflects it
        if (charger?.stationId) setCurrentStationID(charger.stationId);

        // build brands map from charger.supportBrands
        const support = Array.isArray(charger?.supportBrands) ? charger.supportBrands : [];
        setBrands((prev) => {
            const next: Record<string, boolean> = { ...prev };
            Object.keys(next).forEach((k) => {
                next[k] = support.includes(k);
            });
            return next;
        });

        setEditIsOpen(true);
    };

    const handleEditCloseModal = () => {
        setEditIsOpen(false);
    };

    const handleUpdateCharger = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedCharger) return;

        const supportBrands = Object.entries(brands)
            .filter(([, checked]) => checked)
            .map(([brand]) => brand);

        const chargerData = {
            stationId: currentStationID || formData.stationId,
            name: formData.name,
            power: formData.power,
            supportBrands,
            state: selectedCharger.state || 'available',
        };

        try {
            setIsLoading(true);
            setEditIsOpen(false);
            const res = await updateCharger(selectedCharger._id, chargerData);
            if (res.status === 200) {
                fetchChargers();
            }
        } catch (error) {
            console.error('Error updating charger:', error);
            setIsLoading(false);
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

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="bg-primary rounded-lg w-fit font-semibold text-white cursor-pointer">
                    <Select onValueChange={handleSelectChange} value={currentStationID}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={stations.length ? undefined : 'Chọn trạm sạc'} />
                        </SelectTrigger>
                        <SelectContent>
                            {stations
                                .filter((s) => s.value)
                                .map((station) => (
                                    <SelectItem key={station.value} value={String(station.value)}>
                                        {station.label}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
                <button
                    className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-white cursor-pointer"
                    onClick={() => {
                        setAddIsOpen(true);
                    }}
                >
                    Thêm trụ sạc
                </button>
            </div>

            {/* Station Grid */}
            <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6 mb-6">
                {listCharger?.map((charger: any, index) => (
                    <div
                        key={index}
                        className="bg-white shadow-[0_0_6px_1px_rgba(0,0,0,0.25)] rounded-xl overflow-hidden"
                    >
                        {/* Station Image */}
                        <div className="relative p-2">
                            <Image
                                src="/charger.jpg"
                                alt="Station"
                                width={400}
                                height={200}
                                className="rounded-lg w-full h-32 object-cover"
                            />

                            <div className="top-3 left-4 absolute">{getStatusBadge(charger.state)}</div>
                        </div>

                        {/* Station Info */}
                        <div className="p-3 pt-0">
                            <h3 className="mb-2 font-semibold text-gray-800">{charger.name}</h3>

                            <div className="space-y-1 mb-2 text-gray-600 text-sm">
                                <div className="flex items-center">
                                    <BsLightningChargeFill className="mr-2" />
                                    Công suất: {charger.power} (kW)
                                </div>
                            </div>

                            <div className="space-y-1 text-gray-600 text-sm">
                                <div className="flex items-center">
                                    <FaCar className="mr-2 shrink-0" />
                                    Hãng xe được hỗ trợ: {charger.supportBrands.join(', ')}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end items-center gap-2 mt-4">
                                {/* Edit */}
                                <button
                                    className="bg-[#00BCD4] hover:bg-[#00BCD4]/80 p-2 rounded-full cursor-pointer"
                                    onClick={() => handleOpenEditModal(charger)}
                                >
                                    <FiEdit className="text-[#ffffff]" />
                                </button>
                                {/* Delete */}
                                <button
                                    className="bg-red-100 hover:bg-red-200 p-2 rounded-full cursor-pointer"
                                    onClick={() => {
                                        handleOpenDeleteModal();
                                        setSelectedCharger(charger);
                                    }}
                                >
                                    <MdDelete className="text-red-500 text-lg" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {listCharger.length === 0 && !isLoading && (
                    <div className="col-span-4 text-gray-600 text-xl text-center">
                        Chưa có trụ sạc nào được thêm vào.
                    </div>
                )}
            </div>

            {/* loading */}
            {isLoading && (
                <div className="z-50 flex justify-center items-center bg-background/50 w-full">
                    <div className="border-4 border-primary border-t-transparent rounded-full w-16 h-16 animate-spin" />
                </div>
            )}

            {/* popup add station */}
            <div
                className={`fixed inset-0 z-50  flex justify-center items-center bg-black/40 bg-opacity-50 ${
                    addIsOpen ? 'block' : 'hidden'
                }`}
            >
                <div className="bg-white dark:bg-gray-900 mx-4 p-4 lg:p-11 rounded-3xl w-full max-w-[500px] overflow-y-auto no-scrollbar">
                    <div className="bg-[#FFFFFF] border-[#999] sm:max-w-[425px]">
                        <div className="mb-4 font-semibold text-xl text-center">Thêm trụ sạc</div>
                        <form onSubmit={handleAddCharger} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Tên trụ</Label>
                                <Input type="text" id="name" name="name" required={true} onChange={handleInputChange} />
                            </div>

                            <div className="space-y-2">
                                <Label>Công suất (kW)</Label>
                                <Input
                                    type="text"
                                    id="power"
                                    name="power"
                                    required={true}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <Label>Hãng xe hỗ trợ</Label>
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="vinfast"
                                        checked={brands.Vinfast}
                                        onCheckedChange={(v) => setBrands((prev) => ({ ...prev, Vinfast: !!v }))}
                                    />
                                    <Label htmlFor="vinfast">Vinfast</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="byd"
                                        checked={brands.BYD}
                                        onCheckedChange={(v) => setBrands((prev) => ({ ...prev, BYD: !!v }))}
                                    />
                                    <Label htmlFor="byd">BYD</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="mg"
                                        checked={brands.MG}
                                        onCheckedChange={(v) => setBrands((prev) => ({ ...prev, MG: !!v }))}
                                    />
                                    <Label htmlFor="mg">MG</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="wuling"
                                        checked={brands.Wuling}
                                        onCheckedChange={(v) => setBrands((prev) => ({ ...prev, Wuling: !!v }))}
                                    />
                                    <Label htmlFor="wuling">Wuling</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="hyundai"
                                        checked={brands.Hyundai}
                                        onCheckedChange={(v) => setBrands((prev) => ({ ...prev, Hyundai: !!v }))}
                                    />
                                    <Label htmlFor="hyundai">Hyundai</Label>
                                </div>
                            </div>

                            <div className="flex lg:justify-end items-center gap-3 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setAddIsOpen(false);
                                    }}
                                >
                                    Hủy
                                </Button>
                                <Button>Thêm</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* popup edit charger */}
            <div
                className={`fixed inset-0 z-50  flex justify-center items-center bg-black/40 bg-opacity-50 ${
                    editIsOpen ? 'block' : 'hidden'
                }`}
            >
                <div className="bg-white dark:bg-gray-900 mx-4 p-4 lg:p-11 rounded-3xl w-full max-w-[500px] overflow-y-auto no-scrollbar">
                    <div className="bg-[#FFFFFF] border-[#999] sm:max-w-[425px]">
                        <div className="mb-4 font-semibold text-xl text-center">Chỉnh sửa trụ sạc</div>
                        <form onSubmit={handleUpdateCharger} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Tên trụ</Label>
                                <Input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required={true}
                                    value={formData.name || ''}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Công suất (kW)</Label>
                                <Input
                                    type="text"
                                    id="power"
                                    name="power"
                                    required={true}
                                    value={formData.power || ''}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <Label>Hãng xe hỗ trợ</Label>
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="edit-vinfast"
                                        checked={brands.Vinfast}
                                        onCheckedChange={(v) => setBrands((prev) => ({ ...prev, Vinfast: !!v }))}
                                    />
                                    <Label htmlFor="edit-vinfast">Vinfast</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="edit-byd"
                                        checked={brands.BYD}
                                        onCheckedChange={(v) => setBrands((prev) => ({ ...prev, BYD: !!v }))}
                                    />
                                    <Label htmlFor="edit-byd">BYD</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="edit-mg"
                                        checked={brands.MG}
                                        onCheckedChange={(v) => setBrands((prev) => ({ ...prev, MG: !!v }))}
                                    />
                                    <Label htmlFor="edit-mg">MG</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="edit-wuling"
                                        checked={brands.Wuling}
                                        onCheckedChange={(v) => setBrands((prev) => ({ ...prev, Wuling: !!v }))}
                                    />
                                    <Label htmlFor="edit-wuling">Wuling</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="edit-hyundai"
                                        checked={brands.Hyundai}
                                        onCheckedChange={(v) => setBrands((prev) => ({ ...prev, Hyundai: !!v }))}
                                    />
                                    <Label htmlFor="edit-hyundai">Hyundai</Label>
                                </div>
                            </div>

                            <div className="flex lg:justify-end items-center gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={() => setEditIsOpen(false)}>
                                    Hủy
                                </Button>
                                <Button type="submit">Lưu</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Confirm Delete Modal */}
            <div
                className={`fixed inset-0 z-50 flex justify-center items-center bg-black/40 bg-opacity-50 ${
                    deleteIsOpen ? 'block' : 'hidden'
                }`}
            >
                <div className="bg-white dark:bg-gray-900 mx-4 p-4 lg:p-11 rounded-3xl w-full max-w-[500px] overflow-y-auto no-scrollbar">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 font-semibold text-gray-800 dark:text-white/90 text-2xl">
                            Xác nhận xóa trụ sạc
                        </h4>
                        <p className="mb-6 lg:mb-7 text-gray-500 dark:text-gray-400 text-sm">
                            Bạn có chắc chắn muốn xóa trụ sạc này không?
                            <br />
                            Hành động này không thể hoàn tác.
                        </p>
                    </div>

                    <div className="flex lg:justify-end items-center gap-3 mt-6 px-2">
                        <Button variant="outline" onClick={() => setDeleteIsOpen(false)}>
                            Hủy
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Xóa
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
