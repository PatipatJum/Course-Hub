'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Agbalumo } from 'next/font/google';

const agbalumo = Agbalumo({ subsets: ['latin'], weight: "400" });

export default function RegisterForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [message, setMessage] = useState("");
    const [isRegistered, setIsRegistered] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const result = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (result?.ok) {
                setIsRegistered(true);
                return;
            }
            setMessage("❌ Email or password is incorrect.");
        } catch (error) {
            console.log('error: ', error);
            setMessage("❌ Error occurred, Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#FFFAE6]">
            <div className="bg-black text-white p-8 rounded-lg shadow-lg w-[450px] text-center border-4 border-black relative">
                <h1 className={`${agbalumo.className} text-5xl font-bold italic drop-shadow-lg mb-6 text-white`}>Sign up</h1>

                {isRegistered ? (
                    <div className="flex flex-col items-center">
                        <h2 className="text-2xl font-bold text-green-600 mt-4">✅ Success!</h2>
                        <button 
                            className="mt-5 bg-white text-black font-bold py-2 px-4 rounded-full shadow-lg border-2 border-white hover:bg-gray-800 hover:text-white transition"
                            onClick={() => router.push("/signin")}
                        >
                            Back to login page
                        </button>
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleRegister} className="space-y-4 text-left flex flex-col items-center">
                            <label className="font-bold italic text-lg block text-white w-full">
                                Username :
                            </label>
                            <input
                                className="w-full px-4 py-3 bg-white text-black border-2 border-white rounded-full shadow-md italic focus:outline-none mb-2"
                                type="text"
                                name="name"
                                onChange={handleChange}
                                required
                            />

                            <label className="font-bold italic text-lg block text-white w-full">
                                Password : <span className="text-gray-400 text-sm">Enter at least 6 characters.</span>
                            </label>
                            <input
                                className="w-full px-4 py-3 bg-white text-black border-2 border-white rounded-full shadow-md italic focus:outline-none mb-2"
                                type="password"
                                name="password"
                                onChange={handleChange}
                                required
                            />

                            <label className="font-bold italic text-lg block text-white w-full">
                                E-mail :
                            </label>
                            <input
                                className="w-full px-4 py-3 bg-white text-black border-2 border-white rounded-full shadow-md italic focus:outline-none mb-6"
                                type="email"
                                name="email"
                                onChange={handleChange}
                                required
                            />

                            <button
                                type="submit"
                                className="w-40 bg-[#FFA500] text-white font-bold italic py-3 rounded-full shadow-lg hover:bg-[#FF8C00] transition text-center mt-4"
                            >
                                Create account
                            </button>
                        </form>

                        <button 
                            className="mt-5 bg-white text-black font-bold italic py-2 px-5 rounded-full shadow-lg border-2 border-white hover:bg-gray-800 hover:text-white transition"
                            onClick={() => router.push("/signin")}
                        >
                            Back
                        </button>
                    </>
                )}

                {message && (
                    <p className={`mt-3 text-sm font-medium ${message.startsWith("✅") ? "text-green-500" : "text-red-500"}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
