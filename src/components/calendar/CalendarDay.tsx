import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
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

  const dayContent = (
    <div 
      className={cn(
        "day-cell group hover:bg-muted/50 transition-colors duration-200",
        day.isToday && "today-cell",
        "flex flex-col items-center justify-center p-2 md:p-3",
        "w-full h-full cursor-pointer gap-1 md:gap-2"
      )}
    >
      <div className={cn(
        "day-number font-medium text-sm md:text-base",
        day.isToday && "text-primary"
      )}>
        {day.date}
      </div>
      
      {calendarType === "numerology" ? (
        <div className="flex flex-col items-center space-y-0.5">
          <div className="numerology-value text-muted-foreground group-hover:text-foreground transition-colors">
            <span className={cn(
              "master-number",
              [11, 22, 33].includes(day.primaryNumber) && "text-accent font-semibold"
            )}>
              {day.primaryNumber}
            </span>
          </div>
          {!isMobile && day.secondaryNumber && (
            <div className="hidden md:block text-xs text-muted-foreground group-hover:text-foreground">
              ({day.secondaryNumber})
            </div>
          )}
          {!isMobile && day.personalNumber && (
            <div className="hidden md:block text-xs text-primary/70 font-medium">
              Personal: {day.personalNumber}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-0.5">
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            {day.zodiacSign?.substring(0, 3)}
          </span>
          {!isMobile && (
            <>
              <span className="hidden md:block text-xs text-muted-foreground/80">
                {day.chineseSign}
              </span>
              <span className="hidden md:block text-xs text-primary/70">
                {day.planetaryInfluence}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          {dayContent}
        </DrawerTrigger>
        <DrawerContent>
          <div className="px-4 pb-6 pt-2">
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
        {dayContent}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Day Details</DialogTitle>
        </DialogHeader>
        <DayDetail day={day} calendarType={calendarType} onClose={close => {
          const closeButton = document.querySelector('[data-radix-collection-item]');
          if (closeButton) {
            (closeButton as HTMLElement).click();
          }
        }} />
      </DialogContent>
    </Dialog>
  );
};
