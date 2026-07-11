"use client";

import { motion } from "framer-motion";
import { Leaf, Scale, Flower2, Sparkles, type LucideIcon } from "lucide-react";
import type { ConditionType } from "@/lib/mock-data/clients";

const conditionIcons: Record<ConditionType, LucideIcon> = {
  "weight-loss": Scale,
  pcos: Flower2,
  hormonal: Leaf,
  skincare: Sparkles,
};

export function WelcomeTransition({
  greeting,
  subtitle,
  condition,
}: {
  greeting: string;
  subtitle: string;
  /** Optional — swaps the icon to match the client's focus area. Omit for
   * the nutritionist welcome screen, which keeps the original leaf mark. */
  condition?: ConditionType;
}) {
  const Icon = condition ? conditionIcons[condition] : Leaf;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ivory">
      <div className="max-w-md w-full flex flex-col items-center justify-center px-8 text-center">
        <div className="relative w-16 h-16 mb-6">
          {/* Soft breathing glow behind the icon — purely decorative, sits
              behind the icon circle via negative inset + z-index. */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0.15, 0.5] }}
            transition={{
              scale: { duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
              opacity: { duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
            }}
            className="absolute inset-0 rounded-full bg-sage-200"
          />

          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center"
          >
            <motion.div
              initial={{ rotate: -20, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Icon size={26} className="text-sage-600" />
            </motion.div>
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="font-display text-2xl text-moss-900 mb-2"
        >
          {greeting}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
          className="text-sm text-moss-400"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 64, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="h-[2px] bg-sage-200 rounded-full mt-8"
        />
      </div>
    </div>
  );
}