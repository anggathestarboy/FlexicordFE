"use client";

import React from "react";
import { Award } from "lucide-react";
import { Badge } from "./types";
import { avatarSrc, tierColor } from "./helpers";

interface BadgesSectionProps {
  badges: Badge[];
  count: number;
}

export default function BadgesSection({ badges, count }: BadgesSectionProps) {
  // Renders the list of earned badges or an empty state
  if (count === 0 || badges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <Award className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
        <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
          Belum ada lencana diraih.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 pt-1">
      {badges.map((b) => (
        <div
          key={b.id}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl"
        >
          {b.icon_url ? (
            <img
              src={avatarSrc(b.icon_url) ?? ""}
              alt={b.name}
              className="h-6 w-6 rounded object-cover"
            />
          ) : (
            <Award
              className="h-5 w-5 shrink-0"
              style={{ color: tierColor(b.tier) }}
            />
          )}
          <div className="text-left">
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 leading-none">
              {b.name}
            </p>
            {b.description && (
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {b.description}
              </p>
            )}
            <span
              className="text-[9px] font-bold uppercase tracking-wider mt-0.5 inline-block"
              style={{ color: tierColor(b.tier) }}
            >
              {b.tier}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
