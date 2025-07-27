import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface DashboardProps {
    user: User;
    roles: string[];
    permissions: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ user, roles, permissions }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                {/* User Info Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-4">
                    <h2 className="text-xl font-semibold mb-4">Selamat Datang, {user.name}!</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h3 className="font-medium text-gray-600 dark:text-gray-400">Email</h3>
                            <p className="text-gray-900 dark:text-gray-100">{user.email}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-600 dark:text-gray-400">Role</h3>
                            <div className="flex gap-2">
                                {roles.map((role) => (
                                    <span 
                                        key={role}
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            role === 'admin' 
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                        }`}
                                    >
                                        {role === 'admin' ? 'Administrator' : 'Operator'}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-600 dark:text-gray-400">Total Permissions</h3>
                            <p className="text-gray-900 dark:text-gray-100">{permissions.length} permissions</p>
                        </div>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
