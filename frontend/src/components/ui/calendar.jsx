"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: "relative",
        months:
          "relative flex flex-col gap-4 sm:flex-row sm:gap-4",
        month: "space-y-4",
        month_caption: "relative z-0 flex h-9 items-center justify-center",
        caption_label: "pointer-events-none text-sm font-medium leading-none",
        nav: "absolute left-1 right-1 top-0 z-10 flex h-9 items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "cursor-pointer h-7 w-7 p-0 opacity-70 hover:opacity-100"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "cursor-pointer h-7 w-7 p-0 opacity-70 hover:opacity-100"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
        weeks: "flex flex-col",
        week: "flex w-full mt-2",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "cursor-pointer h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        selected:
          "bg-primary text-primary-foreground rounded-md [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
        range_start:
          "bg-primary text-primary-foreground rounded-l-md [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
        range_end:
          "bg-primary text-primary-foreground rounded-r-md [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
        range_middle:
          "bg-accent text-accent-foreground rounded-none [&>button]:text-accent-foreground [&>button]:hover:bg-accent",
        today: "bg-accent text-accent-foreground rounded-md",
        outside:
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 [&>button]:text-muted-foreground",
        disabled:
          "text-muted-foreground opacity-50 [&>button]:text-muted-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: (p) => {
          if (p.orientation === "left") return <ChevronLeft className="h-4 w-4" />
          return <ChevronRight className="h-4 w-4" />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
