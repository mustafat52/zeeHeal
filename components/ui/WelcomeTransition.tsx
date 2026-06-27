"use client";

import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export function WelcomeTransition({
  greeting,
  subtitle,
}: {
  greeting: string;
  subtitle: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ivory">
      <div className="max-w-md w-full flex flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mb-6"
        >
          <motion.div
            initial={{ rotate: -20, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Leaf size={26} className="text-sage-600" />
          </motion.div>
        </motion.div>

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
