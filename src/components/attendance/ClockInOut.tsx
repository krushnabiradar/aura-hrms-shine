
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Square, Coffee } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useAttendance } from "@/hooks/useAttendance";

export function ClockInOut() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { todaysAttendance, createAttendance, updateAttendance, isCreatingAttendance, isUpdatingAttendance } = useAttendance();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClockIn = async () => {
    try {
      const now = new Date().toISOString();
      const today = new Date().toISOString().split('T')[0];
      
      await createAttendance({
        date: today,
        check_in: now,
        status: 'present'
      });
      
      toast.success('Clocked in successfully!');
    } catch (error) {
      toast.error('Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    if (!todaysAttendance) {
      toast.error('No clock-in record found for today');
      return;
    }

    try {
      const now = new Date().toISOString();
      const checkIn = new Date(todaysAttendance.check_in!);
      const checkOut = new Date(now);
      const totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

      await updateAttendance({
        id: todaysAttendance.id,
        updates: {
          check_out: now,
          total_hours: Math.round(totalHours * 100) / 100 // Round to 2 decimal places
        }
      });
      
      toast.success('Clocked out successfully!');
    } catch (error) {
      toast.error('Failed to clock out');
    }
  };

  const handleBreakStart = async () => {
    if (!todaysAttendance) {
      toast.error('Please clock in first');
      return;
    }

    try {
      const now = new Date().toISOString();
      await updateAttendance({
        id: todaysAttendance.id,
        updates: {
          break_start: now
        }
      });
      
      toast.success('Break started');
    } catch (error) {
      toast.error('Failed to start break');
    }
  };

  const handleBreakEnd = async () => {
    if (!todaysAttendance) {
      toast.error('Please clock in first');
      return;
    }

    try {
      const now = new Date().toISOString();
      await updateAttendance({
        id: todaysAttendance.id,
        updates: {
          break_end: now
        }
      });
      
      toast.success('Break ended');
    } catch (error) {
      toast.error('Failed to end break');
    }
  };

  const isOnBreak = todaysAttendance?.break_start && !todaysAttendance?.break_end;
  const isClockedIn = todaysAttendance?.check_in && !todaysAttendance?.check_out;
  const isClockedOut = todaysAttendance?.check_out;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Clock
        </CardTitle>
        <CardDescription>
          Current time: {currentTime.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="text-center">
          {isClockedOut ? (
            <Badge className="bg-gray-100 text-gray-800">Clocked Out</Badge>
          ) : isClockedIn ? (
            isOnBreak ? (
              <Badge className="bg-orange-100 text-orange-800">On Break</Badge>
            ) : (
              <Badge className="bg-green-100 text-green-800">Working</Badge>
            )
          ) : (
            <Badge variant="outline">Not Clocked In</Badge>
          )}
        </div>

        {/* Today's Summary */}
        {todaysAttendance && (
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Clock In:</span>
              <span>
                {todaysAttendance.check_in 
                  ? new Date(todaysAttendance.check_in).toLocaleTimeString() 
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Clock Out:</span>
              <span>
                {todaysAttendance.check_out 
                  ? new Date(todaysAttendance.check_out).toLocaleTimeString() 
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Total Hours:</span>
              <span>{todaysAttendance.total_hours || 0}h</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {!isClockedIn && !isClockedOut && (
            <Button 
              onClick={handleClockIn}
              disabled={isCreatingAttendance}
              className="col-span-2"
            >
              <Play className="h-4 w-4 mr-2" />
              Clock In
            </Button>
          )}

          {isClockedIn && !isClockedOut && (
            <>
              {!isOnBreak ? (
                <Button 
                  variant="outline"
                  onClick={handleBreakStart}
                  disabled={isUpdatingAttendance}
                >
                  <Coffee className="h-4 w-4 mr-2" />
                  Start Break
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  onClick={handleBreakEnd}
                  disabled={isUpdatingAttendance}
                >
                  <Coffee className="h-4 w-4 mr-2" />
                  End Break
                </Button>
              )}
              
              <Button 
                onClick={handleClockOut}
                disabled={isUpdatingAttendance || isOnBreak}
                variant="destructive"
              >
                <Square className="h-4 w-4 mr-2" />
                Clock Out
              </Button>
            </>
          )}
        </div>

        {isOnBreak && (
          <p className="text-xs text-muted-foreground text-center">
            Please end your break before clocking out
          </p>
        )}
      </CardContent>
    </Card>
  );
}
