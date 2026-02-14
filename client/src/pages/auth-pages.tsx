import { useState } from "react";
import { Link } from "wouter";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

export function LoginPage() {
  const login = useLogin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4 font-tajawal" dir="rtl">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">تسجيل الدخول</CardTitle>
          <CardDescription className="text-center">أدخل بياناتك للدخول إلى حسابك</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input 
                id="username" 
                placeholder="اسم المستخدم..." 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="******" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {login.error && (
              <div className="text-destructive text-sm text-center p-2 bg-destructive/10 rounded">
                {login.error.message}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={login.isPending}>
              {login.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              دخول
            </Button>
            <Link href="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ليس لديك حساب؟ سجل الآن
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export function RegisterPage() {
  const register = useRegister();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4 font-tajawal" dir="rtl">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">إنشاء حساب جديد</CardTitle>
          <CardDescription className="text-center">انضم إلى مجتمع Singate</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input 
                id="username" 
                placeholder="اسم المستخدم..." 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="******" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {register.error && (
              <div className="text-destructive text-sm text-center p-2 bg-destructive/10 rounded">
                {register.error.message}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={register.isPending}>
              {register.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              إنشاء حساب
            </Button>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              لديك حساب بالفعل؟ سجل دخولك
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
