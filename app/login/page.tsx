"use client";

import * as motion from "framer-motion/client";

import { LoginBrandPanel } from "@/components/auth/login-brand-panel";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div
      className="flex h-svh overflow-hidden text-[#16233D]"
      style={{ fontFamily: "Aptos, Calibri, system-ui, sans-serif" }}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex w-full flex-col items-center justify-center overflow-y-auto bg-white px-6 py-12 md:px-16 lg:w-[55%]"
      >
        <div className="w-full max-w-[400px]">
          <LoginForm />
        </div>
      </motion.div>

      <div className="hidden h-full w-[45%] lg:block">
        <LoginBrandPanel />
      </div>
    </div>
  );
}
