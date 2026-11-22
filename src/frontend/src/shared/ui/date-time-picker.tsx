"use client";

import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { pl } from "react-day-picker/locale";

import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { NativeSelect } from "@/shared/ui/native-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

// A wall-clock date and time to the minute, as a datetime-local input writes it: "2026-10-15T18:00".
type LocalDateTime = string;

type DateTimePickerProps = {
  id?: string;
  value: LocalDateTime;
  onChange: (value: LocalDateTime) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
};

const DEFAULT_TIME = "18:00";
const MINUTE_STEP = 5;
const HOURS = Array.from({ length: 24 }, (_hour, hour) => String(hour).padStart(2, "0"));
const LABEL_FORMAT = new Intl.DateTimeFormat("pl-PL", { dateStyle: "full", timeStyle: "short" });

function parse(value: LocalDateTime): { date: Date | undefined; time: string } {
  const [day, time] = value.split("T");
  const [year, month, date] = (day ?? "").split("-").map(Number);
  if (!year || !month || !date) {
    return { date: undefined, time: DEFAULT_TIME };
  }
  return { date: new Date(year, month - 1, date), time: time?.slice(0, 5) || DEFAULT_TIME };
}

function format(date: Date, time: string): LocalDateTime {
  const day = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
  return `${day}T${time}`;
}

function minutesFor(selected: string): string[] {
  const steps = Array.from({ length: 60 / MINUTE_STEP }, (_step, step) =>
    String(step * MINUTE_STEP).padStart(2, "0"),
  );
  // A time saved earlier off the step (18:07) stays selectable.
  return steps.includes(selected) ? steps : [...steps, selected].sort();
}

// The whole field is one button: date and time are picked, never typed.
export function DateTimePicker({
  id,
  value,
  onChange,
  onBlur,
  invalid,
  describedBy,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const { date, time } = parse(value);
  const [hour = "18", minute = "00"] = time.split(":");
  const shown = date
    ? LABEL_FORMAT.format(
        new Date(date.getFullYear(), date.getMonth(), date.getDate(), Number(hour), Number(minute)),
      )
    : "Wybierz datę i godzinę";

  function changeTime(nextHour: string, nextMinute: string) {
    onChange(format(date ?? new Date(), `${nextHour}:${nextMinute}`));
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          onBlur?.();
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          // aria-invalid is not allowed on a button; the error text is linked by aria-describedby.
          data-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(
            "flex h-8 w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 text-left text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 dark:bg-input/30",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate first-letter:uppercase">{shown}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        // Focus the chosen day (or today), not the first button, so arrow keys move the date.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          if (event.currentTarget instanceof HTMLElement) {
            const day =
              event.currentTarget.querySelector<HTMLElement>("[data-selected-single=true]") ??
              event.currentTarget.querySelector<HTMLElement>("[data-day]:not(:disabled)");
            day?.focus();
          }
        }}
      >
        <Calendar
          mode="single"
          locale={pl}
          selected={date}
          defaultMonth={date}
          onSelect={(day) => day && onChange(format(day, time))}
        />
        <div className="flex items-center gap-1.5 border-t p-2">
          <NativeSelect
            aria-label="Godzina"
            value={hour}
            onChange={(event) => changeTime(event.target.value, minute)}
          >
            {HOURS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </NativeSelect>
          <span aria-hidden>:</span>
          <NativeSelect
            aria-label="Minuty"
            value={minute}
            onChange={(event) => changeTime(hour, event.target.value)}
          >
            {minutesFor(minute).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </NativeSelect>
          <Button size="sm" className="ml-auto" onClick={() => setOpen(false)}>
            Gotowe
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
