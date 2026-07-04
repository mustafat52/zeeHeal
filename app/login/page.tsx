"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { WelcomeTransition } from "@/components/ui/WelcomeTransition";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const conditionLabels: Record<string, string> = {
  "weight-loss": "Weight loss",
  pcos: "PCOS",
  hormonal: "Hormonal",
  skincare: "Skincare",
};

export default function LoginPage() {
  const router = useRouter();
  const setViewMode = useAppStore((s) => s.setViewMode);
  const setActiveClientId = useAppStore((s) => s.setActiveClientId);
  const clients = useAppStore((s) => s.clients);
  const activeClientId = useAppStore((s) => s.activeClientId);
  const activeClient = clients.find((c) => c.id === activeClientId);
  const [welcoming, setWelcoming] = useState<"client" | "nutritionist" | null>(null);

  function enter(mode: "client" | "nutritionist") {
    setViewMode(mode);
    setWelcoming(mode);
    setTimeout(() => {
      router.push(mode === "client" ? "/home" : "/dashboard");
    }, 1500);
  }

  const firstName = activeClient?.name.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-6">
          <span className="font-display text-2xl text-sage-800">z</span>
        </div>
        <h1 className="font-display text-3xl text-moss-900 mb-2">zeeheal</h1>
        <p className="text-moss-400 text-sm mb-6 leading-relaxed">
          Your skin. Your weight. Your hormones.
          <br />
          One root cause.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="w-full mb-6"
      >
        <p className="text-xs text-moss-400 mb-2">Demo — view as client:</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {clients.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveClientId(c.id)}
              className={clsx(
                "tap-scale px-3 py-1.5 rounded-full text-xs font-medium border",
                activeClientId === c.id
                  ? "bg-sage-600 text-white border-sage-600"
                  : "bg-white text-moss-600 border-sage-100"
              )}
            >
              {c.name.split(" ")[0]} · {conditionLabels[c.condition] ?? c.condition}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="w-full flex flex-col gap-3"
      >
        <Button variant="primary" className="w-full py-3.5" onClick={() => enter("client")}>
          Continue as {firstName}
        </Button>
        <Button variant="secondary" className="w-full py-3.5" onClick={() => enter("nutritionist")}>
          Continue as Zainab
        </Button>
      </motion.div>

      <p className="text-[11px] text-moss-400 mt-8">Demo preview · no real account needed</p>

      <AnimatePresence>
        {welcoming === "client" && (
          <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <WelcomeTransition
              greeting={`Welcome back, ${firstName}`}
              subtitle="Let's see how today's going"
            />
          </motion.div>
        )}
        {welcoming === "nutritionist" && (
          <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <WelcomeTransition
              greeting="Welcome, Zainab"
              subtitle="Here's how your clients are doing"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}