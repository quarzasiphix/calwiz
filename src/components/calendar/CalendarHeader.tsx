
import React from "react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  currentDate: Date;
  monthNames: string[];
  calendarType: "numerology" | "astrology";
  zodiacSigns: string[];
  monthNumerology?: number;
  personalMonthNumerology?: number | null;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export const CalendarHeader = ({
  currentDate,
  monthNames,
  calendarType,
  zodiacSigns,
  monthNumerology,
  personalMonthNumerology,
  onPreviousMonth,
  onNextMonth,
}: CalendarHeaderProps) => {
  return (
    <CardHeader className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" size="icon" onClick={onPreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <CardTitle className="text-lg md:text-2xl font-display">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </CardTitle>
        <Button variant="outline" size="icon" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 text-sm">
        {calendarType === "numerology" ? (
          <>
            <div className="px-2 py-1 bg-primary/10 rounded-md">
              Month: <span className="font-semibold">{monthNumerology}</span>
            </div>
            {personalMonthNumerology && (
              <div className="px-2 py-1 bg-accent/10 rounded-md">
                Personal: <span className="font-semibold">{personalMonthNumerology}</span>
              </div>
            )}
          </>
        ) : (
          <div className="px-2 py-1 bg-primary/10 rounded-md">
            <span className="font-semibold">{zodiacSigns[currentDate.getMonth() % 12]}</span> Season
          </div>
        )}
      </div>
    </CardHeader>
  );
};
