import { Link } from "wouter";
import { useUser } from "@/hooks/use-auth";
import { useTeams } from "@/hooks/use-teams";
import { Navbar, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Users, Star, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { user } = useUser();
  const { data: teams } = useTeams();

  // Sort teams by points
  const sortedTeams = teams?.sort((a, b) => b.points - a.points).slice(0, 5) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background font-tajawal" dir="rtl">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32 bg-secondary text-secondary-foreground">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b')] bg-cover bg-center opacity-10" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-6xl font-black mb-6 text-primary leading-tight font-cairo">
                أطلق العنان لقدراتك <br />
                <span className="text-white">في منافسات Singate</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light">
                منصة المسابقات التفاعلية الأولى. انضم، نافس، وارتقِ بفريقك نحو القمة.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!user ? (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="text-lg px-8 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
                        ابدأ رحلتك الآن
                        <ArrowLeft className="mr-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button size="lg" variant="outline" className="text-lg px-8 border-primary text-primary hover:bg-primary/10 w-full sm:w-auto">
                        تسجيل الدخول
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/dashboard">
                    <Button size="lg" className="text-lg px-8 bg-primary text-primary-foreground hover:bg-primary/90">
                      الذهاب للوحة التحكم
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Users, title: "كوّن فريقك", desc: "أنشئ فريقك الخاص وادعُ أصدقاءك للمشاركة" },
                { icon: Target, title: "نافس بقوة", desc: "أجب عن الأسئلة واجمع النقاط في الوقت المحدد" },
                { icon: Trophy, title: "تصدر القائمة", desc: "ارتقِ في سلم الترتيب واحصل على الجوائز" }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-2xl bg-card border shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Top Teams Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">أفضل الفرق</h2>
              <p className="text-muted-foreground">الفرق المتصدرة للمنافسة حالياً</p>
            </div>

            <div className="grid gap-4 max-w-2xl mx-auto">
              {sortedTeams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-card rounded-xl shadow-sm border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold">{team.name}</h4>
                      <p className="text-xs text-muted-foreground">{team.memberCount} عضو</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Star className="w-4 h-4 fill-primary" />
                    {team.points} نقطة
                  </div>
                </motion.div>
              ))}
              
              {sortedTeams.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  لا توجد فرق حالياً. كن الأول!
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
