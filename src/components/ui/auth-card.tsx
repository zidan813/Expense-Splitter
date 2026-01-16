'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeClosed, ArrowRight, Wallet, ShieldCheck } from 'lucide-react';
import { cn } from "@/lib/utils";

interface AuthCardProps {
    mode: 'login' | 'signup';
    onSubmit: (email: string, password: string) => Promise<void>;
    isLoading?: boolean;
    error?: string;
    onModeChange: () => void;
}

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-orange-500 selection:text-white dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-white",
                "focus-visible:border-orange-500 focus-visible:ring-orange-500/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                className
            )}
            {...props}
        />
    );
}

export function AuthCard({ mode, onSubmit, isLoading = false, error, onModeChange }: AuthCardProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    // For 3D card effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
    const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setPasswordError(null);

        // Validate confirm password for signup
        if (!isLogin && password !== confirmPassword) {
            setPasswordError("Passwords don't match");
            return;
        }

        await onSubmit(email, password);
    };

    const isLogin = mode === 'login';

    // Reset confirm password when switching modes
    React.useEffect(() => {
        setConfirmPassword("");
        setPasswordError(null);
    }, [mode]);

    return (
        <div className="min-h-screen w-full bg-black relative overflow-hidden flex items-center justify-center px-4">
            {/* Background gradient effect - ORANGE theme matching Expense Splitter */}
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/50 via-orange-800/60 to-black" />

            {/* Subtle noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.06] mix-blend-soft-light"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px'
                }}
            />

            {/* Top radial glow - Increased Opacity Again (+20%) */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-orange-400/40 blur-[80px]" />
            <motion.div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-orange-300/40 blur-[60px]"
                animate={{
                    opacity: [0.45, 0.65, 0.45], // Increased +20%
                    scale: [0.98, 1.02, 0.98]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "mirror"
                }}
            />
            <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-orange-400/40 blur-[60px]"
                animate={{
                    opacity: [0.6, 0.8, 0.6], // Increased +20%
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 1
                }}
            />

            {/* Animated glow spots - Increased Opacity */}
            <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-[100px] animate-pulse opacity-80" />
            <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-[100px] animate-pulse opacity-80" style={{ animationDelay: '1s' }} />

            {/* Floating Geometric Shapes - Increased Opacity by another 20% */}
            <motion.div
                className="absolute left-[5%] top-[15%] w-20 h-20 border border-orange-500/60 rounded-2xl"
                animate={{
                    rotate: [0, 90, 0],
                    y: [0, -20, 0],
                    opacity: [0.7, 1.0, 0.7] // Increased
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute left-[8%] top-[35%] w-16 h-16 bg-gradient-to-br from-orange-500/50 to-orange-600/40 rounded-full"
                animate={{
                    scale: [1, 1.2, 1],
                    y: [0, 15, 0],
                    opacity: [0.8, 1.0, 0.8] // Increased
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <motion.div
                className="absolute left-[12%] top-[60%] w-12 h-12 border-2 border-orange-400/50 rounded-lg rotate-45"
                animate={{
                    rotate: [45, 135, 45],
                    opacity: [0.6, 0.8, 0.6] // Increased
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute left-[3%] bottom-[20%] w-24 h-24 border border-orange-300/45 rounded-full"
                animate={{
                    scale: [1, 0.9, 1],
                    x: [0, 10, 0],
                    opacity: [0.6, 0.8, 0.6]
                }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Floating Geometric Shapes - Right Side */}
            <motion.div
                className="absolute right-[6%] top-[20%] w-24 h-24 border border-orange-400/50 rounded-full"
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.7, 0.9, 0.7] // Increased
                }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute right-[10%] top-[45%] w-14 h-14 bg-gradient-to-tl from-orange-500/50 to-transparent rounded-lg rotate-12"
                animate={{
                    rotate: [12, -12, 12],
                    y: [0, -10, 0],
                    opacity: [0.7, 0.9, 0.7]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
            <motion.div
                className="absolute right-[4%] top-[65%] w-8 h-8 bg-orange-400/60 rounded-full blur-sm"
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.8, 1.0, 0.8] // Increased
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute right-[8%] bottom-[25%] w-20 h-20 border-2 border-orange-500/40 rounded-2xl rotate-12"
                animate={{
                    rotate: [12, -30, 12],
                    x: [0, -15, 0],
                    opacity: [0.6, 0.8, 0.6]
                }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Floating Dollar Signs - Increased Opacity */}
            <motion.div
                className="absolute left-[15%] top-[25%] text-orange-500/60 text-4xl font-bold select-none"
                animate={{
                    y: [0, -15, 0],
                    opacity: [0.5, 0.7, 0.5], // Increased
                    rotate: [-5, 5, -5]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
                $
            </motion.div>
            <motion.div
                className="absolute right-[15%] bottom-[30%] text-orange-400/50 text-5xl font-bold select-none"
                animate={{
                    y: [0, 20, 0],
                    opacity: [0.5, 0.7, 0.5], // Increased
                    rotate: [5, -5, 5]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            >
                $
            </motion.div>
            <motion.div
                className="absolute left-[20%] bottom-[15%] text-orange-300/45 text-3xl font-bold select-none"
                animate={{
                    y: [0, -10, 0],
                    x: [0, 5, 0],
                    opacity: [0.4, 0.6, 0.4] // Increased
                }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
                €
            </motion.div>
            <motion.div
                className="absolute right-[20%] top-[12%] text-orange-500/50 text-4xl font-bold select-none"
                animate={{
                    y: [0, 15, 0],
                    opacity: [0.4, 0.6, 0.4] // Increased
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            >
                £
            </motion.div>

            {/* Floating Dots / Particles */}
            <motion.div
                className="absolute left-[25%] top-[10%] w-2 h-2 bg-orange-400/80 rounded-full"
                animate={{
                    y: [0, 30, 0],
                    opacity: [0.8, 1.0, 0.8]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute left-[30%] top-[80%] w-3 h-3 bg-orange-500/70 rounded-full"
                animate={{
                    y: [0, -25, 0],
                    x: [0, 10, 0],
                    opacity: [0.7, 0.9, 0.7]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-sm relative z-10"
                style={{ perspective: 1500 }}
            >
                <motion.div
                    className="relative"
                    style={{ rotateX, rotateY }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    whileHover={{ z: 10 }}
                >
                    <div className="relative group">
                        {/* Card glow effect */}
                        <motion.div
                            className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
                            animate={{
                                boxShadow: [
                                    "0 0 10px 2px rgba(255,107,53,0.1)",
                                    "0 0 15px 5px rgba(255,107,53,0.15)",
                                    "0 0 10px 2px rgba(255,107,53,0.1)"
                                ],
                                opacity: [0.2, 0.4, 0.2]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                repeatType: "mirror"
                            }}
                        />

                        {/* Traveling light beam effect - Orange tint */}
                        <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
                            {/* Top light beam */}
                            <motion.div
                                className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-orange-300 to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{
                                    left: ["-50%", "100%"],
                                    opacity: [0.3, 0.7, 0.3],
                                    filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                                }}
                                transition={{
                                    left: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 },
                                    opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror" },
                                    filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror" }
                                }}
                            />

                            {/* Right light beam */}
                            <motion.div
                                className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-orange-300 to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{
                                    top: ["-50%", "100%"],
                                    opacity: [0.3, 0.7, 0.3],
                                    filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                                }}
                                transition={{
                                    top: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 },
                                    opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 0.6 },
                                    filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 0.6 }
                                }}
                            />

                            {/* Bottom light beam */}
                            <motion.div
                                className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-orange-300 to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{
                                    right: ["-50%", "100%"],
                                    opacity: [0.3, 0.7, 0.3],
                                    filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                                }}
                                transition={{
                                    right: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 },
                                    opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.2 },
                                    filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.2 }
                                }}
                            />

                            {/* Left light beam */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-orange-300 to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{
                                    bottom: ["-50%", "100%"],
                                    opacity: [0.3, 0.7, 0.3],
                                    filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"]
                                }}
                                transition={{
                                    bottom: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 },
                                    opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.8 },
                                    filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.8 }
                                }}
                            />
                        </div>

                        {/* Glass card background */}
                        <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl overflow-hidden">
                            {/* Subtle card inner patterns */}
                            <div className="absolute inset-0 opacity-[0.03]"
                                style={{
                                    backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                                    backgroundSize: '30px 30px'
                                }}
                            />

                            {/* Logo and header */}
                            <div className="text-center space-y-1 mb-5">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", duration: 0.8 }}
                                    className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] flex items-center justify-center relative overflow-hidden shadow-lg shadow-orange-500/30"
                                >
                                    <Wallet className="w-6 h-6 text-white" />
                                    {/* Inner lighting effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80"
                                >
                                    {isLogin ? 'Welcome Back' : 'Create Account'}
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-white/60 text-xs"
                                >
                                    {isLogin ? 'Sign in to continue to Expense Splitter' : 'Join Expense Splitter today'}
                                </motion.p>
                            </div>

                            {/* Login form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <motion.div className="space-y-3">
                                    {/* Email input */}
                                    <motion.div
                                        className={`relative ${focusedInput === "email" ? 'z-10' : ''}`}
                                        whileFocus={{ scale: 1.02 }}
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <div className="absolute -inset-[0.5px] bg-gradient-to-r from-orange-500/10 via-orange-400/5 to-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />

                                        <div className="relative flex items-center overflow-hidden rounded-lg">
                                            <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "email" ? 'text-orange-400' : 'text-white/40'
                                                }`} />

                                            <Input
                                                type="email"
                                                placeholder="Email address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onFocus={() => setFocusedInput("email")}
                                                onBlur={() => setFocusedInput(null)}
                                                required
                                                className="w-full bg-white/5 border-transparent focus:border-orange-500/30 text-white placeholder:text-white/30 h-11 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                                            />

                                            {focusedInput === "email" && (
                                                <motion.div
                                                    layoutId="input-highlight"
                                                    className="absolute inset-0 bg-orange-500/5 -z-10"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                />
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Password input */}
                                    <motion.div
                                        className={`relative ${focusedInput === "password" ? 'z-10' : ''}`}
                                        whileFocus={{ scale: 1.02 }}
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <div className="absolute -inset-[0.5px] bg-gradient-to-r from-orange-500/10 via-orange-400/5 to-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />

                                        <div className="relative flex items-center overflow-hidden rounded-lg">
                                            <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "password" ? 'text-orange-400' : 'text-white/40'
                                                }`} />

                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onFocus={() => setFocusedInput("password")}
                                                onBlur={() => setFocusedInput(null)}
                                                required
                                                minLength={6}
                                                className="w-full bg-white/5 border-transparent focus:border-orange-500/30 text-white placeholder:text-white/30 h-11 transition-all duration-300 pl-10 pr-10 focus:bg-white/10"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 cursor-pointer"
                                            >
                                                {showPassword ? (
                                                    <Eye className="w-4 h-4 text-white/40 hover:text-orange-400 transition-colors duration-300" />
                                                ) : (
                                                    <EyeClosed className="w-4 h-4 text-white/40 hover:text-orange-400 transition-colors duration-300" />
                                                )}
                                            </button>

                                            {focusedInput === "password" && (
                                                <motion.div
                                                    className="absolute inset-0 bg-orange-500/5 -z-10"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                />
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* Confirm Password input - Only for signup */}
                                    <AnimatePresence>
                                        {!isLogin && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className={`relative ${focusedInput === "confirmPassword" ? 'z-10' : ''}`}
                                            >
                                                <div className="absolute -inset-[0.5px] bg-gradient-to-r from-orange-500/10 via-orange-400/5 to-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />

                                                <div className="relative flex items-center overflow-hidden rounded-lg">
                                                    <ShieldCheck className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "confirmPassword" ? 'text-orange-400' : 'text-white/40'
                                                        }`} />

                                                    <Input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="Confirm Password"
                                                        value={confirmPassword}
                                                        onChange={(e) => {
                                                            setConfirmPassword(e.target.value);
                                                            if (passwordError) setPasswordError(null);
                                                        }}
                                                        onFocus={() => setFocusedInput("confirmPassword")}
                                                        onBlur={() => setFocusedInput(null)}
                                                        required
                                                        minLength={6}
                                                        className="w-full bg-white/5 border-transparent focus:border-orange-500/30 text-white placeholder:text-white/30 h-11 transition-all duration-300 pl-10 pr-10 focus:bg-white/10"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 cursor-pointer"
                                                    >
                                                        {showConfirmPassword ? (
                                                            <Eye className="w-4 h-4 text-white/40 hover:text-orange-400 transition-colors duration-300" />
                                                        ) : (
                                                            <EyeClosed className="w-4 h-4 hover:text-orange-400 transition-colors duration-300" />
                                                        )}
                                                    </button>

                                                    {focusedInput === "confirmPassword" && (
                                                        <motion.div
                                                            className="absolute inset-0 bg-orange-500/5 -z-10"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                        />
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Password mismatch error */}
                                {passwordError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 rounded-lg text-sm font-medium bg-red-500/20 text-red-300 border border-red-500/30"
                                    >
                                        {passwordError}
                                    </motion.div>
                                )}

                                {/* Error message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-3 rounded-lg text-sm font-medium ${error.includes('Check your email') || error.includes('confirm')
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                            }`}
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {/* Forgot password link (only for login) */}
                                {isLogin && (
                                    <div className="flex justify-end">
                                        <Link
                                            href="/forgot-password"
                                            className="text-xs text-white/60 hover:text-orange-400 transition-colors duration-200"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                )}

                                {/* Submit button - Orange gradient */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full relative group/button mt-2"
                                >
                                    {/* Button glow effect */}
                                    <div className="absolute inset-0 bg-orange-500/20 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />

                                    <div className="relative overflow-hidden bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] text-white font-medium h-11 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg shadow-orange-500/25">
                                        {/* Button background animation */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -z-10"
                                            animate={{ x: ['-100%', '100%'] }}
                                            transition={{
                                                duration: 1.5,
                                                ease: "easeInOut",
                                                repeat: Infinity,
                                                repeatDelay: 1
                                            }}
                                            style={{
                                                opacity: isLoading ? 1 : 0,
                                                transition: 'opacity 0.3s ease'
                                            }}
                                        />

                                        <AnimatePresence mode="wait">
                                            {isLoading ? (
                                                <motion.div
                                                    key="loading"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center justify-center"
                                                >
                                                    <div className="w-5 h-5 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                                                </motion.div>
                                            ) : (
                                                <motion.span
                                                    key="button-text"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center justify-center gap-1.5 text-sm font-semibold"
                                                >
                                                    {isLogin ? 'Sign In' : 'Create Account'}
                                                    <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform duration-300" />
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.button>

                                {/* Sign up/in link */}
                                <motion.p
                                    className="text-center text-xs text-white/60 mt-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                                    <button
                                        type="button"
                                        onClick={onModeChange}
                                        className="relative inline-block group/switch"
                                    >
                                        <span className="relative z-10 text-orange-400 group-hover/switch:text-orange-300 transition-colors duration-300 font-medium">
                                            {isLogin ? 'Sign up' : 'Sign in'}
                                        </span>
                                        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-orange-400 group-hover/switch:w-full transition-all duration-300" />
                                    </button>
                                </motion.p>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
