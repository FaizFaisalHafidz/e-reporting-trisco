import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Appearance settings" description="Application theme configuration" />
                    
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            This application is configured to use light mode only for optimal readability and professional appearance.
                        </AlertDescription>
                    </Alert>
                    
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
