import * as React from "react"
import { format, setMonth, setYear, addYears, subYears, isSameDay } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Info } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/global/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ANALYTICS_PRESETS, validateDate } from "@/lib/date-utils"

export type DatePickerMode = "single" | "range" | "month" | "year" | "datetime"
export type DatePickerContext = "dob" | "purchase" | "booking" | "analytics" | "standard"

interface DatePickerProps {
  mode?: DatePickerMode
  context?: DatePickerContext
  date?: Date
  setDate?: (date: Date | undefined) => void
  range?: DateRange
  setRange?: (range: DateRange | undefined) => void
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  placeholder?: string
  className?: string
  showPresets?: boolean
}

type ViewMode = "days" | "months" | "years"

export function DatePicker({
  mode = "single",
  context = "standard",
  date,
  setDate,
  range,
  setRange,
  minDate,
  maxDate,
  disabledDates,
  placeholder = "Pick a date",
  className,
  showPresets = false,
}: DatePickerProps) {
  const [view, setView] = React.useState<ViewMode>("days")
  const [displayMonth, setDisplayMonth] = React.useState<Date>(date || range?.from || new Date())
  const [yearRangeStart, setYearRangeStart] = React.useState(
    Math.floor((date || new Date()).getFullYear() / 12) * 12
  )

  // Context-specific overrides
  const effectiveMaxDate = context === "dob" ? new Date() : maxDate
  const effectiveMinDate = context === "booking" ? new Date() : minDate
  const isRange = mode === "range" || context === "analytics"
  const finalShowPresets = showPresets || context === "analytics"

  const onOpenChange = (open: boolean) => {
    if (open) {
      setView("days")
      setDisplayMonth(date || range?.from || new Date())
    }
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i)

  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-background/50 hover:bg-background/80 transition-all border-border shadow-sm",
            ((!date && !isRange) || (!range && isRange)) && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          {isRange ? (
            range?.from ? (
              range.to ? (
                <>
                  {format(range.from, "LLL dd, y")} - {format(range.to, "LLL dd, y")}
                </>
              ) : (
                format(range.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )
          ) : date ? (
            format(date, "PPP")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-auto p-0 border-none bg-transparent shadow-none",
          finalShowPresets && "flex flex-col md:flex-row"
        )} 
        align="start"
      >
        <div className="flex bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Presets Sidebar */}
          {finalShowPresets && isRange && (
            <div className="w-44 border-r border-border p-3 space-y-1 bg-secondary/20 hidden md:block">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2">Presets</p>
              {ANALYTICS_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start font-normal text-xs hover:bg-primary hover:text-primary-foreground"
                  onClick={() => {
                    const val = preset.getValue() as [Date, Date]
                    setRange?.({ from: val[0], to: val[1] })
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          )}

          <div className="flex flex-col">
            {view === "days" && (
              <Calendar
                mode={isRange ? "range" : "single"}
                selected={isRange ? range : date}
                onSelect={(val: any) => {
                  if (isRange) {
                    setRange?.(val)
                  } else {
                    // Prevent deselection by only calling setDate if a date is selected
                    if (val) setDate?.(val)
                  }
                }}
                month={displayMonth}
                onMonthChange={setDisplayMonth}
                initialFocus
                fromDate={effectiveMinDate}
                toDate={effectiveMaxDate}
                disabled={disabledDates}
                className="p-4"
                components={{
                  CaptionLabel: ({ displayMonth: dm }) => (
                    <button
                      onClick={() => setView("months")}
                      className="text-sm font-semibold hover:bg-secondary rounded-md px-2 py-1 transition-all"
                    >
                      {format(dm, "MMMM yyyy")}
                    </button>
                  ),
                }}
              />
            )}

            {view === "months" && (
              <div className="p-4 w-[280px]">
                <div className="flex justify-between items-center mb-4">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setDisplayMonth(subYears(displayMonth, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <button 
                    onClick={() => {
                      setYearRangeStart(Math.floor(displayMonth.getFullYear() / 12) * 12)
                      setView("years")
                    }}
                    className="text-sm font-bold hover:bg-secondary rounded-md px-3 py-1"
                  >
                    {format(displayMonth, "yyyy")}
                  </button>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setDisplayMonth(addYears(displayMonth, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {months.map((m, i) => (
                    <Button
                      key={m}
                      variant="ghost"
                      className={cn(
                        "h-10 w-full font-medium rounded-xl hover:bg-primary hover:text-primary-foreground",
                        displayMonth.getMonth() === i && "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      )}
                      onClick={() => {
                        setDisplayMonth(setMonth(displayMonth, i))
                        setView("days")
                      }}
                    >
                      {m}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {view === "years" && (
              <div className="p-4 w-[280px]">
                <div className="flex justify-between items-center mb-4">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setYearRangeStart(yearRangeStart - 12)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-bold text-primary">
                    {yearRangeStart} - {yearRangeStart + 11}
                  </span>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setYearRangeStart(yearRangeStart + 12)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {years.map((y) => (
                    <Button
                      key={y}
                      variant="ghost"
                      className={cn(
                        "h-10 w-full font-medium rounded-xl hover:bg-primary hover:text-primary-foreground",
                        displayMonth.getFullYear() === y && "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      )}
                      onClick={() => {
                        setDisplayMonth(setYear(displayMonth, y))
                        setView("months")
                      }}
                    >
                      {y}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* DateTime Footer Slot */}
            {(mode === "datetime") && (
              <div className="border-t border-border p-3 bg-secondary/5 flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 text-xs text-muted-foreground font-medium">Time selection integration...</div>
                <Button size="sm" className="h-8 rounded-lg px-3 text-xs">Set Time</Button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
