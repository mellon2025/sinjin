import { useSettings, useQuestions, useCategories } from "@/hooks/use-game";
import { useTeams } from "@/hooks/use-teams";
import { Navbar, Footer } from "@/components/layout";
import { TimerDisplay } from "@/components/timer-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function Competition() {
  const { data: settings } = useSettings();
  const { data: categories } = useCategories();
  const { data: teams } = useTeams();
  
  // This would ideally be dynamic based on selected category, for now fetch all
  const { data: questions } = useQuestions();

  const team1 = teams?.find(t => t.id === settings?.currentRoundTeam1Id);
  const team2 = teams?.find(t => t.id === settings?.currentRoundTeam2Id);

  return (
    <div className="min-h-screen bg-background font-tajawal flex flex-col" dir="rtl">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        
        {/* Arena Header: Timer & Versus */}
        <section className="mb-12">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            
            {/* Team 1 */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="hidden lg:flex flex-col items-center p-6 bg-card rounded-xl shadow-lg border-2 border-transparent hover:border-primary/20 transition-all"
            >
              {team1 ? (
                <>
                  <div className="w-24 h-24 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-4xl font-bold mb-4">
                    {team1.name.charAt(0)}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{team1.name}</h2>
                  <div className="text-3xl font-black text-primary">{team1.points}</div>
                  <div className="text-sm text-muted-foreground">نقطة</div>
                </>
              ) : (
                <div className="text-muted-foreground">في انتظار الفريق...</div>
              )}
            </motion.div>

            {/* Center Stage: Timer */}
            <div className="flex flex-col items-center gap-8">
              <TimerDisplay />
              
              {/* Mobile Versus View */}
              <div className="flex lg:hidden items-center justify-between w-full max-w-sm px-4">
                <div className="text-center">
                  <div className="font-bold">{team1?.name || "???"}</div>
                  <div className="text-primary font-bold">{team1?.points || 0}</div>
                </div>
                <div className="font-black text-2xl text-muted-foreground">VS</div>
                <div className="text-center">
                  <div className="font-bold">{team2?.name || "???"}</div>
                  <div className="text-primary font-bold">{team2?.points || 0}</div>
                </div>
              </div>
            </div>

            {/* Team 2 */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="hidden lg:flex flex-col items-center p-6 bg-card rounded-xl shadow-lg border-2 border-transparent hover:border-primary/20 transition-all"
            >
              {team2 ? (
                <>
                  <div className="w-24 h-24 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-4xl font-bold mb-4">
                    {team2.name.charAt(0)}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{team2.name}</h2>
                  <div className="text-3xl font-black text-primary">{team2.points}</div>
                  <div className="text-sm text-muted-foreground">نقطة</div>
                </>
              ) : (
                <div className="text-muted-foreground">في انتظار الفريق...</div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Questions Board */}
        <section className="bg-card rounded-2xl shadow-xl border overflow-hidden">
          <div className="p-6 bg-secondary text-secondary-foreground">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-8 bg-primary rounded-full" />
              لوحة الأسئلة
            </h3>
          </div>
          
          <div className="p-6">
            <Tabs defaultValue={categories?.[0]?.id.toString()} className="w-full">
              <TabsList className="w-full flex-wrap justify-start h-auto p-2 bg-muted/50 mb-6">
                {categories?.map((cat) => (
                  <TabsTrigger 
                    key={cat.id} 
                    value={cat.id.toString()}
                    className="flex-1 min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg"
                  >
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {categories?.map((cat) => (
                <TabsContent key={cat.id} value={cat.id.toString()} className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {questions?.filter(q => q.categoryId === cat.id).map((q) => (
                      <Card key={q.id} className="hover:border-primary cursor-pointer transition-all hover:shadow-md group">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                              {q.points} نقطة
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="font-medium text-lg leading-relaxed group-hover:text-primary transition-colors">
                            {q.content}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                    {questions?.filter(q => q.categoryId === cat.id).length === 0 && (
                      <div className="col-span-full text-center py-12 text-muted-foreground">
                        لا توجد أسئلة في هذا التصنيف حالياً
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
