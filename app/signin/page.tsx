"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Agbalumo } from 'next/font/google';
import { EyeIcon, EyeOffIcon } from "lucide-react";

const agbalumo = Agbalumo({ subsets: ['latin'], weight: "400" });

const Divider = () => {
    return (
        <div style={{ display: "flex", alignItems: "center", textAlign: "center" }}>
            <hr style={{ flex: 1, border: "none", height: "1px", backgroundColor: "white" }} />
            <span style={{ padding: "0 10px" }}>or</span>
            <hr style={{ flex: 1, border: "none", height: "1px", backgroundColor: "white" }} />
        </div>
    );
};

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
        <div className="flex flex-col min-h-screen items-center justify-center dark">
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

                <Divider />

                <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: "/review" })}
                    className="w-full flex items-center justify-center gap-3 p-3 bg-[#FFA500] text-white font-bold italic rounded-full shadow-xl hover:bg-[#FF8C00] transition duration-300"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 488 512"
                        width="24"
                        height="24"
                        fill="white"
                    >
                        <path
                            d="M488 261.8C488 403.3 391.1 504 248 504 110.9 504 0 393.1 0 256S110.9 8 248 8c66.2 0 120.9 21.5 163.4 57L336 133.3C304.1 108.4 277.2 96 248 96c-81 0-146.8 66.5-146.8 146.8S167 389.6 248 389.6c73.5 0 120.7-47.5 126.8-113.9H248V192h240c2.2 11.5 3.3 23.4 3.3 36z"
                        />
                    </svg>
                    Sign in with Google
                </button>

                {message && (
                    <p className={`mt-4 text-sm font-medium ${message.startsWith("✅") ? "text-green-500" : "text-red-500"}`}>
                        {message}
                    </p>
                )}

            </div>
        </div>
    );
}