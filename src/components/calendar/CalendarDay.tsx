
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { DayDetail } from "./DayDetail";

interface DayData {
  date: number;
  primaryNumber: number;
  secondaryNumber?: number;
  personalNumber?: number;
  isToday: boolean;
  zodiacSign?: string;
  chineseSign?: string;
  planetaryInfluence?: string;
}

interface CalendarDayProps {
  day: DayData;
  isMobile: boolean;
  calendarType: "numerology" | "astrology";
}

export const CalendarDay = ({ day, isMobile, calendarType }: CalendarDayProps) => {
  if (day.date === 0) {
    return <div className="day-cell empty" />;
  }

  const getNumberColor = (num: number) => {
    const colors: Record<number, string> = {
      1: "bg-red-500/20 text-red-700 dark:text-red-300",
      2: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
      3: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
      4: "bg-green-500/20 text-green-700 dark:text-green-300",
      5: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
      6: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
      7: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
      8: "bg-pink-500/20 text-pink-700 dark:text-pink-300",
      9: "bg-rose-500/20 text-rose-700 dark:text-rose-300",
      11: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 ring-2 ring-cyan-500/50",
      22: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/50",
      33: "bg-amber-500/20 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/50"
    };
    return colors[num] || colors[1];
  };

  const getZodiacColor = (sign?: string) => {
    const colors: Record<string, string> = {
      "Aries": "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
      "Taurus": "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30",
      "Gemini": "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
      "Cancer": "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
      "Leo": "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
      "Virgo": "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      "Libra": "bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30",
      "Scorpio": "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30",
      "Sagittarius": "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
      "Capricorn": "bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30",
      "Aquarius": "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
      "Pisces": "bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30"
    };
    return sign ? colors[sign] || "bg-muted/20" : "bg-muted/20";
  };

  const getZodiacSymbol = (sign?: string) => {
    const symbols: Record<string, string> = {
      "Aries": "♈",
      "Taurus": "♉",
      "Gemini": "♊",
      "Cancer": "♋",
      "Leo": "♌",
      "Virgo": "♍",
      "Libra": "♎",
      "Scorpio": "♏",
      "Sagittarius": "♐",
      "Capricorn": "♑",
      "Aquarius": "♒",
      "Pisces": "♓"
    };
    return sign ? symbols[sign] || "✦" : "✦";
  };

  const renderDayContent = () => (
    <div 
      className={cn(
        "day-cell group hover:bg-muted/50 transition-colors duration-200",
        day.isToday && "today-cell",
        "flex flex-col items-start justify-start p-2 md:p-3",
        "w-full h-full cursor-pointer"
      )}
    >
      <div className={cn(
        "day-number font-medium",
        day.isToday && "text-primary"
      )}>
        {day.date}
      </div>
      
      {isMobile ? (
        <div className="mt-auto w-full">
          {/* Mobile view - Show simple but consistent info */}
          {calendarType === "numerology" ? (
            <div className="flex items-center justify-center mt-1">
              {day.primaryNumber && (
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  getNumberColor(day.primaryNumber)
                )}>
                  {day.primaryNumber}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center mt-1">
              <span className={cn(
                "text-lg font-bold px-2 py-0.5 rounded-full border",
                getZodiacColor(day.zodiacSign)
              )} title={day.zodiacSign}>
                {getZodiacSymbol(day.zodiacSign)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="day-content">
          {calendarType === "numerology" ? (
            <div className="desktop-details space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Daily Number:</span>
                <span className={cn(
                  "font-bold px-2 py-1 rounded-full text-sm",
                  getNumberColor(day.primaryNumber)
                )}>
                  {day.primaryNumber}
                </span>
              </div>
              {day.secondaryNumber && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Reduced:</span>
                  <span className="font-medium">{day.secondaryNumber}</span>
                </div>
              )}
              {day.personalNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">Personal:</span>
                  <span className={cn(
                    "font-bold px-2 py-1 rounded-full text-sm",
                    getNumberColor(day.personalNumber)
                  )}>
                    {day.personalNumber}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="desktop-details space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Zodiac:</span>
                <span className={cn(
                  "font-bold px-2 py-1 rounded-full text-sm border flex items-center gap-1",
                  getZodiacColor(day.zodiacSign)
                )}>
                  <span className="text-base">{getZodiacSymbol(day.zodiacSign)}</span>
                  <span className="text-xs">{day.zodiacSign}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Chinese:</span>
                <span className="font-medium">{day.chineseSign}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Planet:</span>
                <span className="text-primary/90 font-medium">{day.planetaryInfluence}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          {renderDayContent()}
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Day Details</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 pt-2 overflow-y-auto max-h-[calc(90vh-80px)]">
            <DayDetail day={day} calendarType={calendarType} onClose={close => {
              const closeButton = document.querySelector('[data-vaul-drawer-close]');
              if (closeButton) {
                (closeButton as HTMLElement).click();
              }
            }} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {renderDayContent()}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full lg:max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Day Details</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-2">
          <DayDetail day={day} calendarType={calendarType} onClose={close => {
            const closeButton = document.querySelector('[data-radix-collection-item]');
            if (closeButton) {
              (closeButton as HTMLElement).click();
            }
          }} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
