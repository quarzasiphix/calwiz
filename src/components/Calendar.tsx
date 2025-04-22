import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { CalendarDay } from "./calendar/CalendarDay";

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

interface CalendarProps {
  lifePathNumber: number | null;
  calendarType?: "numerology" | "astrology";
}

export const Calendar = ({ lifePathNumber, calendarType = "numerology" }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const isMobile = useIsMobile();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

    const primaryNumber = [11, 22, 33].includes(total) ? total : 
      sumDigits(total);

    const secondaryNumber = total !== primaryNumber ? total : undefined;

    let personalNumber;
    if (lifePathNumber) {
      const personalTotal = (secondaryNumber || primaryNumber) + lifePathNumber;
      personalNumber = [11, 22, 33].includes(personalTotal) ? personalTotal : 
        sumDigits(personalTotal);
    }

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
    
    for (let i = 0; i < firstDay; i++) {
      days.push({ date: 0, primaryNumber: 0, isToday: false });
    }
    
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

  const monthNumerology = [11, 22, 33].includes(currentDate.getMonth() + 1) ? 
    currentDate.getMonth() + 1 : 
    (currentDate.getMonth() + 1).toString().split("").reduce((acc, val) => acc + parseInt(val), 0);

  const personalMonthNumerology = lifePathNumber ? 
    [11, 22, 33].includes(monthNumerology + lifePathNumber) ? 
      monthNumerology + lifePathNumber : 
      (monthNumerology + lifePathNumber).toString().split("").reduce((acc, val) => acc + parseInt(val), 0) : 
    null;

  return (
    <Card className="w-full shadow-lg overflow-hidden">
      <CalendarHeader
        currentDate={currentDate}
        monthNames={monthNames}
        calendarType={calendarType}
        zodiacSigns={zodiacSigns}
        monthNumerology={monthNumerology}
        personalMonthNumerology={personalMonthNumerology}
        onPreviousMonth={previousMonth}
        onNextMonth={nextMonth}
      />

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
            <CalendarDay
              key={index}
              day={day}
              isMobile={isMobile}
              calendarType={calendarType}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const sumDigits = (num: number) => {
  return num.toString().split("").reduce((acc, val) => acc + parseInt(val), 0);
};
