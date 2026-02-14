import { useEffect, useState } from "react";
import { useSettings } from "@/hooks/use-game";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

export function TimerDisplay() {
  const { data: settings } = useSettings();
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!settings) return;

    if (settings.timerActive && settings.timerStartTime) {
      const start = new Date(settings.timerStartTime).getTime();
      const duration = (settings.timerDuration || 120) * 1000;
      const now = new Date().getTime();
      const elapsed = now - start;
      const remaining = Math.max(0, duration - elapsed);
      
      setTimeLeft(Math.ceil(remaining / 1000));
      setProgress((remaining / duration) * 100);
    } else {
      setTimeLeft(settings.timerDuration || 120);
      setProgress(100);
    }
  }, [settings, Date.now()]); // Re-render every poll

  if (!settings) return null;

  const isUrgent = timeLeft < 10 && settings.timerActive;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card rounded-2xl shadow-xl border border-border/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className={cn(
          "text-6xl font-black tabular-nums tracking-tighter mb-4 flex items-center gap-4 transition-colors duration-300",
          isUrgent ? "text-destructive animate-pulse" : "text-foreground"
        )}>
          <Clock className={cn("w-12 h-12", isUrgent ? "text-destructive" : "text-primary")} />
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
        
        <Progress 
          value={progress} 
          className={cn("h-4 w-full bg-secondary/10", isUrgent && "[&>div]:bg-destructive")} 
        />
        
        <p className="mt-4 text-muted-foreground font-medium">
          {settings.timerActive ? "الوقت المتبقي" : "بانتظار بدء الجولة"}
        </p>
      </div>
    </div>
  );
}
