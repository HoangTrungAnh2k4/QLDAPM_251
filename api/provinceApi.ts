// API service for Vietnam Provinces API
const BASE_URL = 'https://provinces.open-api.vn/api/v2';

export interface Province {
    code: number;
    codename: string;
    division_type: string;
    name: string;
    phone_code: number;
}

export interface District {
    code: number;
    codename: string;
    division_type: string;
    name: string;
    province_code: number;
}

export interface Ward {
    code: number;
    codename: string;
    division_type: string;
    name: string;
    district_code?: number;
    province_code?: number;
}

class ProvincesApiService {
    // Get all provinces with wards (depth=2)
    async getProvincesWithWards(search: string = ''): Promise<any[]> {
        try {
            const url = search ? `${BASE_URL}/?depth=2&search=${encodeURIComponent(search)}` : `${BASE_URL}/?depth=2`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch provinces with wards');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching provinces with wards:', error);
            throw error;
        }
    }

    // Get all provinces (simple list)
    async getProvinces(search: string = ''): Promise<Province[]> {
        try {
            const url = search ? `${BASE_URL}/p/?search=${encodeURIComponent(search)}` : `${BASE_URL}/p/`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch provinces');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching provinces:', error);
            throw error;
        }
    }

    // Get districts by province code
    async getDistricts(provinceCode: number): Promise<District[]> {
        try {
            const url = `${BASE_URL}/w/?province_code=${provinceCode}`;
            const response = await fetch(url);
            if (!response.ok) {
                const text = await response.text().catch(() => '');
                throw new Error(`Failed to fetch districts (${response.status}): ${text || url}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching districts:', error);
            throw error;
        }
    }

    // Get wards by district code
    async getWards(districtCode: number): Promise<Ward[]> {
        try {
            const response = await fetch(`${BASE_URL}/w/?district_code=${districtCode}`);
            if (!response.ok) {
                throw new Error('Failed to fetch wards');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching wards:', error);
            throw error;
        }
    }

    // Get single province by code
    async getProvince(provinceCode: number): Promise<Province> {
        try {
            const response = await fetch(`${BASE_URL}/p/${provinceCode}`);
            if (!response.ok) {
                throw new Error('Failed to fetch province');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching province:', error);
            throw error;
        }
    }

    // Get single district by code
    async getDistrict(districtCode: number): Promise<District> {
        try {
            const response = await fetch(`${BASE_URL}/d/${districtCode}`);
            if (!response.ok) {
                throw new Error('Failed to fetch district');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching district:', error);
            throw error;
        }
    }

    // Get single ward by code
    async getWard(wardCode: number): Promise<Ward> {
        try {
            const response = await fetch(`${BASE_URL}/w/${wardCode}`);
            if (!response.ok) {
                throw new Error('Failed to fetch ward');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching ward:', error);
            throw error;
        }
    }
}

export const provincesApiService = new ProvincesApiService();
