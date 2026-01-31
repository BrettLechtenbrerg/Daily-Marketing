"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HelpButton } from "@/components/help/help-button";
import {
  ArrowLeft,
  Megaphone,
  Download,
  Printer,
  Plus,
  X,
  Target,
  Users,
  CheckSquare,
  Square,
  TrendingUp,
  StickyNote,
  Lightbulb,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────

interface MarketingActivity {
  id: string;
  description: string;
  goalNewClients: string;
  trialFirst: string;
  trialSecond: string;
  actualNewClients: string;
}

interface NeedItem {
  id: string;
  text: string;
  done: boolean;
}

interface MonthPlan {
  activities: MarketingActivity[];
  needs: NeedItem[];
  notes: string;
  freeIdeas: string;
  completedBy: string;
}

// ─── Constants ────────────────────────────────────────────────────

const PORTAL_URL = "https://masters-edge-portal.vercel.app";
const MONTH_KEY_PREFIX = "daily-marketing-month-";
const SELECTED_MONTH_KEY = "daily-marketing-selected-month";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DEFAULT_ACTIVITIES: Omit<MarketingActivity, "goalNewClients" | "trialFirst" | "trialSecond" | "actualNewClients">[] = [
  { id: "social-contest", description: "Social Media Contest (Facebook, Instagram)" },
  { id: "door-hangers", description: "Door Hangers Distribution" },
  { id: "appreciation", description: "Client Appreciation Event - Bring a Friend" },
  { id: "newspaper", description: "Newspaper / Local Ad Insert" },
  { id: "buddy-day", description: "Challenge Class / Buddy Day" },
  { id: "vip-passes", description: "VIP Pass & Business Card Distribution" },
  { id: "direct-mail", description: "Direct Mail Campaign (3 piece sequence)" },
  { id: "family-addon", description: "Family Add-on / Parent Workshop" },
  { id: "fb-ad", description: "Social Media Ad Campaign (Paid)" },
  { id: "community-mailer", description: "Community Mailer" },
  { id: "b2b", description: "B2B Networking - Lead Boxes" },
  { id: "reactivation", description: "Reactivation of Former Students" },
  { id: "school-talks", description: "School / Team Talks & Demos" },
  { id: "referrals", description: "Referral Program - 3 Passes per Client" },
  { id: "walkins", description: "Walk-in Traffic Off the Street" },
  { id: "comp-training", description: "Complimentary Team / Group Training" },
  { id: "special-offer", description: "Special Offer Letter to Non-Enrolled" },
  { id: "gift-card", description: "Starbucks / Gift Card Program" },
  { id: "case-studies", description: "Case Studies Posted on Social Media" },
  { id: "fundraisers", description: "School Fundraiser Partnerships" },
  { id: "free-trial", description: "Free Private Lesson / Trial Offer (30 min)" },
  { id: "press", description: "Press Releases / PSA's" },
];

const DEFAULT_NEEDS: Omit<NeedItem, "done">[] = [
  { id: "n1", text: "Finalize all flyers and promotional materials" },
  { id: "n2", text: "Complete social media content calendar" },
  { id: "n3", text: "Finalize direct mail sequence and artwork" },
  { id: "n4", text: "Prepare newspaper / local ad insert" },
  { id: "n5", text: "Set up social media ad campaigns" },
  { id: "n6", text: "Coordinate school visit and demo schedule" },
  { id: "n7", text: "Order promotional materials (passes, cards, flyers)" },
  { id: "n8", text: "Create event flyers (buddy day, appreciation party)" },
];

const DEFAULT_NOTES = `Goal: Enroll 1 new person per day into some program.
This will only come with focused and massive action.

3 hours a day of focused marketing (9am - noon):
  1. Social Media - 30 min
  2. Business to Business - 2 hours
  3. Internal events/relationships - 30 min

1 hour per day of product/marketing creation and refinement.

Write 1 case study per week and post.
Get out 2 gift/Starbucks cards per week to clients.

Decide on your social media channels and commit for a year.
Keys: Concept, Strategy, Tactics, Consistency.`;

const DEFAULT_FREE_IDEAS = `1. Human Billboard program
2. Put everyone on monthly billing
3. Grocery store tours
4. Park workouts
5. Lunch and learn with local businesses
6. Gift basket promotion
7. Get your site on all directories
8. Text-A-Day Program for clients
9. Client survey - what would they like to see?
10. Get a pro shop up and active
11. 10-week sports academy program
12. Community charity events
13. Birthday party demos
14. Social media challenges and giveaways`;

// ─── Helpers ──────────────────────────────────────────────────────

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function parseMonthKey(key: string) {
  const [year, month] = key.split("-");
  return { year: parseInt(year), monthIndex: parseInt(month) - 1 };
}

function formatMonthLabel(key: string) {
  const { year, monthIndex } = parseMonthKey(key);
  return `${MONTHS[monthIndex]} ${year}`;
}

function getDefaultPlan(): MonthPlan {
  return {
    activities: DEFAULT_ACTIVITIES.map((a) => ({
      ...a,
      goalNewClients: "",
      trialFirst: "",
      trialSecond: "",
      actualNewClients: "",
    })),
    needs: DEFAULT_NEEDS.map((n) => ({ ...n, done: false })),
    notes: DEFAULT_NOTES,
    freeIdeas: DEFAULT_FREE_IDEAS,
    completedBy: "",
  };
}

function safeParseInt(val: string): number {
  const n = parseInt(val.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

// ─── Component ────────────────────────────────────────────────────

export default function DailyMarketing() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [plan, setPlan] = useState<MonthPlan>(getDefaultPlan());
  const [mounted, setMounted] = useState(false);
  const [newActivityDesc, setNewActivityDesc] = useState("");
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newNeedText, setNewNeedText] = useState("");

  // ─── Load ───────────────────────────────────────────────────────

  const loadMonth = useCallback((monthKey: string) => {
    const stored = localStorage.getItem(MONTH_KEY_PREFIX + monthKey);
    if (stored) {
      try {
        return JSON.parse(stored) as MonthPlan;
      } catch {
        return getDefaultPlan();
      }
    }
    const prevBy = localStorage.getItem("daily-marketing-last-name") || "";
    const def = getDefaultPlan();
    def.completedBy = prevBy;
    return def;
  }, []);

  useEffect(() => {
    const savedMonth = localStorage.getItem(SELECTED_MONTH_KEY);
    const monthKey = savedMonth || getCurrentMonthKey();
    setSelectedMonth(monthKey);
    setPlan(loadMonth(monthKey));
    setMounted(true);
  }, [loadMonth]);

  // ─── Auto-save ──────────────────────────────────────────────────

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(MONTH_KEY_PREFIX + selectedMonth, JSON.stringify(plan));
      localStorage.setItem(SELECTED_MONTH_KEY, selectedMonth);
      if (plan.completedBy) {
        localStorage.setItem("daily-marketing-last-name", plan.completedBy);
      }
    }
  }, [plan, selectedMonth, mounted]);

  // ─── Stats ──────────────────────────────────────────────────────

  const totals = useMemo(() => {
    let goalTotal = 0;
    let actualTotal = 0;
    for (const a of plan.activities) {
      goalTotal += safeParseInt(a.goalNewClients);
      actualTotal += safeParseInt(a.actualNewClients);
    }
    return { goalTotal, actualTotal };
  }, [plan.activities]);

  const needsDone = useMemo(
    () => plan.needs.filter((n) => n.done).length,
    [plan.needs]
  );

  // ─── Handlers ───────────────────────────────────────────────────

  const switchMonth = (monthKey: string) => {
    localStorage.setItem(MONTH_KEY_PREFIX + selectedMonth, JSON.stringify(plan));
    setSelectedMonth(monthKey);
    setPlan(loadMonth(monthKey));
  };

  const updateActivity = (id: string, field: keyof MarketingActivity, value: string) => {
    setPlan((prev) => ({
      ...prev,
      activities: prev.activities.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    }));
  };

  const addActivity = () => {
    const desc = newActivityDesc.trim();
    if (!desc) return;
    setPlan((prev) => ({
      ...prev,
      activities: [
        ...prev.activities,
        { id: makeId(), description: desc, goalNewClients: "", trialFirst: "", trialSecond: "", actualNewClients: "" },
      ],
    }));
    setNewActivityDesc("");
    setShowAddActivity(false);
  };

  const removeActivity = (id: string) => {
    setPlan((prev) => ({
      ...prev,
      activities: prev.activities.filter((a) => a.id !== id),
    }));
  };

  const toggleNeed = (id: string) => {
    setPlan((prev) => ({
      ...prev,
      needs: prev.needs.map((n) => (n.id === id ? { ...n, done: !n.done } : n)),
    }));
  };

  const addNeed = () => {
    const text = newNeedText.trim();
    if (!text) return;
    setPlan((prev) => ({
      ...prev,
      needs: [...prev.needs, { id: makeId(), text, done: false }],
    }));
    setNewNeedText("");
  };

  const removeNeed = (id: string) => {
    setPlan((prev) => ({
      ...prev,
      needs: prev.needs.filter((n) => n.id !== id),
    }));
  };

  const handlePrint = () => window.print();

  const handleExport = () => {
    const label = formatMonthLabel(selectedMonth);
    const lines = [
      "MARKETING PLAN",
      label,
      `Completed By: ${plan.completedBy || "Not specified"}`,
      "=".repeat(70),
      "",
      `${"Description of Activity".padEnd(42)} ${"Goal".padEnd(8)} ${"Trial".padEnd(10)} Actual`,
      "-".repeat(70),
    ];
    for (const a of plan.activities) {
      const trial = a.trialFirst || a.trialSecond ? `${a.trialFirst || "0"}/${a.trialSecond || "0"}` : "-";
      lines.push(
        `${a.description.padEnd(42)} ${(a.goalNewClients || "-").padEnd(8)} ${trial.padEnd(10)} ${a.actualNewClients || "-"}`
      );
    }
    lines.push("-".repeat(70));
    lines.push(`${"TOTAL".padEnd(42)} ${String(totals.goalTotal).padEnd(8)} ${"".padEnd(10)} ${totals.actualTotal}`);
    lines.push("");
    if (plan.needs.length > 0) {
      lines.push("NEEDS / ACTION ITEMS");
      lines.push("-".repeat(70));
      for (const n of plan.needs) lines.push(`  [${n.done ? "X" : " "}] ${n.text}`);
      lines.push("");
    }
    if (plan.notes.trim()) {
      lines.push("GOALS & STRATEGY NOTES");
      lines.push("-".repeat(70));
      lines.push(plan.notes);
      lines.push("");
    }
    if (plan.freeIdeas.trim()) {
      lines.push("FREE & LOW-COST IDEAS");
      lines.push("-".repeat(70));
      lines.push(plan.freeIdeas);
      lines.push("");
    }
    lines.push("Daily Marketing by Total Success AI");
    lines.push("Part of The Master's Edge Business Program");

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marketing-plan-${selectedMonth}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Derived ────────────────────────────────────────────────────

  const { year: selYear, monthIndex: selMonthIdx } = parseMonthKey(selectedMonth);
  const thisYear = new Date().getFullYear();
  const yearOptions = [thisYear - 1, thisYear, thisYear + 1];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-pink-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 no-print">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href={PORTAL_URL} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Portal</span>
          </a>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" className="gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <HelpButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/25 no-print">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Marketing Plan
                </h1>
                <p className="text-lg font-bold text-pink-600 dark:text-pink-400">
                  {formatMonthLabel(selectedMonth)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 no-print">
              <select
                value={selMonthIdx}
                onChange={(e) => switchMonth(`${selYear}-${String(Number(e.target.value) + 1).padStart(2, "0")}`)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <select
                value={selYear}
                onChange={(e) => switchMonth(`${e.target.value}-${String(selMonthIdx + 1).padStart(2, "0")}`)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary */}
          <Card className="shadow-md border-pink-200/50 dark:border-pink-800/50 print-section">
            <CardContent className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" /> Goal (New Clients)
                  </span>
                  <p className="text-2xl font-extrabold text-pink-700 dark:text-pink-400">{totals.goalTotal}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" /> Actual (New Clients)
                  </span>
                  <p className={`text-2xl font-extrabold ${totals.actualTotal >= totals.goalTotal && totals.goalTotal > 0 ? "text-emerald-600" : "text-gray-900 dark:text-white"}`}>
                    {totals.actualTotal}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <CheckSquare className="h-3.5 w-3.5" /> Needs Done
                  </span>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{needsDone}/{plan.needs.length}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Completed By
                  </label>
                  <input
                    type="text"
                    value={plan.completedBy}
                    onChange={(e) => setPlan((prev) => ({ ...prev, completedBy: e.target.value }))}
                    placeholder="Your name"
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activities Table */}
          <Card className="print-section">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[220px]">
                        Description of Activity
                      </th>
                      <th className="text-center px-2 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[70px]">
                        <div>Goal for</div><div>New Clients</div>
                      </th>
                      <th className="text-center px-1 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[50px]">
                        <div>Trial</div><div className="text-[10px]">1st</div>
                      </th>
                      <th className="text-center px-1 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[50px]">
                        <div>Trial</div><div className="text-[10px]">2nd</div>
                      </th>
                      <th className="text-center px-2 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[70px]">
                        <div>Actual</div><div>New Clients</div>
                      </th>
                      <th className="w-9 no-print" />
                    </tr>
                  </thead>
                  <tbody>
                    {plan.activities.map((activity, i) => (
                      <tr
                        key={activity.id}
                        className={`border-b transition-colors ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/20"} hover:bg-pink-50/30 dark:hover:bg-pink-950/10`}
                      >
                        <td className="px-4 py-1">
                          <input
                            type="text"
                            value={activity.description}
                            onChange={(e) => updateActivity(activity.id, "description", e.target.value)}
                            className="w-full px-1 py-1.5 bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-pink-500 rounded-md transition-colors"
                          />
                        </td>
                        <td className="px-1.5 py-1">
                          <input
                            type="text"
                            value={activity.goalNewClients}
                            onChange={(e) => updateActivity(activity.id, "goalNewClients", e.target.value)}
                            placeholder="0"
                            className="w-full text-center px-1 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold font-mono placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="text"
                            value={activity.trialFirst}
                            onChange={(e) => updateActivity(activity.id, "trialFirst", e.target.value)}
                            placeholder="—"
                            className="w-full text-center px-1 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="text"
                            value={activity.trialSecond}
                            onChange={(e) => updateActivity(activity.id, "trialSecond", e.target.value)}
                            placeholder="—"
                            className="w-full text-center px-1 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-1.5 py-1">
                          <input
                            type="text"
                            value={activity.actualNewClients}
                            onChange={(e) => updateActivity(activity.id, "actualNewClients", e.target.value)}
                            placeholder="0"
                            className="w-full text-center px-1 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold font-mono placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-0.5 no-print">
                          <button
                            onClick={() => removeActivity(activity.id)}
                            className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Total */}
                    <tr className="bg-pink-50 dark:bg-pink-950/20 border-t-2 border-pink-300 dark:border-pink-800">
                      <td className="px-4 py-3">
                        <span className="text-sm font-extrabold text-pink-800 dark:text-pink-300">Total</span>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span className="text-sm font-extrabold text-pink-700 dark:text-pink-400 font-mono">{totals.goalTotal}</span>
                      </td>
                      <td colSpan={2} className="px-2 py-3 text-center">
                        <span className="text-xs text-gray-400">&mdash;</span>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span className={`text-sm font-extrabold font-mono ${totals.actualTotal >= totals.goalTotal && totals.goalTotal > 0 ? "text-emerald-600" : "text-pink-700 dark:text-pink-400"}`}>
                          {totals.actualTotal}
                        </span>
                      </td>
                      <td className="no-print" />
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="px-4 py-3 border-t no-print">
                {showAddActivity ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newActivityDesc}
                      onChange={(e) => setNewActivityDesc(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addActivity()}
                      placeholder="Marketing activity description..."
                      className="flex-1 max-w-md px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                      autoFocus
                    />
                    <Button size="sm" onClick={addActivity} className="bg-pink-600 hover:bg-pink-700 h-8">Add</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setShowAddActivity(false); setNewActivityDesc(""); }} className="h-8">Cancel</Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setShowAddActivity(true)} className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 dark:text-pink-400 dark:hover:bg-pink-950/30">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Marketing Activity
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Needs / Action Items */}
          <Card className="print-section">
            <CardContent className="p-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <CheckSquare className="h-5 w-5 text-pink-600" />
                Needs / Action Items
              </h2>
              <div className="space-y-1">
                {plan.needs.map((need) => (
                  <div key={need.id} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${need.done ? "bg-emerald-50 dark:bg-emerald-950/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}>
                    <button onClick={() => toggleNeed(need.id)} className="shrink-0">
                      {need.done ? (
                        <CheckSquare className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400 hover:text-pink-500" />
                      )}
                    </button>
                    <span className={`text-sm flex-1 ${need.done ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-300"}`}>
                      {need.text}
                    </span>
                    <button onClick={() => removeNeed(need.id)} className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors no-print">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 no-print">
                <input
                  type="text"
                  value={newNeedText}
                  onChange={(e) => setNewNeedText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNeed()}
                  placeholder="Add an action item..."
                  className="flex-1 max-w-md px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <Button size="sm" onClick={addNeed} disabled={!newNeedText.trim()} className="bg-pink-600 hover:bg-pink-700 h-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Goals & Strategy */}
          <Card className="print-section">
            <CardContent className="p-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <StickyNote className="h-5 w-5 text-pink-600" />
                Goals &amp; Strategy Notes
              </h2>
              <textarea
                value={plan.notes}
                onChange={(e) => setPlan((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter your monthly goals, strategy, time blocks, social media plan..."
                rows={10}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm leading-relaxed placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-y"
              />
            </CardContent>
          </Card>

          {/* Free Ideas */}
          <Card className="print-section">
            <CardContent className="p-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Free &amp; Low-Cost Ideas to Implement
              </h2>
              <textarea
                value={plan.freeIdeas}
                onChange={(e) => setPlan((prev) => ({ ...prev, freeIdeas: e.target.value }))}
                placeholder="List free or cheap marketing ideas your team can implement immediately..."
                rows={8}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm leading-relaxed placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-y"
              />
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Daily Marketing by{" "}
              <span className="font-medium text-gray-500 dark:text-gray-400">Total Success AI</span>
              {" "}&mdash; Plan it, work it, track it, print it. Auto-saves as you type.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
