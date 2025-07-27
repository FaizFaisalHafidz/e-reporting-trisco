export default function AppLogo() {
    return (
        <>
            <img 
                src="https://neoflash.sgp1.cdn.digitaloceanspaces.com/logo-trisco.png" 
                alt="TRISCO Logo" 
                className="size-12 object-contain"
            />
            <div className="ml-3 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-blue-900">TRISCO</span>
                <span className="truncate text-xs text-muted-foreground font-medium">E-Reporting System</span>
            </div>
        </>
    );
}
