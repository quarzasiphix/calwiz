
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
        "flex flex-col items-start justify-start p-2 md:p-3",
        "w-full h-full cursor-pointer"
      )}
    >
      <div className={cn(
        "day-number font-medium text-sm md:text-base ml-1",
        day.isToday && "text-primary"
      )}>
        {day.date}
      </div>
      
      <div className="mt-auto w-full">
        {calendarType === "numerology" ? (
          <div className="flex flex-col space-y-1.5 p-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Daily:</span>
              <span className={cn(
                "text-sm font-medium",
                [11, 22, 33].includes(day.primaryNumber) && "text-primary font-semibold"
              )}>
                {day.primaryNumber}
              </span>
            </div>
            
            {!isMobile && (
              <>
                {day.secondaryNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Reduced:</span>
                    <span className="text-sm">{day.secondaryNumber}</span>
                  </div>
                )}
                
                {day.personalNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Personal:</span>
                    <span className="text-sm text-primary/90">{day.personalNumber}</span>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col space-y-1.5 p-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Sign:</span>
              <span className="text-sm font-medium">{day.zodiacSign}</span>
            </div>
            
            {!isMobile && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Chinese:</span>
                  <span className="text-sm">{day.chineseSign}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Planet:</span>
                  <span className="text-sm text-primary/90">{day.planetaryInfluence}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
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
