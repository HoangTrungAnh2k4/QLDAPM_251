'use client';

import { Province, Ward } from '@/api/provinceApi';
import { addStation, deleteStation, getAllStation } from '@/api/stationApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useRef, useState } from 'react';
import { BsLightningChargeFill } from 'react-icons/bs';
import { FaMapMarkedAlt } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { FiEdit } from 'react-icons/fi';
import { IoIosImages } from 'react-icons/io';
import { MdDelete } from 'react-icons/md';
import { PiPlugChargingFill } from 'react-icons/pi';

interface listStationProps {
    id: string;
    name: string;
    address: {
        detail: string;
        district: string;
        city: string;
    };
    slots: number;
    power: string;
    state: string;
    image?: string;
}

interface formDataProps {
    detail?: string;
    city?: string;
    image?: File | null;
    district?: string;
}

const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
];

export default function StationManagementPage() {
    const [stations, setStations] = useState<listStationProps[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [formData, setFormData] = useState<formDataProps>({});
    const [isLoading, setIsLoading] = useState(true);
    const [deleteIsOpen, setDeleteIsOpen] = useState(false);
    const [addIsOpen, setAddIsOpen] = useState(false);
    const [listCity, setListCity] = useState<Province[]>([]);
    const [listWard, setListWard] = useState<Ward[]>([]);
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [stationToDelete, setStationToDelete] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpenAddModal = () => {
        setAddIsOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available':
                return (
                    <span className="bg-blue-1 px-2 py-1 rounded font-semibold text-[#044A53] text-xs">Hoạt động</span>
                );
            case 'maintenance':
                return <span className="bg-red px-2 py-1 rounded font-semibold text-[#69120B] text-xs">Bảo trì</span>;
            case 'error':
                return <span className="bg-red-500 px-2 py-1 rounded text-white text-xs">Lỗi</span>;
            default:
                return null;
        }
    };

    const handleDetailAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file hình ảnh');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước file không được vượt quá 5MB');
                return;
            }

            setFormData((prev) => ({
                ...prev,
                image: file,
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setPreviewImage(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setPreviewImage(null);
        setFormData((prev) => ({
            ...prev,
            image: null,
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('detail', formData.detail || '');
        formDataToSend.append('city', formData.city || '');
        formDataToSend.append('district', formData.district || '');
        if (formData.image) {
            formDataToSend.append('image', formData.image);
        }

        setIsLoading(true);
        setAddIsOpen(false);
        try {
            const response = await addStation(formDataToSend);
            if (response.status === 200 || response.status === 201) {
                await fetchStations();
                // Clear form only on success
                setFormData({});
                setPreviewImage(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setSelectedCity('');
                setListWard([]);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const closeDeleteModal = () => {
        setDeleteIsOpen(false);
    };

    const handleDelete = async () => {
        setIsLoading(true);
        setDeleteIsOpen(false);
        try {
            const response = await deleteStation(stationToDelete);
            if (response.status === 200) {
                fetchStations();
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch('https://provinces.open-api.vn/api/v2/p/');
                const data = await response.json();
                setListCity(data);
                console.log(data);
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        };
        fetchCities();
    }, []);

    useEffect(() => {
        const fetchWards = async () => {
            try {
                const response = await fetch(`https://provinces.open-api.vn/api/v2/p/${selectedCity}?depth=2`);
                const data = await response.json();
                setListWard(data.wards);
                console.log(data);
            } catch (error) {
                console.error('Error fetching wards:', error);
            }
        };

        if (selectedCity) {
            fetchWards();
        }
    }, [selectedCity]);

    const fetchStations = async () => {
        try {
            const response = await getAllStation();
            setStations(response.data.data.items);
            setIsLoading(false);
        } catch (error: any) {
            if (error.status === 401) {
                console.log('Unauthorized. Please log in again.');
                window.location.href = '/login';
            }
        }
    };

    const openInMaps = (station: any) => {
        try {
            const parts = [station?.address?.detail, station?.address?.district, station?.address?.city].filter(
                Boolean,
            );
            const query = parts.join(', ');
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
            window.open(url, '_blank');
        } catch (err) {
            console.error('Failed to open Google Maps:', err);
        }
    };

    useEffect(() => {
        fetchStations();
    }, []);

    return (
        <div className="">
            {/* Header */}
            <div className="flex justify-end items-center mb-6">
                <button
                    className="bg-primary hover:bg-primary/85 px-4 py-2 rounded-lg text-white cursor-pointer"
                    onClick={handleOpenAddModal}
                >
                    Thêm trạm sạc
                </button>
            </div>

            {/* Station Grid */}
            <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6 mb-6">
                {stations.map((station: any, index: number) => (
                    <div
                        key={index}
                        className="bg-white shadow-[0_0_6px_1px_rgba(0,0,0,0.25)] rounded-xl overflow-hidden"
                    >
                        {/* Station Image */}
                        <div className="relative p-2">
                            <img
                                src={station.image || 'https://via.placeholder.com/300x200.png?text=Station+Image'}
                                alt="Station"
                                className="rounded-lg w-full h-32 object-cover"
                            />
                            <div className="top-3 left-4 absolute">{getStatusBadge(station.state)}</div>
                        </div>

                        {/* Station Info */}
                        <div className="p-3 pt-0">
                            <h3 className="mb-2 font-semibold text-gray-800">{station.name}</h3>

                            <div className="space-y-1 text-gray-600 text-sm">
                                <div className="flex items-center">
                                    <FaLocationDot className="mt-0.5 mr-2 shrink-0" />
                                    <p className="line-clamp-2">
                                        {station.address.detail}, {station.address.district}, {station.address.city}
                                    </p>
                                </div>

                                <div className="flex items-center">
                                    <PiPlugChargingFill className="mr-2" />
                                    {station.slots} 8 trụ sạc
                                </div>
                                <div className="flex items-center">
                                    <BsLightningChargeFill className="mr-2" />
                                    Công suất cao nhất: {station.power}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between items-center mt-4">
                                <button
                                    className="flex items-center text-text hover:text-blue-800 text-sm cursor-pointer"
                                    onClick={() => openInMaps(station)}
                                >
                                    <FaMapMarkedAlt className="mr-2 text-[#333] text-lg" /> Xem bản đồ
                                </button>
                                <div className="flex items-center space-x-2">
                                    {/* Edit */}
                                    <button className="bg-[#00BCD4] hover:bg-[#00BCD4]/80 p-2 rounded-full cursor-pointer">
                                        <FiEdit className="text-[#ffffff]" />
                                    </button>
                                    {/* Delete */}
                                    <button
                                        className="bg-red-100 hover:bg-red-200 p-2 rounded-full cursor-pointer"
                                        onClick={() => {
                                            setDeleteIsOpen(true);
                                            setStationToDelete(station._id);
                                        }}
                                    >
                                        <MdDelete className="text-red-500 text-lg" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* loading */}
            {isLoading && (
                <div className="z-50 flex justify-center items-center bg-background/50 w-full">
                    <div className="border-4 border-primary border-t-transparent rounded-full w-16 h-16 animate-spin" />
                </div>
            )}

            {/* popup add station */}
            <div
                className={`fixed inset-0 flex z-50 justify-center items-center bg-black/40 bg-opacity-50 ${
                    addIsOpen ? 'block' : 'hidden'
                }`}
            >
                <div className="bg-white lg:px-11 lg:py-4 rounded-3xl w-full max-w-[500px] overflow-y-auto no-scrollbar">
                    <div className="bg-[#FFFFFF] border-[#999] sm:max-w-[425px]">
                        <div className="mb-8 font-semibold text-xl text-center">Thêm trạm sạc</div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Image Upload Section */}
                            <div className="space-y-2">
                                {previewImage ? (
                                    <div className="relative">
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="border rounded-lg w-full h-32 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="top-2 right-2 absolute bg-red-500 hover:bg-red-600 p-1 rounded-full text-white"
                                        ></button>
                                    </div>
                                ) : (
                                    <div
                                        className="bg-[#D5E9F8] p-6 border-2 border-gray-300 hover:border-gray-400 border-dashed rounded-lg text-center transition-colors cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <IoIosImages className="mx-auto mb-2 w-8 h-8 text-gray-400" />
                                        <p className="mb-2 text-gray-600 text-sm">Chọn hình ảnh</p>
                                        <p className="text-gray-400 text-xs">PNG, JPG, GIF tối đa 5MB</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">Tỉnh/Thành phố *</Label>
                                <Select
                                    value={selectedCity}
                                    onValueChange={(value) => {
                                        setSelectedCity(value);
                                        const found = listCity.find((c) => String(c.code) === value);
                                        const label = found?.name ?? '';
                                        setFormData((prev) => ({ ...prev, city: label }));
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn tỉnh/thành phố" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {listCity.map((city) => (
                                            <SelectItem key={city.code} value={String(city.code)}>
                                                {city.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="ward">Phường/Xã *</Label>
                                <Select
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, district: value }))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn phường/xã" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {listWard.map((ward) => (
                                            <SelectItem key={ward.code} value={String(ward.name)}>
                                                {ward.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="detail">Địa chỉ chi tiết *</Label>
                                <Input
                                    type="text"
                                    id="detail"
                                    name="detail"
                                    // value={formData.detail}
                                    onChange={handleDetailAddressChange}
                                />
                            </div>

                            <div className="flex lg:justify-end items-center gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={() => setAddIsOpen(false)}>
                                    Hủy
                                </Button>
                                <Button type="submit">Thêm</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Confirm Delete Modal */}
            <div
                className={`fixed z-50 inset-0 flex justify-center items-center bg-black/40 bg-opacity-50 ${
                    deleteIsOpen ? 'block' : 'hidden'
                }`}
            >
                <div className="bg-white dark:bg-gray-900 mx-4 p-4 lg:p-6 rounded-3xl w-full max-w-[500px] overflow-y-auto no-scrollbar">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 font-semibold text-gray-800 dark:text-white/90 text-2xl">
                            Xác nhận xóa trạm sạc
                        </h4>
                        <p className="mb-6 lg:mb-7 text-gray-500 dark:text-gray-400 text-sm">
                            Bạn có chắc chắn muốn xóa trạm sạc này không?
                            <br />
                            Hành động này không thể hoàn tác.
                        </p>
                    </div>

                    <div className="flex lg:justify-end items-center gap-3 mt-6 px-2">
                        <Button variant="outline" onClick={closeDeleteModal}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
