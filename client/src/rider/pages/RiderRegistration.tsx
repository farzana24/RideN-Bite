import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Phone, MapPin, Upload, Eye, EyeOff, CreditCard, Bike, Car, PersonStanding } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { client } from "../../api/client";

type VehicleType = "BIKE" | "BICYCLE" | "ON_FOOT" | "SCOOTER" | "CAR";

export function RiderRegistration() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form state
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [nidPassport, setNidPassport] = useState("");
    const [vehicleType, setVehicleType] = useState<VehicleType>("BIKE");

    // File uploads
    const [profilePhoto, setProfilePhoto] = useState<string>("");
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");
    const [drivingLicense, setDrivingLicense] = useState<string>("");
    const [drivingLicensePreview, setDrivingLicensePreview] = useState<string>("");
    const [vehicleRegistration, setVehicleRegistration] = useState<string>("");
    const [vehicleRegistrationPreview, setVehicleRegistrationPreview] = useState<string>("");

    const [showPassword, setShowPassword] = useState(false);

    const requiresDocuments = vehicleType === "BIKE" || vehicleType === "CAR" || vehicleType === "SCOOTER";

    const handleFileUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        setFile: (file: string) => void,
        setPreview: (preview: string) => void
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please upload an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setFile(base64);
            setPreview(base64);
            setError("");
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const payload = {
                name: fullName,
                email,
                password,
                phone,
                role: "RIDER",
                address,
                nidPassport,
                vehicleType,
                profilePhoto: profilePhoto || undefined,
                drivingLicense: requiresDocuments ? drivingLicense : undefined,
                vehicleRegistration: requiresDocuments ? vehicleRegistration : undefined,
            };

            const res = await client.post("/auth/register", payload);

            if (res.data.success) {
                navigate("/login", {
                    state: {
                        message: "Registration successful! Your account is under review. Please wait for admin approval.",
                        type: "info",
                    },
                });
            } else {
                setError(res.data.message || "Registration failed");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const vehicleOptions = [
        { value: "BIKE", label: "Motorcycle", icon: Bike },
        { value: "CAR", label: "Car", icon: Car },
        { value: "SCOOTER", label: "Scooter", icon: Bike },
        { value: "BICYCLE", label: "Bicycle", icon: Bike },
        { value: "ON_FOOT", label: "On Foot", icon: PersonStanding },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                        Join as a <span className="text-green-600">Delivery Rider</span>
                    </h1>
                    <p className="mt-2 text-slate-600">Start earning by delivering food to customers</p>
                </div>

                {/* Registration Card */}
                <Card className="shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">Rider Registration</CardTitle>
                        <CardDescription>Fill in your details and upload required documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Profile Photo Upload */}
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
                                            <div className="flex h-full w-full items-center justify-center bg-slate-100">
                                                <User className="h-10 w-10 text-slate-400" />
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
                            <p className="text-center text-sm text-slate-500">Upload profile picture *</p>

                            {/* Two Column Layout */}
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Full Name */}
                                <div className="space-y-2">
                                    <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                                        Full Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="fullName"
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Enter your full name"
                                            required
                                            className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-sm font-medium text-slate-700">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+880 1XXX-XXXXXX"
                                            required
                                            className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-slate-700">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your.email@example.com"
                                            required
                                            className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-sm font-medium text-slate-700">
                                        Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Create a strong password"
                                            required
                                            minLength={6}
                                            className="w-full rounded-md border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* NID/Passport */}
                                <div className="space-y-2 md:col-span-2">
                                    <label htmlFor="nidPassport" className="text-sm font-medium text-slate-700">
                                        NID / Passport Number *
                                    </label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="nidPassport"
                                            type="text"
                                            value={nidPassport}
                                            onChange={(e) => setNidPassport(e.target.value)}
                                            placeholder="Enter your NID or Passport number"
                                            required
                                            className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address - Full Width */}
                            <div className="space-y-2">
                                <label htmlFor="address" className="text-sm font-medium text-slate-700">
                                    Address *
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <textarea
                                        id="address"
                                        rows={3}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Enter your complete address"
                                        required
                                        className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            {/* Vehicle Type Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Vehicle Type *</label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {vehicleOptions.map((option) => {
                                        const Icon = option.icon;
                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setVehicleType(option.value as VehicleType)}
                                                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                                                    vehicleType === option.value
                                                        ? "border-green-600 bg-green-50"
                                                        : "border-slate-200 hover:border-green-300"
                                                }`}
                                            >
                                                <Icon
                                                    className={`h-6 w-6 ${
                                                        vehicleType === option.value ? "text-green-600" : "text-slate-400"
                                                    }`}
                                                />
                                                <span
                                                    className={`text-xs font-medium ${
                                                        vehicleType === option.value ? "text-green-600" : "text-slate-600"
                                                    }`}
                                                >
                                                    {option.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Document Uploads (Motor Vehicles Only) */}
                            {requiresDocuments && (
                                <div className="space-y-4 rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
                                    <h3 className="text-sm font-semibold text-amber-900">
                                        Required Documents (Motor Vehicles)
                                    </h3>

                                    {/* Driving License */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Driving License *</label>
                                        {drivingLicensePreview ? (
                                            <div className="relative">
                                                <img
                                                    src={drivingLicensePreview}
                                                    alt="Driving license"
                                                    className="h-40 w-full rounded-lg border-2 border-slate-200 object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setDrivingLicense("");
                                                        setDrivingLicensePreview("");
                                                    }}
                                                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white p-6 hover:border-green-400">
                                                <Upload className="mb-2 h-8 w-8 text-slate-400" />
                                                <span className="text-sm text-slate-600">Upload Driving License</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) =>
                                                        handleFileUpload(e, setDrivingLicense, setDrivingLicensePreview)
                                                    }
                                                    className="hidden"
                                                    required
                                                />
                                            </label>
                                        )}
                                    </div>

                                    {/* Vehicle Registration */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Vehicle Registration Paper *
                                        </label>
                                        {vehicleRegistrationPreview ? (
                                            <div className="relative">
                                                <img
                                                    src={vehicleRegistrationPreview}
                                                    alt="Vehicle registration"
                                                    className="h-40 w-full rounded-lg border-2 border-slate-200 object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setVehicleRegistration("");
                                                        setVehicleRegistrationPreview("");
                                                    }}
                                                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white p-6 hover:border-green-400">
                                                <Upload className="mb-2 h-8 w-8 text-slate-400" />
                                                <span className="text-sm text-slate-600">Upload Registration Paper</span>
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
                                                    required
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Terms and Conditions */}
                            <div className="flex items-start gap-2">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    required
                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-2 focus:ring-green-500"
                                />
                                <label htmlFor="terms" className="text-sm text-slate-600">
                                    I agree to the{" "}
                                    <Link to="/terms" className="text-green-600 hover:underline">
                                        Terms of Service
                                    </Link>{" "}
                                    and confirm that all information provided is accurate.
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-md bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Submitting..." : "Submit Application"}
                            </button>
                        </form>

                        {/* Login Link */}
                        <div className="mt-6 text-center text-sm text-slate-600">
                            Already have an account?{" "}
                            <Link to="/login" className="font-semibold text-green-600 hover:underline">
                                Sign in here
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
