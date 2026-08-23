import { 
  addDays, 
  subDays, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfQuarter, 
  endOfQuarter, 
  isWeekend,
  format,
  isAfter,
  isBefore,
  isSameDay
} from "date-fns";

export type DatePreset = {
  label: string;
  getValue: () => [Date, Date] | Date;
};

export const ANALYTICS_PRESETS: DatePreset[] = [
  {
    label: "Today",
    getValue: () => [startOfDay(new Date()), endOfDay(new Date())],
  },
  {
    label: "Yesterday",
    getValue: () => {
      const d = subDays(new Date(), 1);
      return [startOfDay(d), endOfDay(d)];
    },
  },
  {
    label: "Last 7 Days",
    getValue: () => [subDays(new Date(), 6), new Date()],
  },
  {
    label: "Last 30 Days",
    getValue: () => [subDays(new Date(), 29), new Date()],
  },
  {
    label: "This Month",
    getValue: () => [startOfMonth(new Date()), new Date()],
  },
  {
    label: "Last Month",
    getValue: () => {
      const d = subDays(startOfMonth(new Date()), 1);
      return [startOfMonth(d), endOfMonth(d)];
    },
  },
  {
    label: "Quarter to Date",
    getValue: () => [startOfQuarter(new Date()), new Date()],
  },
];

export const isBusinessDay = (date: Date) => !isWeekend(date);

export const validateDate = (
  date: Date | undefined, 
  constraints: { min?: Date; max?: Date; disabledDates?: Date[] }
) => {
  if (!date) return true;
  if (constraints.min && isBefore(date, constraints.min) && !isSameDay(date, constraints.min)) return false;
  if (constraints.max && isAfter(date, constraints.max) && !isSameDay(date, constraints.max)) return false;
  if (constraints.disabledDates?.some(d => isSameDay(d, date))) return false;
  return true;
};
