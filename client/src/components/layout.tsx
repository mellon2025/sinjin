import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  Menu, 
  Trophy, 
  Users, 
  Home, 
  LayoutDashboard,
  Shield,
  Settings
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const { user } = useUser();
  const { mutate: logout } = useLogout();
  const [location] = useLocation();

  const isAdmin = user?.role === 'admin';

  const links = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/competition", label: "ساحة المنافسة", icon: Trophy },
    ...(user ? [{ href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "الإدارة", icon: Shield }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse group">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="font-bold text-xl hidden md:block group-hover:text-primary transition-colors">
            Singate
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
              >
                <Icon className="w-4 h-4 ml-2" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {user ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => logout()}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4 ml-2" />
              <span className="hidden sm:inline">تسجيل خروج</span>
            </Button>
          ) : (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Link href="/login">
                <Button variant="ghost" size="sm">دخول</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  حساب جديد
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  {links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link 
                        key={link.href} 
                        href={link.href}
                        className="flex items-center px-4 py-3 rounded-lg hover:bg-accent transition-colors text-lg"
                      >
                        <Icon className="w-5 h-5 ml-3" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
        <p>© 2024 Singate. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}
