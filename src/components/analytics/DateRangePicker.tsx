
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DateRangePickerProps {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  onDateRangeChange: (range: { startDate: Date; endDate: Date }) => void;
}

const DateRangePicker = ({ dateRange, onDateRangeChange }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const presetRanges = [
    {
      label: 'Last 7 days',
      range: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      }
    },
    {
      label: 'Last 30 days',
      range: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      }
    },
    {
      label: 'Last 90 days',
      range: {
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      }
    }
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[280px] justify-start text-left font-normal border-iced-coffee-300"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(dateRange.startDate, "MMM dd, yyyy")} - {format(dateRange.endDate, "MMM dd, yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="p-3 border-r">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Quick Select</h4>
              {presetRanges.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    onDateRangeChange(preset.range);
                    setIsOpen(false);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="p-3">
            <Calendar
              mode="range"
              selected={{ from: dateRange.startDate, to: dateRange.endDate }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onDateRangeChange({
                    startDate: range.from,
                    endDate: range.to
                  });
                  setIsOpen(false);
                }
              }}
              numberOfMonths={2}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
