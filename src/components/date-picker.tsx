import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({
  disabled = false,
  onDateSelected,
  enabledDates = [],
}: {
  disabled?: boolean;
  onDateSelected?: (date: Date) => void;
  enabledDates?: Date[];
}) {
  const [date, setDate] = React.useState<Date>();
  const [open, setOpen] = React.useState(false);
  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setOpen(false);
    if (onDateSelected && selectedDate) {
      onDateSelected(selectedDate);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          data-empty={!date}
          className="w-full justify-start"
          disabled={disabled}
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>Expiry date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          className="rounded-md border shadow-sm w-full"
          captionLayout="dropdown"
          startMonth={new Date()}
          endMonth={new Date(enabledDates[enabledDates.length - 1])}
          disabled={(date) => {
            // Return true to disable, false to enable
            return !enabledDates.some(
              (enabledDate) =>
                date.toDateString() === enabledDate.toDateString()
            );
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
