import {
    Collapsible,
    CollapsibleContent
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [openItems, setOpenItems] = useState<string[]>([]);
    
    // Check if any submenu item is active to keep parent open
    const isParentActive = (item: NavItem) => {
        if (!item.items) return false;
        return item.items.some(subItem => page.url === subItem.href);
    };
    
    // Initialize open state for items with active subitems
    useEffect(() => {
        const activeParents = items
            .filter(item => isParentActive(item))
            .map(item => item.title);
        setOpenItems(activeParents);
    }, [page.url]);
    
    const toggleItem = (itemTitle: string) => {
        setOpenItems(prev => 
            prev.includes(itemTitle) 
                ? prev.filter(title => title !== itemTitle)
                : [...prev, itemTitle]
        );
    };
    
    return (
        <SidebarGroup className="px-3 py-2">
            <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                Menu Utama
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
                {items.map((item) => {
                    const hasSubItems = item.items && item.items.length > 0;
                    const hasActiveSubItem = isParentActive(item);
                    const isOpen = openItems.includes(item.title);
                    
                    if (hasSubItems) {
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton 
                                    onClick={() => toggleItem(item.title)}
                                    tooltip={{ children: item.title }}
                                    className={cn(
                                        "group relative w-full justify-start rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                        "hover:bg-slate-50 hover:text-slate-900",
                                        hasActiveSubItem 
                                            ? "bg-blue-50 text-blue-700 border border-blue-100" 
                                            : "text-slate-600"
                                    )}
                                >
                                    {item.icon && (
                                        <item.icon className={cn(
                                            "h-5 w-5 transition-colors duration-200",
                                            hasActiveSubItem ? "text-blue-600" : "text-slate-400"
                                        )} />
                                    )}
                                    <span className="truncate flex-1">{item.title}</span>
                                    {isOpen ? (
                                        <ChevronDown className={cn(
                                            "h-4 w-4 transition-colors duration-200",
                                            hasActiveSubItem ? "text-blue-500" : "text-slate-400"
                                        )} />
                                    ) : (
                                        <ChevronRight className={cn(
                                            "h-4 w-4 transition-colors duration-200",
                                            hasActiveSubItem ? "text-blue-500" : "text-slate-400"
                                        )} />
                                    )}
                                </SidebarMenuButton>
                                
                                <Collapsible open={isOpen}>
                                    <CollapsibleContent className="mt-1">
                                        <SidebarMenuSub className="ml-6 space-y-1 border-l border-slate-100 pl-4">
                                            {item.items!.map((subItem) => {
                                                const isActiveSubItem = page.url === subItem.href;
                                                return (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton 
                                                            asChild 
                                                            className={cn(
                                                                "group relative w-full justify-start rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                                                                "before:absolute before:-left-4 before:top-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:rounded-full before:transition-all before:duration-200",
                                                                isActiveSubItem ? [
                                                                    "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20",
                                                                    "before:bg-white before:scale-125",
                                                                    "font-medium"
                                                                ] : [
                                                                    "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
                                                                    "before:bg-slate-200 before:scale-75 hover:before:bg-blue-400 hover:before:scale-100"
                                                                ]
                                                            )}
                                                        >
                                                            <Link href={subItem.href} prefetch className="flex items-center w-full">
                                                                <span className="truncate">
                                                                    {subItem.title}
                                                                </span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Collapsible>
                            </SidebarMenuItem>
                        );
                    }
                    
                    const isActiveItem = page.url === item.href;
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton 
                                asChild 
                                tooltip={{ children: item.title }}
                                className={cn(
                                    "group relative w-full justify-start rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                    "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-0 before:bg-blue-600 before:rounded-r-full before:transition-all before:duration-200",
                                    isActiveItem ? [
                                        "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20",
                                        "before:h-8 before:bg-white/30",
                                        "hover:from-blue-700 hover:to-blue-600"
                                    ] : [
                                        "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                                        "hover:before:h-6 hover:before:bg-blue-600"
                                    ]
                                )}
                            >
                                <Link href={item.href} prefetch className="flex items-center gap-3 w-full">
                                    {item.icon && (
                                        <item.icon className={cn(
                                            "h-5 w-5 transition-colors duration-200",
                                            isActiveItem ? "text-white" : "text-slate-400"
                                        )} />
                                    )}
                                    <span className="truncate">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
