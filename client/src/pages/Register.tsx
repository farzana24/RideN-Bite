import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { client } from '../api/client';
import { User, Store, Bike } from 'lucide-react';

type Role = 'CUSTOMER' | 'RESTAURANT' | 'RIDER';

const Register: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');

    // Restaurant-specific fields
    const [businessName, setBusinessName] = useState('');
    const [address, setAddress] = useState('');

    // Rider-specific fields
    const [vehicleType, setVehicleType] = useState('BIKE');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

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

            // Add role-specific data
            if (selectedRole === 'RESTAURANT' && businessName && address) {
                payload.businessName = businessName;
                payload.address = address;
            }

            if (selectedRole === 'RIDER') {
                payload.vehicleType = vehicleType;
            }

            const res = await client.post('/auth/register', payload);

            if (res.data.success) {
                const { user, tokens } = res.data.data;
                login(tokens.accessToken, user);

                // Redirect based on role
                if (user.role === 'ADMIN') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

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

                {!selectedRole ? (
                    // Role Selection
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                            I want to...
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {roleOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => setSelectedRole(option.value)}
                                        className={`p-6 rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all duration-200 group cursor-pointer bg-white`}
                                    >
                                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                                            {option.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">{option.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    // Registration Form
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                Sign up as {roleOptions.find(r => r.value === selectedRole)?.title}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setSelectedRole(null)}
                                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                            >
                                Change
                            </button>
                        </div>

                        {/* Common Fields */}
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                                Full Name
                            </label>
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
                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                                Email Address
                            </label>
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
                            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                                Password
                            </label>
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
                                Phone Number (Optional)
                            </label>
                            <input
                                type="tel"
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-200"
                                placeholder="+880 1234-567890"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        {/* Restaurant-specific fields */}
                        {selectedRole === 'RESTAURANT' && (
                            <>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                                        Business Name
                                    </label>
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
                                    <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                                        Restaurant Address
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-200"
                                        placeholder="123 Main Street, Dhaka"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                    />
                                </div>
                            </>
                        )}

                        {/* Rider-specific fields */}
                        {selectedRole === 'RIDER' && (
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                                    Vehicle Type
                                </label>
                                <select
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none transition-all duration-200"
                                    value={vehicleType}
                                    onChange={(e) => setVehicleType(e.target.value)}
                                    required
                                >
                                    <option value="BIKE">Motorcycle</option>
                                    <option value="BICYCLE">Bicycle</option>
                                    <option value="CAR">Car</option>
                                    <option value="SCOOTER">Scooter</option>
                                </select>
                            </div>
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
            </div>
        </div>
    );
};

export default Register;
