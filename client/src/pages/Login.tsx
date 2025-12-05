import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { client } from '../api/client';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await client.post('/auth/login', { email, password });
            if (res.data.success) {
                const { user, tokens } = res.data.data;
                login(tokens.accessToken, user);

                // Redirect based on user role
                if (user.role === 'ADMIN') {
                    navigate('/admin');
                } else if (user.role === 'RESTAURANT') {
                    navigate('/restaurant');
                }  else if (user.role === 'CUSTOMER') {
                    navigate('/customer');
                }  else if (user.role === 'RIDER') {
                    navigate('/rider');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 p-4">
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-[1.01]">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-2">
                        RideN'Bite
                    </h1>
                    <p className="text-gray-500 font-medium">The fastest way to your next bite</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-4 rounded-lg hover:from-orange-600 hover:to-red-700 focus:ring-4 focus:ring-orange-300 transform transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-orange-600 font-bold hover:text-orange-700 hover:underline transition-colors">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
