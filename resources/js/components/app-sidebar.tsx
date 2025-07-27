import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    CheckSquare,
    Database,
    FileText,
    LayoutGrid,
    Settings,
    Shield,
    Users
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Data Laporan',
        href: '/admin/reports',
        icon: FileText,
        items: [
            {
                title: 'Input Laporan',
                href: '/admin/input-reports',
            },
            {
                title: 'Semua Laporan',
                href: '/admin/reports/all',
            },
        ],
    },
    {
        title: 'Validasi & Approval',
        href: '/admin/validation',
        icon: CheckSquare,
        items: [
            {
                title: 'Pending Approval',
                href: '/admin/validation/pending',
            },
            {
                title: 'History Validasi',
                href: '/admin/validation/history',
            },
        ],
    },
    {
        title: 'Rekap & Monitoring',
        href: '/admin/monitoring',
        icon: BarChart3,
        items: [
            {
                title: 'Dashboard Monitoring',
                href: '/admin/monitoring/dashboard',
            },
            {
                title: 'Performa Tim',
                href: '/admin/monitoring/team',
            },
            {
                title: 'Trend Produksi',
                href: '/admin/monitoring/production',
            },
        ],
    },
    {
        title: 'Manajemen User',
        href: '/admin/users',
        icon: Users,
        items: [
            {
                title: 'Daftar User',
                href: '/admin/users',
            },
            {
                title: 'Role & Permission',
                href: '/admin/roles',
            },
        ],
    },
    {
        title: 'Master Data',
        href: '/admin/master',
        icon: Database,
        items: [
            {
                title: 'Data Mesin',
                href: '/admin/master/machines',
            },
            {
                title: 'Data Shift',
                href: '/admin/master/shifts',
            },
            {
                title: 'Jenis Kain',
                href: '/admin/master/fabrics',
            },
            {
                title: 'Line Produksi',
                href: '/admin/master/lines',
            },
            {
                title: 'Data Customer',
                href: '/admin/master/customers',
            },
            {
                title: 'Data Pattern',
                href: '/admin/master/patterns',
            },
        ],
    },
    {
        title: 'Log Aktivitas',
        href: '/admin/logs',
        icon: Activity,
        items: [
            {
                title: 'Log Sistem',
                href: '/admin/logs/system',
            },
            {
                title: 'Log Login',
                href: '/admin/logs/login',
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Pengaturan Sistem',
        href: '/admin/settings',
        icon: Settings,
    },
    {
        title: 'About E-Reporting',
        href: '/about',
        icon: Shield,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-slate-200/80 bg-white/95 backdrop-blur-sm">
            <SidebarHeader className="bg-white/90 border-b border-slate-200/80 p-4 backdrop-blur-sm">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            size="lg" 
                            asChild
                            className="hover:bg-slate-50/80 transition-all duration-300 rounded-xl p-3 group"
                        >
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="bg-gradient-to-b from-white/95 via-slate-50/30 to-white/95 py-2 backdrop-blur-sm">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="bg-white/90 border-t border-slate-200/80 p-2 backdrop-blur-sm">
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
