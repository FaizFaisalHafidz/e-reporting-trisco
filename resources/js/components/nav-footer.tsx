import { Icon } from '@/components/icon';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type ComponentPropsWithoutRef } from 'react';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    const page = usePage();
    
    return (
        <SidebarGroup {...props} className={`group-data-[collapsible=icon]:p-0 px-3 py-2 ${className || ''}`}>
            <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                    {items.map((item) => {
                        const isActiveItem = page.url === item.href;
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    className={cn(
                                        "group relative w-full justify-start rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                        isActiveItem ? [
                                            "bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg shadow-slate-600/20",
                                            "hover:from-slate-800 hover:to-slate-700"
                                        ] : [
                                            "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                        ]
                                    )}
                                >
                                    <Link href={item.href} prefetch className="flex items-center gap-3 w-full">
                                        {item.icon && (
                                            <Icon 
                                                iconNode={item.icon} 
                                                className={cn(
                                                    "h-4 w-4 transition-colors duration-200",
                                                    isActiveItem ? "text-white" : "text-slate-400"
                                                )} 
                                            />
                                        )}
                                        <span className="truncate">
                                            {item.title}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
