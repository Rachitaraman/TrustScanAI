import React from "react";
import { motion } from "framer-motion";

export default function AnimatedHero({ className = "" }) {
  return (
    <div className={`w-full flex items-center justify-center ${className}`}>
      <motion.svg
        width="420"
        height="220"
        viewBox="0 0 420 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial="hidden"
        animate="visible"
      >
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0" stopColor="#7C3AED" />
            <stop offset="0.7" stopColor="#06B6D4" />
            <stop offset="1" stopColor="#22C55E" />
          </linearGradient>
        </defs>

        <motion.path
          d="M60 30 C120 -20 300 -20 360 40 C420 100 360 180 280 190 C200 200 80 180 60 140 C40 100 0 80 60 30 Z"
          fill="url(#g1)"
          opacity="0.12"
          initial={{ y: 10, scale: 0.98 }}
          animate={{ y: -6, scale: 1.02 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />

        <motion.g initial="hidden" animate="visible">
          <motion.circle
            cx="200"
            cy="95"
            r="44"
            stroke="url(#g1)"
            strokeWidth="6"
            fill="transparent"
            initial={{ rotate: -15, scale: 0.9, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <motion.line
            x1="240" y1="130" x2="280" y2="170"
            stroke="rgba(7,16,36,0.6)" strokeWidth="6"
            initial={{ x1: 240, y1: 130, opacity: 0 }}
            animate={{ x1: 240, y1: 130, opacity: 1 }}
            transition={{ delay: 0.6 }}
          />
          <motion.polygon
            points="205,55 210,67 222,70 212,78 214,90 205,83 196,90 198,78 188,70 200,67"
            fill="#fff"
            opacity="0.9"
            initial={{ scale: 0.6, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          />
        </motion.g>

        <motion.circle cx="60" cy="40" r="4" fill="#7C3AED" animate={{ x: [0, 10, 0], y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }} />
        <motion.circle cx="360" cy="30" r="3" fill="#06B6D4" animate={{ x: [0, -8, 0], y: [0, 8, 0] }} transition={{ duration: 2.2, repeat: Infinity }} />
      </motion.svg>
    </div>
  );
}
