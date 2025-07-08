// "use client"

// import * as React from "react"
// import { ChevronLeft, ChevronRight } from "lucide-react"
// import { DayPicker } from "react-day-picker"

// import { cn } from "@/lib/utils"
// import { buttonVariants } from "@/components/ui/button"

// export type CalendarProps = React.ComponentProps<typeof DayPicker>

// function Calendar({
//   className,
//   classNames,
//   showOutsideDays = true,
//   ...props
// }: CalendarProps) {
//   return (
//     <DayPicker
//       showOutsideDays={showOutsideDays}
//       className={cn("p-3", className)}
//       classNames={{
//         months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
//         month: "space-y-4",
//         caption: "flex justify-center pt-1 relative items-center",
//         caption_label: "text-sm font-medium",
//         nav: "space-x-1 flex items-center",
//         nav_button: cn(
//           buttonVariants({ variant: "outline" }),
//           "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
//         ),
//         nav_button_previous: "absolute left-1",
//         nav_button_next: "absolute right-1",
//         table: "w-full border-collapse space-y-1",
//         head_row: "flex",
//         head_cell:
//           "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
//         row: "flex w-full mt-2",
//         cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
//         day: cn(
//           buttonVariants({ variant: "ghost" }),
//           "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
//         ),
//         day_range_end: "day-range-end",
//         day_selected:
//           "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
//         day_today: "bg-accent text-accent-foreground",
//         day_outside:
//           "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
//         day_disabled: "text-muted-foreground opacity-50",
//         day_range_middle:
//           "aria-selected:bg-accent aria-selected:text-accent-foreground",
//         day_hidden: "invisible",
//         ...classNames,
//       }}
//       components={{
//         IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
//         IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
//       }}
//       {...props}
//     />
//   )
// }
// Calendar.displayName = "Calendar"

// export { Calendar }

// "use client"

// import * as React from "react"
// import { ChevronLeft, ChevronRight } from "lucide-react"
// import { DayPicker } from "react-day-picker"
// import { enUS, arSA } from "date-fns/locale"
// import { useTranslation } from "react-i18next"

// import { cn } from "@/lib/utils"
// import { buttonVariants } from "@/components/ui/button"

// export type CalendarProps = React.ComponentProps<typeof DayPicker>

// function Calendar({
//   className,
//   classNames,
//   showOutsideDays = true,
//   ...props
// }: CalendarProps) {
//   const { i18n } = useTranslation()

//   const isArabic = i18n.language === "ar"
//   const locale = isArabic ? arSA : enUS

//   return (
//     <div dir={isArabic ? "rtl" : "ltr"}>
//       <DayPicker
//         locale={locale}
//         showOutsideDays={showOutsideDays}
//         className={cn("p-3", className)}
//         classNames={{
//           months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
//           month: "space-y-4",
//           caption: "flex justify-center pt-1 relative items-center",
//           caption_label: "text-sm font-medium",
//           nav: "space-x-1 flex items-center",
//           nav_button: cn(
//             buttonVariants({ variant: "outline" }),
//             "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
//           ),
//           nav_button_previous: "absolute left-1",
//           nav_button_next: "absolute right-1",
//           table: "w-full border-collapse space-y-1",
//           head_row: "flex",
//           head_cell:
//             "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
//           row: "flex w-full mt-2",
//           cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
//           day: cn(
//             buttonVariants({ variant: "ghost" }),
//             "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
//           ),
//           day_range_end: "day-range-end",
//           day_selected:
//             "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
//           day_today: "bg-accent text-accent-foreground",
//           day_outside:
//             "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
//           day_disabled: "text-muted-foreground opacity-50",
//           day_range_middle:
//             "aria-selected:bg-accent aria-selected:text-accent-foreground",
//           day_hidden: "invisible",
//           ...classNames,
//         }}
//         components={{
//           IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
//           IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
//         }}
//         {...props}
//       />
//     </div>
//   )
// }

// Calendar.displayName = "Calendar"
// export { Calendar }
"use client";

import * as React from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { enUS, arSA } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { startOfMonth, addMonths, subMonths } from "date-fns";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const locale = isArabic ? arSA : enUS;

  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="w-full flex justify-center">
      <div className="relative max-w-md w-full">
        {/* Custom nav */}
        <button
        type="button"
          aria-label="Previous month"
          onClick={() => setMonth(subMonths(month, 1))}
          className="absolute left-4 top-2 z-10 p-2 rounded hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setMonth(addMonths(month, 1))}
          className="absolute right-4 top-2 z-10 p-2 rounded hover:bg-muted"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <DayPicker
          month={month}
          onMonthChange={setMonth}
          locale={locale}
          showOutsideDays={showOutsideDays}
          className={cn("p-3", className)}
          classNames={{
            months:
              "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4 w-full",
            caption: "flex justify-center pt-6 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "hidden", // hide default nav completely
            table: "w-full border-collapse space-y-1",
            head_row: "flex justify-center",
            head_cell:
              "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex justify-center w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn(
              "h-9 w-9 p-0 font-normal rounded-xxl hover:bg-accent items-center justify-center flex aria-selected:opacity-100",
              "aria-selected:opacity-100"
            ),
            day_selected:
              "bg-[#ea6e00] text-white hover:bg-[#ea6e00] focus:bg-[#ea6e00]",
            day_today: "bg-accent text-accent-foreground",
            day_outside:
              "day-outside text-muted-foreground aria-selected:bg-accent/50",
            day_disabled: "text-muted-foreground opacity-50",
            day_hidden: "invisible",
            ...classNames,
          }}
          {...props}
        />
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";
export { Calendar };