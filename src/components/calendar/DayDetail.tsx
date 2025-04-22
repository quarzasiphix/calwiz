
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Star, Planet, CalendarDays } from "lucide-react";

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

interface DayDetailProps {
  day: DayData;
  calendarType: "numerology" | "astrology";
  onClose?: () => void;
}

export const DayDetail = ({ day, calendarType, onClose }: DayDetailProps) => {
  const currentDate = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-4 py-2">
      <div className="text-center sm:text-left mb-4">
        <h2 className="text-xl font-semibold flex items-center justify-center sm:justify-start gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          {monthNames[currentDate.getMonth()]} {day.date}, {currentDate.getFullYear()}
          {day.isToday && <span className="ml-2 text-primary">(Today)</span>}
        </h2>
      </div>

      {calendarType === "numerology" ? (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-card/50 backdrop-blur-sm">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Star className="h-5 w-5 mr-2 text-primary" />
              Numerological Influences
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-muted-foreground">Primary Number</div>
                <div className="text-lg font-semibold mt-1">{day.primaryNumber}</div>
              </div>
              
              {day.secondaryNumber && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-muted-foreground">Secondary Number</div>
                  <div className="text-lg font-semibold mt-1">{day.secondaryNumber}</div>
                </div>
              )}
              
              {day.personalNumber && (
                <div className="p-3 bg-muted/50 rounded-lg sm:col-span-2">
                  <div className="text-muted-foreground">Personal Number</div>
                  <div className="text-lg font-semibold mt-1">{day.personalNumber}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-card/50 backdrop-blur-sm">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Planet className="h-5 w-5 mr-2 text-primary" />
              Astrological Influences
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-muted-foreground">Zodiac Sign</div>
                <div className="text-lg font-semibold mt-1">{day.zodiacSign}</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-muted-foreground">Chinese Sign</div>
                <div className="text-lg font-semibold mt-1">{day.chineseSign}</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg sm:col-span-2">
                <div className="text-muted-foreground">Planetary Influence</div>
                <div className="text-lg font-semibold mt-1">{day.planetaryInfluence}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        <Button 
          className="w-full"
          variant="outline"
        >
          <MessageCircle className="mr-2" />
          Ask AI about this day
        </Button>
        
        {onClose && (
          <Button onClick={onClose} variant="secondary" className="w-full">
            Close
          </Button>
        )}
      </div>
    </div>
  );
};
