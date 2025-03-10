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
    const [isRegistered, setIsRegistered] = useState(false); // ตรวจสอบว่าสมัครสำเร็จหรือไม่

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
                setIsRegistered(true); // ซ่อนฟอร์ม
                return;
            }
            setMessage("❌ Email or password is incorrect.");
        } catch (error) {
            console.log('error: ', error);
            setMessage("❌ Error occurred, Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen dark">
            <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg w-96 text-center">
                <h1 className="text-5xl font-bold text-orange-400">Course-hub</h1>

                {/* ถ้าสมัครเสร็จ ให้แสดงข้อความสำเร็จแทนฟอร์ม */}
                {isRegistered ? (
                    <div className="flex flex-col items-center">
                        <h2 className="text-2xl font-bold text-green-400 mt-4">✅ Success!</h2>
                        <button 
                            className="mt-5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                            onClick={() => router.push("/signin")}
                        >
                            ↩️ Back to login page.
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Sign up</h2>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <input
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white italic focus:outline-none focus:ring-2 focus:ring-blue-400"
                                type="email"
                                name="email"
                                placeholder="📧 Email"
                                onChange={handleChange}
                                required
                            />
                            <input
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white italic focus:outline-none focus:ring-2 focus:ring-blue-400"
                                type="text"
                                name="name"
                                placeholder="👤 Name"
                                onChange={handleChange}
                                required
                            />
                            <input
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white italic focus:outline-none focus:ring-2 focus:ring-blue-400"
                                type="password"
                                name="password"
                                placeholder="🔑 Password"
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition duration-200"
                            >
                                ✅ Sign up
                            </button>
                        </form>
                        <button 
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded transition duration-200 mt-5"
                            onClick={() => router.push("/signin")}
                        >
                            ↩️ Back
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