
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

  const DayContent = () => (
    <button className={cn("day-cell", day.isToday && "today-cell")}>
      <div className="day-number">{day.date}</div>
      {calendarType === "numerology" ? (
        <div className="numerology-value">
          <span className={cn(
            "master-number",
            [11, 22, 33].includes(day.primaryNumber) && "text-accent font-semibold"
          )}>
            {day.primaryNumber}
          </span>
        </div>
      ) : (
        <span className="text-muted-foreground text-xs">
          {day.zodiacSign?.substring(0, 3)}
        </span>
      )}
    </button>
  );

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <DayContent />
        </DrawerTrigger>
        <DrawerContent>
          <div className="px-4 pb-6 pt-2">
            <DayDetail day={day} calendarType={calendarType} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DayContent />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Day Details</DialogTitle>
        </DialogHeader>
        <DayDetail day={day} calendarType={calendarType} />
      </DialogContent>
    </Dialog>
  );
};
