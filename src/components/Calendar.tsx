import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface DayData {
  date: number;
  primaryNumber: number;
  secondaryNumber?: number;
  personalNumber?: number;
  isToday: boolean;
  // Added fields
  zodiacSign?: string;
  chineseSign?: string;
  planetaryInfluence?: string;
}

interface CalendarProps {
  lifePathNumber: number | null;
  calendarType?: "numerology" | "astrology";
}

export const Calendar = ({ lifePathNumber, calendarType = "numerology" }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const isMobile = useIsMobile();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const masterNumbers = [11, 22, 33];
  const zodiacSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const chineseSigns = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
  const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

  const calculateDayNumerology = (date: number, month: number, year: number) => {
    const sumDigits = (num: number) => {
      return num.toString().split("").reduce((acc, val) => acc + parseInt(val), 0);
    };

    const daySum = sumDigits(date);
    const monthSum = sumDigits(month + 1);
    const yearSum = sumDigits(year);
    let total = daySum + monthSum + yearSum;

    const primaryNumber = masterNumbers.includes(total) ? total : 
      sumDigits(total);

    const secondaryNumber = total !== primaryNumber ? total : undefined;

    let personalNumber;
    if (lifePathNumber) {
      const personalTotal = (secondaryNumber || primaryNumber) + lifePathNumber;
      personalNumber = masterNumbers.includes(personalTotal) ? personalTotal : 
        sumDigits(personalTotal);
    }

    // Calculate extra astrological data
    const dayOfYear = Math.floor((new Date(year, month, date).getTime() - new Date(year, 0, 0).getTime()) / (24 * 60 * 60 * 1000));
    const zodiacIndex = Math.floor((dayOfYear - 80) / 30) % 12;
    const zodiacSign = zodiacSigns[zodiacIndex >= 0 ? zodiacIndex : zodiacIndex + 12];
    
    const chineseIndex = (year - 1900) % 12;
    const chineseSign = chineseSigns[chineseIndex >= 0 ? chineseIndex : chineseIndex + 12];
    
    const planetIndex = (dayOfYear + date) % planets.length;
    const planetaryInfluence = planets[planetIndex];

    return { 
      primaryNumber, 
      secondaryNumber, 
      personalNumber,
      zodiacSign,
      chineseSign,
      planetaryInfluence
    };
  };

  const generateCalendarDays = (): DayData[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    const days: DayData[] = [];
    
    // Add empty days for padding
    for (let i = 0; i < firstDay; i++) {
      days.push({ date: 0, primaryNumber: 0, isToday: false });
    }
    
    // Add actual days
    for (let date = 1; date <= daysInMonth; date++) {
      const { 
        primaryNumber, 
        secondaryNumber, 
        personalNumber,
        zodiacSign,
        chineseSign,
        planetaryInfluence
      } = calculateDayNumerology(date, month, year);
      
      const isToday = date === today.getDate() && 
                      month === today.getMonth() && 
                      year === today.getFullYear();
      
      days.push({
        date,
        primaryNumber,
        secondaryNumber,
        personalNumber,
        isToday,
        zodiacSign,
        chineseSign,
        planetaryInfluence
      });
    }
    
    return days;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const formatNumberWithMasterNumber = (num: number) => {
    const isMaster = masterNumbers.includes(num);
    return (
      <span className={isMaster ? "master-number" : ""}>
        {num}
      </span>
    );
  };

  const monthNumerology = masterNumbers.includes(currentDate.getMonth() + 1) ? currentDate.getMonth() + 1 : (currentDate.getMonth() + 1).toString().split("").reduce((acc, val) => acc + parseInt(val), 0);

  const personalMonthNumerology = lifePathNumber ? masterNumbers.includes(monthNumerology + lifePathNumber) ? monthNumerology + lifePathNumber : (monthNumerology + lifePathNumber).toString().split("").reduce((acc, val) => acc + parseInt(val), 0) : null;

  // Day detail component - will be used in both Dialog and Drawer
  const DayDetail = ({ 
    day, 
    onClose 
  }: { 
    day: DayData, 
    onClose?: () => void 
  }) => (
    <div className="space-y-4 py-2">
      <div className="text-center sm:text-left mb-4">
        <h2 className="text-xl font-semibold">
          {monthNames[currentDate.getMonth()]} {day.date}, {currentDate.getFullYear()}
          {day.isToday && <span className="ml-2 text-primary">(Today)</span>}
        </h2>
      </div>

      {calendarType === "numerology" ? (
        <div className="space-y-4">
          <div className="p-3 rounded-lg border bg-card">
            <h3 className="text-lg font-medium mb-1 flex items-center">
              Numerology
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-muted/50 rounded">
                <div className="text-muted-foreground">Primary Number</div>
                <div className="text-base font-semibold mt-1">
                  {masterNumbers.includes(day.primaryNumber) ? 
                    <span className="text-accent">{day.primaryNumber}</span> : day.primaryNumber}
                </div>
              </div>
              
              {day.secondaryNumber && (
                <div className="p-2 bg-muted/50 rounded">
                  <div className="text-muted-foreground">Secondary Number</div>
                  <div className="text-base font-semibold mt-1">
                    {masterNumbers.includes(day.secondaryNumber) ? 
                      <span className="text-accent">{day.secondaryNumber}</span> : day.secondaryNumber}
                  </div>
                </div>
              )}
              
              {day.personalNumber && (
                <div className="p-2 bg-muted/50 rounded sm:col-span-2">
                  <div className="text-muted-foreground">Personal Number</div>
                  <div className="text-base font-semibold mt-1">
                    {masterNumbers.includes(day.personalNumber) ? 
                      <span className="text-accent">{day.personalNumber}</span> : day.personalNumber}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 rounded-lg border bg-card">
            <h3 className="text-lg font-medium mb-1 flex items-center">
              <Star className="h-5 w-5 mr-1 text-primary" />
              Astrological Influences
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-muted/50 rounded">
                <div className="text-muted-foreground">Zodiac Sign</div>
                <div className="text-base font-semibold mt-1">{day.zodiacSign}</div>
              </div>
              <div className="p-2 bg-muted/50 rounded">
                <div className="text-muted-foreground">Chinese Sign</div>
                <div className="text-base font-semibold mt-1">{day.chineseSign}</div>
              </div>
              <div className="p-2 bg-muted/50 rounded sm:col-span-2">
                <div className="text-muted-foreground">Planetary Influence</div>
                <div className="text-base font-semibold mt-1">{day.planetaryInfluence}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {onClose && (
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      )}
    </div>
  );

  return (
    <Card className="w-full shadow-lg overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg md:text-2xl font-display">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          {calendarType === "numerology" && (
            <>
              <div className="px-2 py-1 bg-primary/10 rounded-md">
                Month: <span className="font-semibold">{monthNumerology}</span>
              </div>
              {lifePathNumber && (
                <div className="px-2 py-1 bg-accent/10 rounded-md">
                  Personal: <span className="font-semibold">{personalMonthNumerology}</span>
                </div>
              )}
            </>
          )}
          {calendarType === "astrology" && (
            <div className="px-2 py-1 bg-primary/10 rounded-md">
              <span className="font-semibold">{zodiacSigns[currentDate.getMonth() % 12]}</span> Season
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-1 sm:p-6">
        <div className="calendar-header">
          {dayNames.map((day) => (
            <div key={day} className="calendar-header-cell">
              {day}
            </div>
          ))}
        </div>
        
        <div className="calendar-grid">
          {generateCalendarDays().map((day, index) => (
            day.date === 0 ? (
              <div key={index} className="day-cell empty" />
            ) : isMobile ? (
              <Drawer key={index}>
                <DrawerTrigger asChild>
                  <button className={cn(
                    "day-cell",
                    day.isToday && "today-cell"
                  )}>
                    <div className="day-number">{day.date}</div>
                    <div className="numerology-value">
                      {calendarType === "numerology" ? (
                        <span className={cn(
                          masterNumbers.includes(day.primaryNumber) && "text-accent font-semibold"
                        )}>
                          {day.primaryNumber}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {day.zodiacSign?.substring(0, 3)}
                        </span>
                      )}
                    </div>
                  </button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="px-4 pb-6 pt-2">
                    <DayDetail day={day} />
                  </div>
                </DrawerContent>
              </Drawer>
            ) : (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <button className={cn(
                    "day-cell",
                    day.isToday && "today-cell"
                  )}>
                    <div className="day-number">{day.date}</div>
                    {calendarType === "numerology" ? (
                      <div className="space-y-1">
                        <div className="numerology-value">
                          <span className="text-muted-foreground">Primary: </span>
                          <span className={cn(
                            masterNumbers.includes(day.primaryNumber) && "text-accent font-semibold"
                          )}>
                            {day.primaryNumber}
                          </span>
                        </div>
                        {day.secondaryNumber && (
                          <div className="numerology-value">
                            <span className="text-muted-foreground">Secondary: </span>
                            <span>{day.secondaryNumber}</span>
                          </div>
                        )}
                        {day.personalNumber && (
                          <div className="numerology-value">
                            <span className="text-muted-foreground">Personal: </span>
                            <span>{day.personalNumber}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="numerology-value">
                          <span className="text-muted-foreground">Sign: </span>
                          <span>{day.zodiacSign?.substring(0, 3)}</span>
                        </div>
                        <div className="numerology-value">
                          <span className="text-muted-foreground">Chinese: </span>
                          <span>{day.chineseSign?.substring(0, 3)}</span>
                        </div>
                      </div>
                    )}
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Day Details</DialogTitle>
                  </DialogHeader>
                  <DayDetail day={day} />
                </DialogContent>
              </Dialog>
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const sumDigits = (num: number) => {
  return num.toString().split("").reduce((acc, val) => acc + parseInt(val), 0);
};

