"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  HelpCircle,
  ClipboardList,
  CheckSquare,
  Printer,
  Lightbulb,
  Megaphone,
  Sparkles,
  CalendarDays,
} from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    color: "from-pink-500 to-rose-600",
    title: "Step 1: Build Your Monthly Plan",
    subtitle: "List every marketing activity",
    description:
      "Select the month at the top and add every marketing activity your team will execute. Set a 'Goal for New Clients' for each activity. The system comes pre-loaded with common activities — add, remove, or modify them to match your plan.",
    tip: "Base your goals on real math. If door hangers convert at 1 per 1,000 and you're distributing 5,000, that's a goal of 5. Be realistic but ambitious.",
  },
  {
    icon: CalendarDays,
    color: "from-rose-500 to-red-600",
    title: "Step 2: Track Daily & Weekly",
    subtitle: "Review and update every day",
    description:
      "Every day, review the plan with your team. As leads come in, update the 'Clients on Trial' and 'Actual New Clients' columns. Track which activities are producing results and which need adjustment. The totals update automatically.",
    tip: "Vitamin Principle: Enroll 1 new person per day into some program. This only comes with focused and massive action. Review this plan DAILY.",
  },
  {
    icon: CheckSquare,
    color: "from-red-500 to-orange-600",
    title: "Step 3: Work the Needs List",
    subtitle: "Action items to execute",
    description:
      "The Needs section is your marketing to-do list. Add everything that needs to happen: flyers to create, ads to finalize, mailers to send, events to coordinate. Check items off as they're completed. This keeps your team accountable.",
    tip: "Assign needs to specific people and set deadlines. 'Finalize newspaper insert' becomes 'Sarah — finalize newspaper insert by Friday.'",
  },
  {
    icon: Printer,
    color: "from-orange-500 to-amber-600",
    title: "Step 4: Print & Share",
    subtitle: "Paper copies for the team",
    description:
      "Click Print to get a clean, professional printout of your entire marketing plan. Post it on the wall, hand copies to your team, bring it to meetings. You can also Export as a text file for email or archiving.",
    tip: "Print a copy at the start of each month and post it where your team sees it every day. Visibility = accountability.",
  },
];

export function HelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <HelpCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Help</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-white" />
              </div>
              Daily Marketing Plan Guide
            </DialogTitle>
            <DialogDescription>
              Your monthly marketing playbook. Plan it, work it, track it, print
              it.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 -mx-6 px-6 space-y-4 py-4">
            <div className="rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/40 dark:to-rose-950/40 border border-pink-200 dark:border-pink-800 p-5 space-y-3">
              <h3 className="font-semibold text-pink-900 dark:text-pink-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Multiple Streams of Income
              </h3>
              <p className="text-sm text-pink-800 dark:text-pink-200">
                The Daily Marketing Plan teaches your team to focus on building
                multiple entry points for new clients. Every activity is a
                different door into your business — social media, direct mail,
                referrals, events, B2B networking, walk-ins, and more. The more
                doors you open, the more clients walk through.
              </p>
            </div>

            {steps.map((step, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0`}
                  >
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 p-3">
                  <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    {step.tip}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <Button
              onClick={() => setOpen(false)}
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
