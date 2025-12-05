import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { client } from '../api/client';
import { User, Store, Bike, Upload, X } from 'lucide-react';

// Define possible user roles
type Role = 'CUSTOMER' | 'RESTAURANT' | 'RIDER';

// Options displayed on the role selection screen
const roleOptions = [
    {
        value: 'CUSTOMER' as Role,
        title: 'Customer',
        description: 'Order delicious food',
        icon: User,
        color: 'from-blue-500 to-blue-600',
    },
    {
        value: 'RESTAURANT' as Role,
        title: 'Restaurant',
        description: 'Grow your business',
        icon: Store,
        color: 'from-purple-500 to-purple-600',
    },
    {
        value: 'RIDER' as Role,
        title: 'Rider',
        description: 'Deliver & earn money',
        icon: Bike,
        color: 'from-green-500 to-green-600',
    },
];

const Register: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');

    // Restaurant‑specific fields
    const [businessName, setBusinessName] = useState('');
    const [address, setAddress] = useState('');
    const [storefrontImage, setStorefrontImage] = useState('');
    const [storefrontPreview, setStorefrontPreview] = useState('');

    // Rider‑specific fields
    const [vehicleType, setVehicleType] = useState('BIKE');
    const [nidPassport, setNidPassport] = useState('');
    const [profilePhoto, setProfilePhoto] = useState('');
    const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
    const [drivingLicense, setDrivingLicense] = useState('');
    const [drivingLicensePreview, setDrivingLicensePreview] = useState('');
    const [vehicleRegistration, setVehicleRegistration] = useState('');
    const [vehicleRegistrationPreview, setVehicleRegistrationPreview] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showApprovalMessage, setShowApprovalMessage] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    // Image upload handling for restaurant storefronts
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setStorefrontImage(base64);
            setStorefrontPreview(base64);
            setError('');
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setStorefrontImage('');
        setStorefrontPreview('');
    };

    // Generic file upload handler for riders
    const handleFileUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        setFile: (file: string) => void,
        setPreview: (preview: string) => void
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setFile(base64);
            setPreview(base64);
            setError('');
        };
        reader.readAsDataURL(file);
    };

    const requiresDocuments = vehicleType === 'BIKE' || vehicleType === 'CAR' || vehicleType === 'SCOOTER';

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload: any = {
                name,
                email,
                password,
                role: selectedRole,
                phone: phone || undefined,
            };

            // Add role‑specific data
            if (selectedRole === 'RESTAURANT') {
                payload.businessName = businessName;
                payload.address = address;
                if (storefrontImage) payload.storefrontImage = storefrontImage;
            }
            if (selectedRole === 'RIDER') {
                payload.vehicleType = vehicleType;
                payload.nidPassport = nidPassport;
                if (profilePhoto) payload.profilePhoto = profilePhoto;
                if (drivingLicense) payload.drivingLicense = drivingLicense;
                if (vehicleRegistration) payload.vehicleRegistration = vehicleRegistration;
            }

            const res = await client.post('/auth/register', payload);

            if (res.data.success) {
                const { user, tokens } = res.data.data;
                if (user.role === 'RESTAURANT' || user.role === 'RIDER') {
                    // Show pending‑approval modal and redirect to login after a short delay
                    setShowApprovalMessage(true);
                    setTimeout(() => {
                        navigate('/login');
                    }, 5000);
                } else {
                    // Immediate login for other roles (CUSTOMER, ADMIN)
                    login(tokens.accessToken, user);
                    if (user.role === 'ADMIN') {
                        navigate('/admin');
                    } else if (user.role === 'CUSTOMER') {
                        navigate('/customer');
                    } else {
                        navigate('/dashboard');
                    }
                }
            } else {
                setError(res.data.message || 'Registration failed');
            }
        } catch (err: any) {
            console.error('Registration error:', err.response?.data);
            setError(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 p-4">
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-2">
                        Join RideN'Bite
                    </h1>
                    <p className="text-gray-500 font-medium">Start your delicious journey today</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm">
                        {error}
                    </div>
                )}

                {/* Role selection */}
                {!selectedRole ? (
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">I want to...</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {roleOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => setSelectedRole(option.value)}
                                        className="p-6 rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all duration-200 group cursor-pointer bg-white"
                                    >
                                        <div
                                            className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                                        >
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">{option.title}</h3>
                                        <p className="text-sm text-gray-5">{option.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    // Registration form
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                Sign up as {roleOptions.find((r) => r.value === selectedRole)?.title}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setSelectedRole(null)}
                                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                            >
                                Change
                            </button>
                        </div>

                        {/* Common fields */}
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Full Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-200"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Email Address</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-200"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-200"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                                Phone Number {selectedRole === 'RESTAURANT' && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="tel"
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-200"
                                placeholder="+880 1234-567890"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required={selectedRole === 'RESTAURANT'}
                            />
                        </div>

                        {/* Restaurant‑specific fields */}
                        {selectedRole === 'RESTAURANT' && (
                            <>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Business Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-200"
                                        placeholder="My Restaurant"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Restaurant Address</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-200"
                                        placeholder="123 Main Street, Dhaka"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Storefront Picture (Optional)</label>
                                    {storefrontPreview ? (
                                        <div className="relative">
                                            <img
                                                src={storefrontPreview}
                                                alt="Storefront preview"
                                                className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-500">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-400">PNG, JPG, WEBP (MAX. 5MB)</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Rider‑specific fields */}
                        {selectedRole === 'RIDER' && (
                            <>
                                {/* Profile Photo */}
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-green-100">
                                            {profilePhotoPreview ? (
                                                <img
                                                    src={profilePhotoPreview}
                                                    alt="Profile preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                                    <User className="h-10 w-10 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <label
                                            htmlFor="profile-upload"
                                            className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700"
                                        >
                                            <Upload className="h-4 w-4" />
                                            <input
                                                id="profile-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileUpload(e, setProfilePhoto, setProfilePhotoPreview)}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                                <p className="text-center text-sm text-gray-500 -mt-4">Upload profile picture</p>

                                {/* NID/Passport */}
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                                        NID / Passport Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all duration-200"
                                        placeholder="Enter your NID or Passport number"
                                        value={nidPassport}
                                        onChange={(e) => setNidPassport(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Vehicle Type */}
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                                        Vehicle Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all duration-200"
                                        value={vehicleType}
                                        onChange={(e) => setVehicleType(e.target.value)}
                                        required
                                    >
                                        <option value="BIKE">Motorcycle</option>
                                        <option value="CAR">Car</option>
                                        <option value="SCOOTER">Scooter</option>
                                        <option value="BICYCLE">Bicycle</option>
                                    </select>
                                </div>

                                {/* Document Uploads (Motor Vehicles Only) */}
                                {requiresDocuments && (
                                    <div className="space-y-4 rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
                                        <h3 className="text-sm font-semibold text-amber-900">
                                            Required Documents (Motor Vehicles)
                                        </h3>

                                        {/* Driving License */}
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                                Driving License <span className="text-red-500">*</span>
                                            </label>
                                            {drivingLicensePreview ? (
                                                <div className="relative">
                                                    <img
                                                        src={drivingLicensePreview}
                                                        alt="Driving license"
                                                        className="h-40 w-full rounded-lg border-2 border-gray-200 object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setDrivingLicense('');
                                                            setDrivingLicensePreview('');
                                                        }}
                                                        className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 hover:border-green-400">
                                                    <Upload className="mb-2 h-8 w-8 text-gray-400" />
                                                    <span className="text-sm text-gray-600">Upload Driving License</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) =>
                                                            handleFileUpload(e, setDrivingLicense, setDrivingLicensePreview)
                                                        }
                                                        className="hidden"
                                                        required={requiresDocuments}
                                                    />
                                                </label>
                                            )}
                                        </div>

                                        {/* Vehicle Registration */}
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                                Vehicle Registration Paper <span className="text-red-500">*</span>
                                            </label>
                                            {vehicleRegistrationPreview ? (
                                                <div className="relative">
                                                    <img
                                                        src={vehicleRegistrationPreview}
                                                        alt="Vehicle registration"
                                                        className="h-40 w-full rounded-lg border-2 border-gray-200 object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setVehicleRegistration('');
                                                            setVehicleRegistrationPreview('');
                                                        }}
                                                        className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 hover:border-green-400">
                                                    <Upload className="mb-2 h-8 w-8 text-gray-400" />
                                                    <span className="text-sm text-gray-600">Upload Registration Paper</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) =>
                                                            handleFileUpload(
                                                                e,
                                                                setVehicleRegistration,
                                                                setVehicleRegistrationPreview
                                                            )
                                                        }
                                                        className="hidden"
                                                        required={requiresDocuments}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-4 rounded-lg hover:from-orange-600 hover:to-red-700 focus:ring-4 focus:ring-orange-300 transform transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-sm">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="text-orange-600 font-bold hover:text-orange-700 hover:underline transition-colors"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>

                {/* Admin approval modal for restaurant and rider registrations */}
                {showApprovalMessage && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform animate-in">
                            <div className="text-center">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                                    selectedRole === 'RIDER' 
                                        ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                        : 'bg-gradient-to-r from-orange-500 to-red-600'
                                }`}>
                                    {selectedRole === 'RIDER' ? (
                                        <Bike className="w-10 h-10 text-white" />
                                    ) : (
                                        <Store className="w-10 h-10 text-white" />
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
                                <p className="text-gray-600 mb-4">
                                    Your {selectedRole === 'RIDER' ? 'rider' : 'restaurant'} account has been created.
                                </p>
                                <div className={`border-l-4 p-4 rounded mb-4 ${
                                    selectedRole === 'RIDER'
                                        ? 'bg-green-50 border-green-500'
                                        : 'bg-orange-50 border-orange-500'
                                }`}>
                                    <p className={`font-semibold text-sm ${
                                        selectedRole === 'RIDER' ? 'text-green-800' : 'text-orange-800'
                                    }`}>
                                        ⏳ Waiting for Admin Approval
                                    </p>
                                    <p className={`text-sm mt-1 ${
                                        selectedRole === 'RIDER' ? 'text-green-700' : 'text-orange-700'
                                    }`}>
                                        An administrator will review your {selectedRole === 'RIDER' ? 'rider' : 'restaurant'} profile shortly. You'll be notified once approved.
                                    </p>
                                </div>
                                <p className="text-sm text-gray-500">Redirecting to login in 5 seconds...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
