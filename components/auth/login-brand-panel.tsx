"use client";

import * as motion from "framer-motion/client";

import { BlueprintIllustration } from "@/components/auth/blueprint-illustration";

export function LoginBrandPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#0B2545]"
    >
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle, #0FA8A0 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-12 text-center">
        <div className="mb-8">
          <div className="mb-2 text-[11px] font-semibold tracking-[0.2em] text-white/40 uppercase">
            Studio Project OS
          </div>
          <div className="text-[32px] leading-tight font-bold tracking-tight text-white">
            Grid
            <br />
            Interior
          </div>
        </div>

        <div className="mb-8 flex w-full justify-center">
          <BlueprintIllustration />
        </div>

        <p className="max-w-[260px] text-[13px] leading-relaxed text-white/40">
          Every great space begins with a precise plan. Manage yours here.
        </p>
      </div>
    </motion.div>
  );
}
