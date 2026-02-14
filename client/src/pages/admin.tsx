import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-auth";
import { 
  useCategories, useCreateCategory, useDeleteCategory,
  useQuestions, useCreateQuestion, useDeleteQuestion,
  useTeams, useUpdateTeam, useDeleteTeam,
  useSettings, useUpdateSettings
} from "@/hooks/use-game";
import { Navbar } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Play, Square, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  if (isLoading) return null;
  
  if (!user || user.role !== 'admin') {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/10 font-tajawal" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>
        
        <Tabs defaultValue="timer" className="space-y-6">
          <TabsList className="w-full justify-start p-1 bg-card border rounded-lg overflow-x-auto">
            <TabsTrigger value="timer">التحكم بالمنافسة</TabsTrigger>
            <TabsTrigger value="questions">الأسئلة والتصنيفات</TabsTrigger>
            <TabsTrigger value="teams">إدارة الفرق</TabsTrigger>
          </TabsList>

          <TabsContent value="timer">
            <TimerControlPanel />
          </TabsContent>

          <TabsContent value="questions">
            <QuestionsManager />
          </TabsContent>

          <TabsContent value="teams">
            <TeamsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TimerControlPanel() {
  const { data: settings } = useSettings();
  const { data: teams } = useTeams();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  const handleUpdate = (updates: any) => {
    updateSettings.mutate(updates, {
      onSuccess: () => toast({ title: "تم تحديث الإعدادات" })
    });
  };

  if (!settings) return <div>Loading...</div>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>التحكم بالوقت</CardTitle>
          <CardDescription>إدارة عداد الوقت للمنافسة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button 
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              onClick={() => handleUpdate({ command: 'start' })}
              disabled={settings.timerActive}
            >
              <Play className="w-4 h-4 ml-2" />
              ابدأ
            </Button>
            <Button 
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              onClick={() => handleUpdate({ command: 'stop' })}
              disabled={!settings.timerActive}
            >
              <Square className="w-4 h-4 ml-2 fill-current" />
              إيقاف
            </Button>
            <Button 
              className="flex-1"
              variant="outline"
              onClick={() => handleUpdate({ command: 'reset' })}
            >
              <RotateCcw className="w-4 h-4 ml-2" />
              إعادة
            </Button>
          </div>

          <div className="space-y-2">
            <Label>مدة المؤقت (ثواني)</Label>
            <Input 
              type="number" 
              defaultValue={settings.timerDuration || 120}
              onBlur={(e) => handleUpdate({ timerDuration: parseInt(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>أطراف المواجهة</CardTitle>
          <CardDescription>اختر الفريقين المتنافسين حالياً</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>الفريق الأول</Label>
            <Select 
              value={settings.currentRoundTeam1Id?.toString() || ""} 
              onValueChange={(val) => handleUpdate({ currentRoundTeam1Id: parseInt(val) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الفريق الأول" />
              </SelectTrigger>
              <SelectContent>
                {teams?.map(t => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>الفريق الثاني</Label>
            <Select 
              value={settings.currentRoundTeam2Id?.toString() || ""} 
              onValueChange={(val) => handleUpdate({ currentRoundTeam2Id: parseInt(val) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الفريق الثاني" />
              </SelectTrigger>
              <SelectContent>
                {teams?.map(t => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuestionsManager() {
  const { data: categories } = useCategories();
  const { data: questions } = useQuestions();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const createQuestion = useCreateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [newCatName, setNewCatName] = useState("");
  const [newQContent, setNewQContent] = useState("");
  const [newQPoints, setNewQPoints] = useState(10);
  const [newQCatId, setNewQCatId] = useState("");

  return (
    <div className="space-y-8">
      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>التصنيفات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input 
              placeholder="اسم التصنيف الجديد..." 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
            />
            <Button onClick={() => {
              createCategory.mutate({ name: newCatName });
              setNewCatName("");
            }}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories?.map(cat => (
              <div key={cat.id} className="bg-muted px-3 py-1 rounded-full flex items-center gap-2">
                {cat.name}
                <button onClick={() => deleteCategory.mutate(cat.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>الأسئلة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 mb-6 p-4 border rounded-lg bg-muted/20">
            <div className="grid md:grid-cols-2 gap-4">
              <Input 
                placeholder="نص السؤال..." 
                value={newQContent}
                onChange={(e) => setNewQContent(e.target.value)}
              />
              <Select value={newQCatId} onValueChange={setNewQCatId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32">
                <Input 
                  type="number" 
                  placeholder="النقاط" 
                  value={newQPoints}
                  onChange={(e) => setNewQPoints(parseInt(e.target.value))}
                />
              </div>
              <Button 
                className="flex-1"
                onClick={() => {
                  if (newQCatId && newQContent) {
                    createQuestion.mutate({
                      content: newQContent,
                      categoryId: parseInt(newQCatId),
                      points: newQPoints
                    });
                    setNewQContent("");
                  }
                }}
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة سؤال
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">السؤال</TableHead>
                  <TableHead className="text-right">التصنيف</TableHead>
                  <TableHead className="text-right">النقاط</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions?.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.content}</TableCell>
                    <TableCell>{categories?.find(c => c.id === q.categoryId)?.name}</TableCell>
                    <TableCell>{q.points}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => deleteQuestion.mutate(q.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TeamsManager() {
  const { data: teams } = useTeams();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();

  return (
    <Card>
      <CardHeader>
        <CardTitle>الفرق المسجلة</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">النقاط</TableHead>
              <TableHead className="text-right">عدد الأعضاء</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams?.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-bold">{team.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      className="w-20 h-8" 
                      defaultValue={team.points}
                      onBlur={(e) => updateTeam.mutate({ id: team.id, points: parseInt(e.target.value) })}
                    />
                  </div>
                </TableCell>
                <TableCell>{team.memberCount}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>تأكيد الحذف</DialogTitle>
                      </DialogHeader>
                      <p>هل أنت متأكد من حذف فريق {team.name}؟ هذا الإجراء لا يمكن التراجع عنه.</p>
                      <Button variant="destructive" onClick={() => deleteTeam.mutate(team.id)}>
                        حذف نهائي
                      </Button>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
