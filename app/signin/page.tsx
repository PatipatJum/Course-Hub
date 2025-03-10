"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Agbalumo } from 'next/font/google';
import { EyeIcon, EyeOffIcon } from "lucide-react";

const agbalumo = Agbalumo({ subsets: ['latin'], weight: "400" });

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setMessage("❌ Email or password is incorrect.");
                return;
            }

            setMessage("✅ Login successful!");
            setTimeout(() => {
                router.replace("/review");
            }, 500);
        } catch (error) {
            console.error("Error occurred logging in.", error);
            setMessage("❌ Please try again.");
        }
    };

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-[#FFFAE6]">
            <h1 className={`${agbalumo.className} text-[90px] font-extrabold text-black mb-8 drop-shadow-xl italic`}>Course Hub</h1>
            <div className="bg-black p-10 rounded-3xl shadow-2xl w-full max-w-[450px] text-center">
                <h2 className="text-2xl font-semibold text-[#FFFAE6] italic mb-6">Sign in</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <input
                            type="email"
                            placeholder="Username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-[#FFFAE6] text-gray-600 font-semibold italic rounded-full focus:outline-none"
                            required
                        />
                    </div>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-[#FFFAE6] text-gray-600 font-semibold italic rounded-full focus:outline-none"
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-4 flex items-center text-gray-600 hover:text-gray-800"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOffIcon className="h-6 w-6" />
                            ) : (
                                <EyeIcon className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#FFA500] text-white font-bold italic py-3 rounded-full shadow-lg hover:bg-[#FF8C00] transition duration-300"
                    >
                        Login
                    </button>
                </form>
                <p
                    className="mt-6 text-[#FFA500] font-bold italic cursor-pointer hover:text-[#FF8C00] transition duration-300"
                    onClick={() => router.push("/signup")}
                >
                    Sign up
                </p>

                {message && (
                    <p className={`mt-4 text-sm font-medium ${message.startsWith("✅") ? "text-green-500" : "text-red-500"}`}>
                        {message}
                    </p>
                )}
                
            </div>
        </div>
    );
}