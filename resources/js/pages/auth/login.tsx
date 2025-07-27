import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, Lock, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Masuk ke Akun Anda" description="Masukkan email dan password untuk mengakses sistem">
            <Head title="Login - E-Reporting TRISCO" />

            {status && (
                <div className="mb-4 p-3 text-center text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-lg">
                    {status}
                </div>
            )}

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    {/* Email Field */}
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="admin@trisco.com"
                                className="pl-10 h-11 border-gray-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] rounded-lg"
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    {/* Password Field */}
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                            {canResetPassword && (
                                <TextLink 
                                    href={route('password.request')} 
                                    className="ml-auto text-sm text-[#1e3a8a] hover:text-[#1e40af]" 
                                    tabIndex={5}
                                >
                                    Lupa password?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Masukkan password"
                                className="pl-10 pr-10 h-11 border-gray-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a] rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                            className="border-gray-300 data-[state=checked]:bg-[#1e3a8a] data-[state=checked]:border-[#1e3a8a]"
                        />
                        <Label htmlFor="remember" className="text-gray-600 text-sm">Ingat saya</Label>
                    </div>

                    {/* Login Button */}
                    <Button 
                        type="submit" 
                        className="mt-4 w-full h-11 bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] hover:from-[#1e40af] hover:to-[#1e3a8a] text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                        tabIndex={4} 
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                        {processing ? 'Masuk...' : 'Masuk'}
                    </Button>
                </div>

                {/* Register Link */}
                {/* <div className="text-center text-sm text-gray-600">
                    Belum punya akun?{' '}
                    <TextLink href={route('register')} tabIndex={5} className="text-[#1e3a8a] hover:text-[#1e40af] font-medium">
                        Daftar di sini
                    </TextLink>
                </div> */}
            </form>
        </AuthLayout>
    );
}
