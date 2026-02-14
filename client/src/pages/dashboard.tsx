import { useState } from "react";
import { useUser } from "@/hooks/use-auth";
import { useTeams, useCreateTeam, useJoinTeam } from "@/hooks/use-teams";
import { Navbar } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Shield, UserPlus, LogIn, Crown, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user, isLoading } = useUser();
  const { data: teams } = useTeams();
  const createTeam = useCreateTeam();
  const joinTeam = useJoinTeam();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  if (!user) return null; // Protected route handles redirect in hook usually, or App router

  const myTeam = teams?.find(t => t.id === user.teamId);

  const handleCreate = async () => {
    try {
      await createTeam.mutateAsync({ name: teamName, type: "open" });
      setCreateOpen(false);
      setTeamName("");
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleJoin = async (teamId: number, code?: string) => {
    try {
      await joinTeam.mutateAsync({ teamId, inviteCode: code });
      setJoinOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "تم نسخ كود الدعوة" });
  };

  return (
    <div className="min-h-screen bg-muted/20 font-tajawal" dir="rtl">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* User Profile Card */}
          <Card className="flex-1 border-none shadow-md">
            <CardHeader className="flex flex-row items-center gap-4 bg-secondary text-secondary-foreground rounded-t-xl">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-2xl">{user.username}</CardTitle>
                <CardDescription className="text-gray-300">
                  {user.role === 'admin' ? 'مدير النظام' : 'عضو'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <div className="text-sm text-muted-foreground">الفريق</div>
                  <div className="font-bold text-lg">{myTeam?.name || "لا يوجد"}</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <div className="text-sm text-muted-foreground">الرتبة</div>
                  <div className="font-bold text-lg">{user.teamRole === 'founder' ? 'قائد' : 'عضو'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Status Card */}
          <Card className="flex-[2] border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>حالة الفريق</span>
                {myTeam && (
                  <div className="flex items-center gap-2 text-sm font-normal bg-primary/10 text-primary px-3 py-1 rounded-full">
                    <Crown className="w-4 h-4" />
                    {myTeam.points} نقطة
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myTeam ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">كود الدعوة</div>
                      <div className="font-mono font-bold text-lg tracking-wider">
                        {myTeam.inviteCode || "OPEN-TEAM"}
                      </div>
                    </div>
                    {myTeam.inviteCode && (
                      <Button variant="ghost" size="icon" onClick={() => copyCode(myTeam.inviteCode!)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Quick Stats or Actions for team members could go here */}
                  <div className="text-sm text-muted-foreground text-center">
                    أنت عضو في فريق <strong>{myTeam.name}</strong>. استعد للمنافسة!
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <p className="text-muted-foreground text-center max-w-md">
                    أنت لست منضماً لأي فريق حالياً. لكي تشارك في المنافسات، يجب عليك الانضمام لفريق أو إنشاء واحد جديد.
                  </p>
                  <div className="flex gap-4">
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <Shield className="ml-2 w-4 h-4" />
                          إنشاء فريق
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>إنشاء فريق جديد</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>اسم الفريق</Label>
                            <Input 
                              placeholder="أدخل اسم الفريق..." 
                              value={teamName}
                              onChange={(e) => setTeamName(e.target.value)}
                            />
                          </div>
                          <Button 
                            className="w-full" 
                            onClick={handleCreate}
                            disabled={!teamName || createTeam.isPending}
                          >
                            {createTeam.isPending ? "جاري الإنشاء..." : "إنشاء"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <LogIn className="ml-2 w-4 h-4" />
                          الانضمام لفريق
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>الانضمام لفريق</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>كود الدعوة (اختياري للفرق المفتوحة)</Label>
                            <Input 
                              placeholder="أدخل كود الدعوة..." 
                              value={inviteCode}
                              onChange={(e) => setInviteCode(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>الفرق المتاحة</Label>
                            <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-md p-2">
                              {teams?.filter(t => t.type === 'open').map(team => (
                                <div key={team.id} className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer border-b last:border-0">
                                  <span>{team.name}</span>
                                  <Button 
                                    size="sm" 
                                    variant="secondary"
                                    onClick={() => handleJoin(team.id, inviteCode)}
                                  >
                                    انضمام
                                  </Button>
                                </div>
                              ))}
                              {teams?.filter(t => t.type === 'open').length === 0 && (
                                <p className="text-center text-sm text-muted-foreground py-4">لا توجد فرق مفتوحة</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
