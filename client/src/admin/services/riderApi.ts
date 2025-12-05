import { client } from '../../api/client';

// Rider API service for admin operations
export interface RiderDocument {
    url: string;
    filename: string;
    uploadedAt: string;
}

export interface RiderProfile {
    id: number;
    userId: number;
    name: string;
    email: string;
    phone: string | null;
    vehicleType: 'BIKE' | 'CAR' | 'BICYCLE' | 'SCOOTER';
    vehicleNumber: string | null;
    status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
    availableRegions: string[];
    availableHours: any;
    createdAt: string;
    updatedAt: string;
    submittedAt: string;
    documents: {
        drivingLicense: RiderDocument | null;
        vehicleRegistration: RiderDocument | null;
        profilePhoto: RiderDocument | null;
        insurance: RiderDocument | null;
    };
}

export interface RiderStats {
    pending: number;
    active: number;
    suspended: number;
    rejected: number;
    approvedToday: number;
    rejectedToday: number;
}

export interface GetRidersParams {
    page?: number;
    limit?: number;
    status?: 'pending' | 'active' | 'suspended' | 'rejected';
    search?: string;
}

export interface GetRidersResponse {
    success: boolean;
    data: {
        data: RiderProfile[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface GetRiderResponse {
    success: boolean;
    data: RiderProfile;
}

export interface GetRiderStatsResponse {
    success: boolean;
    data: RiderStats;
}

export interface ApproveRiderResponse {
    success: boolean;
    data: any;
    message: string;
}

export interface RejectRiderRequest {
    reason?: string;
}

export interface SuspendRiderRequest {
    suspended: boolean;
    reason?: string;
}

// Get all riders with filters
export const getRiders = async (params?: GetRidersParams): Promise<GetRidersResponse> => {
    const response = await client.get('/admin/riders', { params });
    return response.data;
};

// Get single rider by ID
export const getRider = async (id: number): Promise<GetRiderResponse> => {
    const response = await client.get(`/admin/riders/${id}`);
    return response.data;
};

// Get rider statistics
export const getRiderStats = async (): Promise<GetRiderStatsResponse> => {
    const response = await client.get('/admin/riders/stats');
    return response.data;
};

// Approve rider
export const approveRider = async (id: number): Promise<ApproveRiderResponse> => {
    const response = await client.put(`/admin/riders/${id}/approve`);
    return response.data;
};

// Reject rider
export const rejectRider = async (id: number, data?: RejectRiderRequest): Promise<ApproveRiderResponse> => {
    const response = await client.put(`/admin/riders/${id}/reject`, data);
    return response.data;
};

// Suspend or unsuspend rider
export const suspendRider = async (id: number, data: SuspendRiderRequest): Promise<ApproveRiderResponse> => {
    const response = await client.put(`/admin/riders/${id}/suspend`, data);
    return response.data;
};
