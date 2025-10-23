import { Link, useLocation } from "wouter";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useMode } from "@/contexts/ModeContext";

interface BreadcrumbRoute {
  label: string;
  href?: string;
}

export default function NavigationBreadcrumbs() {
  const [location] = useLocation();
  const { currentMode } = useMode();

  const getPageTitle = (path: string): string => {
    const routes: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/watchlist": "Watchlist",
      "/portfolio": "Portfolio",
      "/trades": "Trades",
      "/analytics": "Analytics",
      "/settings": "Settings",
      "/amanda": "Amanda Mode",
      "/hybrid": "Hybrid Mode",
      "/terminal": "Terminal Mode",
      "/tutorials": "Tutorials",
      "/faq": "FAQ",
      "/help": "Help Center",
      "/select-mode": "Mode Selection",
    };
    return routes[path] || "Page";
  };

  const getBreadcrumbs = (): BreadcrumbRoute[] => {
    const breadcrumbs: BreadcrumbRoute[] = [];

    // Always start with Dashboard or Mode as root
    if (["/amanda", "/hybrid", "/terminal"].includes(location)) {
      breadcrumbs.push({ label: getPageTitle(location) });
    } else {
      // Add Dashboard as home
      breadcrumbs.push({ label: "Dashboard", href: "/dashboard" });

      // Add current page if not dashboard
      if (location !== "/dashboard") {
        // Check if it's a help-related page
        if (["/tutorials", "/faq"].includes(location)) {
          breadcrumbs.push({ label: "Help Center", href: "/help" });
        }
        
        breadcrumbs.push({ label: getPageTitle(location) });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Don't show breadcrumbs on auth or select-mode pages
  if (location === "/" || location === "/select-mode") {
    return null;
  }

  return (
    <div className="border-b border-white/5 bg-black/50 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16">
        <Breadcrumb className="py-2">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              
              return (
                <div key={index} className="flex items-center gap-1.5">
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="text-primary font-light">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild className="hover:text-primary transition-colors font-light">
                        <Link href={crumb.href!} data-testid={`breadcrumb-${crumb.label.toLowerCase().replace(' ', '-')}`}>
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}