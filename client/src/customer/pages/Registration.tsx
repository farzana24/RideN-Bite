import { useState } from "react";
import { Mail, Lock, User, Phone, MapPin, Upload, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Link } from "react-router-dom";

export function Registration() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle registration logic
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12 px-4">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                        Join <span className="text-orange-600">RideN-Bite</span>
                    </h1>
                    <p className="mt-2 text-slate-600">Create your account and start ordering delicious food</p>
                </div>

                {/* Registration Card */}
                <Card className="shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">Create Account</CardTitle>
                        <CardDescription>Fill in your details to get started</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Profile Picture Upload */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-orange-100">
                                        {profileImage ? (
                                            <img
                                                src={profileImage}
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
                                        className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-orange-600 text-white shadow-lg hover:bg-orange-700"
                                    >
                                        <Upload className="h-4 w-4" />
                                        <input
                                            id="profile-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>
                            <p className="text-center text-sm text-slate-500">Upload profile picture (optional)</p>

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
                                            placeholder="Enter your full name"
                                            required
                                            className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-slate-700">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="your.email@example.com"
                                            required
                                            className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                                            placeholder="+880 1XXX-XXXXXX"
                                            required
                                            className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-sm font-medium text-slate-700">
                                        Password *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Create a strong password"
                                            required
                                            className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2 md:col-span-2">
                                    <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                                        Confirm Password *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Re-enter your password"
                                            required
                                            className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Address - Full Width */}
                            <div className="space-y-2">
                                <label htmlFor="address" className="text-sm font-medium text-slate-700">
                                    Delivery Address *
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <textarea
                                        id="address"
                                        rows={3}
                                        placeholder="Enter your complete delivery address"
                                        required
                                        className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            {/* Terms and Conditions */}
                            <div className="flex items-start gap-2">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    required
                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-2 focus:ring-orange-500"
                                />
                                <label htmlFor="terms" className="text-sm text-slate-600">
                                    I agree to the{" "}
                                    <Link to="/terms" className="text-orange-600 hover:underline">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link to="/privacy" className="text-orange-600 hover:underline">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full rounded-md bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                            >
                                Create Account
                            </button>
                        </form>

                        {/* Login Link */}
                        <div className="mt-6 text-center text-sm text-slate-600">
                            Already have an account?{" "}
                            <Link to="/login" className="font-semibold text-orange-600 hover:underline">
                                Sign in here
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
