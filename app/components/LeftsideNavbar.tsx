"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaUser, FaPlus, FaHeart, FaFacebook } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";

export default function LeftsideNavbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    if (pathname === "/signin" || pathname === "/signup") {
        return null;
    }

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        toggleSidebar()
        router.push("/signin");
    };

    return (
        <div
            className={`h-screen w-48 bg-gray-900 text-white flex flex-col items-center pt-8 space-y-6 fixed left-0 top-16 z-40 shadow-lg transition-transform duration-300 ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
            <Link href="/review" className="text-white text-1xl p-4 rounded-md transition hover:bg-gray-700 flex items-center gap-3">
                <FaUser />
                <span>My Feed</span>
            </Link>
            <Link href="/review/addingcourse" className="text-white text-1xl p-4 rounded-md transition hover:bg-gray-700 flex items-center gap-3">
                <FaPlus />
                <span>Adding Course</span>
            </Link>
            <Link href="/review" className="text-white text-1xl p-4 rounded-md transition hover:bg-gray-700 flex items-center gap-3">
                <FaHeart />
                <span>Favorite Review</span>
            </Link>
            <Link href="/setting" className="text-white text-2xl p-4 rounded-md transition hover:bg-gray-700 flex items-center gap-3">
                <IoSettings/>
                <span>Setting</span>
            </Link>
            <Link
                href="https://www.facebook.com/groups/1265420194707456"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-2xl p-4 rounded-md transition hover:bg-gray-700 flex items-center gap-3"
            >
                <FaFacebook />
            </Link>
            <button
                onClick={handleSignOut}
                className="mx-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md text-base transition-colors duration-200"
            >
                Sign out
            </button>
        </div>
    );
}