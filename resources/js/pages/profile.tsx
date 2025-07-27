import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import MobileLayout from '@/layouts/mobile-layout';
import { Head, useForm } from '@inertiajs/react';
import {
    Activity,
    Calendar,
    CheckCircle,
    Edit2,
    Eye,
    EyeOff,
    Lock,
    Mail,
    Save,
    Shield,
    TrendingUp,
    User
} from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface Stats {
    totalReports: number;
    thisMonthReports: number;
    lastMonthReports: number;
    avgEfficiency: number;
    totalMeter: number;
}

interface Props {
    user: User;
    stats: Stats;
}

export default function Profile({ user, stats }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        name: user.name,
        email: user.email,
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('profile.update'), {
            onSuccess: () => {
                setIsEditing(false);
                setIsChangingPassword(false);
                reset('current_password', 'password', 'password_confirmation');
            },
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setIsChangingPassword(false);
        setData({
            name: user.name,
            email: user.email,
            current_password: '',
            password: '',
            password_confirmation: '',
        });
        reset('current_password', 'password', 'password_confirmation');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getChangePercentage = () => {
        if (stats.lastMonthReports === 0) return stats.thisMonthReports > 0 ? 100 : 0;
        return ((stats.thisMonthReports - stats.lastMonthReports) / stats.lastMonthReports * 100);
    };

    return (
        <MobileLayout title="Profil" user={user}>
            <Head title="Profil" />
            
            <div className="p-4 space-y-4">
                {/* Profile Header */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center">
                                <User className="w-5 h-5 mr-2" />
                                Informasi Akun
                            </span>
                            {!isEditing && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={!isEditing}
                                        className={!isEditing ? 'bg-gray-50' : ''}
                                    />
                                    {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            disabled={!isEditing}
                                            className={`pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                                        />
                                    </div>
                                    {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>Bergabung sejak {formatDate(user.created_at)}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-blue-600">
                                        <Shield className="w-4 h-4 mr-1" />
                                        <span>Operator</span>
                                    </div>
                                </div>

                                {isEditing && (
                                    <>
                                        <Separator />
                                        
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium">Ubah Password</h4>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsChangingPassword(!isChangingPassword)}
                                            >
                                                <Lock className="w-4 h-4 mr-2" />
                                                {isChangingPassword ? 'Batal' : 'Ubah Password'}
                                            </Button>
                                        </div>

                                        {isChangingPassword && (
                                            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <Label htmlFor="current_password">Password Saat Ini</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="current_password"
                                                            type={showCurrentPassword ? 'text' : 'password'}
                                                            value={data.current_password}
                                                            onChange={(e) => setData('current_password', e.target.value)}
                                                            className="pr-10"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                        >
                                                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                    {errors.current_password && <div className="text-red-600 text-sm mt-1">{errors.current_password}</div>}
                                                </div>

                                                <div>
                                                    <Label htmlFor="password">Password Baru</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="password"
                                                            type={showNewPassword ? 'text' : 'password'}
                                                            value={data.password}
                                                            onChange={(e) => setData('password', e.target.value)}
                                                            className="pr-10"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                        >
                                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                    {errors.password && <div className="text-red-600 text-sm mt-1">{errors.password}</div>}
                                                </div>

                                                <div>
                                                    <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="password_confirmation"
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            value={data.password_confirmation}
                                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                                            className="pr-10"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                        >
                                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex space-x-2 pt-4">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="flex-1 bg-[#1e3a8a] hover:bg-[#1e40af]"
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                {processing ? 'Menyimpan...' : 'Simpan'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCancel}
                                                disabled={processing}
                                            >
                                                Batal
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Statistics Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Activity className="w-5 h-5 mr-2" />
                            Statistik Aktivitas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{stats.totalReports}</div>
                                <div className="text-xs text-gray-600">Total Laporan</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{stats.thisMonthReports}</div>
                                <div className="text-xs text-gray-600">Bulan Ini</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">{Number(stats.avgEfficiency || 0).toFixed(1)}%</div>
                                <div className="text-xs text-gray-600">Rata-rata Efisiensi</div>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">{Number(stats.totalMeter || 0).toFixed(1)}m</div>
                                <div className="text-xs text-gray-600">Total Meter</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                                <span className="text-sm text-gray-700">Perubahan dari bulan lalu</span>
                            </div>
                            <div className={`text-sm font-medium ${
                                getChangePercentage() >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {getChangePercentage() >= 0 ? '+' : ''}{Number(getChangePercentage()).toFixed(1)}%
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Achievement Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Pencapaian
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                                <div className="ml-3">
                                    <div className="text-sm font-medium">Operator Aktif</div>
                                    <div className="text-xs text-gray-500">Melakukan input laporan secara rutin</div>
                                </div>
                            </div>
                        </div>

                        {stats.totalReports >= 10 && (
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Activity className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-sm font-medium">Produktif</div>
                                        <div className="text-xs text-gray-500">Telah membuat {stats.totalReports} laporan</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {stats.avgEfficiency >= 80 && (
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-sm font-medium">Efisien</div>
                                        <div className="text-xs text-gray-500">Efisiensi rata-rata di atas 80%</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MobileLayout>
    );
}
