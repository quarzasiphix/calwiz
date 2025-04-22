import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface DayData {
  date: number;
  primaryNumber: number;
  secondaryNumber?: number;
  personalNumber?: number;
  isToday: boolean;
}

interface CalendarProps {
  lifePathNumber: number | null;
}

export const Calendar = ({ lifePathNumber }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const masterNumbers = [11, 22, 33];

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

    return { primaryNumber, secondaryNumber, personalNumber };
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
      const { primaryNumber, secondaryNumber, personalNumber } = calculateDayNumerology(date, month, year);
      const isToday = date === today.getDate() && 
                      month === today.getMonth() && 
                      year === today.getFullYear();
      
      days.push({
        date,
        primaryNumber,
        secondaryNumber,
        personalNumber,
        isToday
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

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-display">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base text-muted-foreground">
          <p>Month Numerology: <span className="font-semibold text-foreground">{monthNumerology}</span></p>
          {lifePathNumber && (
            <p>Personal Month: <span className="font-semibold text-foreground">{personalMonthNumerology}</span></p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="calendar-grid mb-4">
          {dayNames.map((day) => (
            <div key={day} className="font-medium text-center text-sm text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-grid">
          {generateCalendarDays().map((day, index) => (
            day.date === 0 ? (
              <div key={index} />
            ) : (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <div 
                    className={`day-cell cursor-pointer hover:bg-accent/5 ${
                      day.isToday ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                  >
                    <div className="text-right text-sm font-medium mb-2">{day.date}</div>
                    <div className="numerology-display">
                      <div>
                        <span className="numerology-label">Primary:</span>{" "}
                        <span className={[11, 22, 33].includes(day.primaryNumber) ? "master-number" : ""}>
                          {day.primaryNumber}
                        </span>
                      </div>
                      {day.secondaryNumber && (
                        <div>
                          <span className="numerology-label">Secondary:</span>{" "}
                          <span className={[11, 22, 33].includes(day.secondaryNumber) ? "master-number" : ""}>
                            {day.secondaryNumber}
                          </span>
                        </div>
                      )}
                      {day.personalNumber && (
                        <div>
                          <span className="numerology-label">Personal:</span>{" "}
                          <span className={[11, 22, 33].includes(day.personalNumber) ? "master-number" : ""}>
                            {day.personalNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">
                      {monthNames[currentDate.getMonth()]} {day.date}, {currentDate.getFullYear()}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Primary Number: {day.primaryNumber}</h3>
                      <p className="text-sm text-muted-foreground">
                        Represents core energy and main theme for the day
                      </p>
                    </div>
                    {day.secondaryNumber && (
                      <div>
                        <h3 className="font-semibold mb-2">Secondary Number: {day.secondaryNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          Reveals underlying influences and supporting energies
                        </p>
                      </div>
                    )}
                    {day.personalNumber && (
                      <div>
                        <h3 className="font-semibold mb-2">Personal Number: {day.personalNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          Shows how this day's energy interacts with your life path
                        </p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
