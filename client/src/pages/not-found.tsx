import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background font-tajawal" dir="rtl">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="flex justify-center">
          <AlertCircle className="h-24 w-24 text-primary animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold font-cairo">404 - الصفحة غير موجودة</h1>
        <p className="text-muted-foreground text-lg">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link href="/">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            العودة للرئيسية
          </Button>
        </Link>
      </div>
    </div>
  );
}
