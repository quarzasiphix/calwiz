
import { useState } from "react";
import { Menu } from "lucide-react";
import { NumerologyCalculator } from "@/components/NumerologyCalculator";
import { Calendar } from "@/components/Calendar";
import { TodayHighlight } from "@/components/TodayHighlight";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [lifePathNumber, setLifePathNumber] = useState<number | null>(null);
  const [activeCalendarType, setActiveCalendarType] = useState<"numerology" | "astrology">("numerology");

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-10 px-4 py-3 bg-background/90 backdrop-blur border-b border-border flex items-center justify-between gap-4">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <nav className="flex flex-col gap-4 mt-8">
                <h2 className="text-lg font-bold mb-4">Calendar Views</h2>
                <Button 
                  variant={activeCalendarType === "numerology" ? "default" : "ghost"} 
                  className="justify-start" 
                  onClick={() => setActiveCalendarType("numerology")}
                >
                  Numerology Calendar
                </Button>
                <Button 
                  variant={activeCalendarType === "astrology" ? "default" : "ghost"} 
                  className="justify-start" 
                  onClick={() => setActiveCalendarType("astrology")}
                >
                  Astrology Calendar
                </Button>
                <div className="border-t my-4"></div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Quick Calculate</h3>
                  <NumerologyCalculator onCalculate={setLifePathNumber} compact={true} />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex flex-col items-center flex-1 gap-1 text-center">
          <h1 className="text-lg md:text-2xl font-display font-medium">
            {activeCalendarType === "numerology" ? "Numerology" : "Astrology"} Calendar
          </h1>
          <Button 
            variant="outline" 
            size="sm" 
            className="md:hidden"
            onClick={() => setActiveCalendarType(prev => prev === "numerology" ? "astrology" : "numerology")}
          >
            {activeCalendarType === "numerology" ? "Switch to Astrology" : "Switch to Numerology"}
          </Button>
        </div>
        <div className="hidden md:flex gap-4">
          <Button 
            variant={activeCalendarType === "numerology" ? "default" : "outline"} 
            onClick={() => setActiveCalendarType("numerology")}
          >
            Numerology
          </Button>
          <Button 
            variant={activeCalendarType === "astrology" ? "default" : "outline"} 
            onClick={() => setActiveCalendarType("astrology")}
          >
            Astrology
          </Button>
        </div>
      </header>

      <div className="pt-16 px-2 md:px-8 max-w-7xl mx-auto">
        <div className="py-8 space-y-8">
          <div className="md:hidden">
            <NumerologyCalculator onCalculate={setLifePathNumber} />
          </div>
          <div className="hidden md:block">
            <NumerologyCalculator onCalculate={setLifePathNumber} />
          </div>
          
          {/* Today's Highlight - Above Calendar */}
          <TodayHighlight 
            calendarType={activeCalendarType}
            lifePathNumber={lifePathNumber}
          />
          
          <Calendar 
            lifePathNumber={lifePathNumber} 
            calendarType={activeCalendarType}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
