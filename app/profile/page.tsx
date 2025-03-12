"use client";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface UserData {
  id: string;
  name: string;
  image?: string;
}

interface Review {
  id: string;
  comment: string;
  course: {
    name: string;
  };
  user: {
    id: string;
    name: string;
  };
  rating: number;
  createdAt: string;
}

const hashCode = (str: string) => {
  return str.split("").reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
};

const getColorFromHash = (hash: number) => {
  const colors = [
    'bg-green-500', 'bg-blue-500', 'bg-red-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-lime-500', 'bg-cyan-500', 'bg-rose-400',
    'bg-sky-400', 'bg-emerald-400', 'bg-violet-500', 'bg-amber-500',
    'bg-fuchsia-500', 'bg-blue-700', 'bg-green-700', 'bg-red-700',
  ];
  return colors[Math.abs(hash) % colors.length];
};

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  const fetchUserData = async () => {
    if (!userId) return;
    try {
      const response = await axios.get<UserData>(`/api/user/${userId}`);
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchReview = async () => {
    if (!userId) return;
    try {
      const response = await axios.get<Review[]>(`/api/review/${userId}`);
      setReviews(response.data);
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการดึงรีวิว:", error);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (status === "authenticated" && userId) {
      fetchUserData();
      fetchReview();
    }
  }, [status, userId, router]);

  if (status === "loading") return <p className="text-center text-gray-500">Loading session...</p>;


  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* ส่วนข้อมูลโปรไฟล์ */}
      {userData ? (
        <div className="flex items-center space-x-4 overflow-hidden bg-gray-200 p-[10px] rounded-lg">
            <img
            src={userData.image || "https://www.worldsbestcatlitter.com/wp-content/uploads/2019/12/02_coughing-cat-meme.jpg"}
            alt={userData.name}
            className="w-20 h-20 rounded-full border-2 border-gray-300"
          />
          <h1 className="text-2xl font-bold text-black">ชื่อ: {userData.name}</h1>
        </div>
      ) : (
        <p className="text-gray-500 text-center">Loading user data...</p>
      )}

      {/* จำนวนรีวิว */}
      <div className="mt-6 mb-4 flex items-center space-x-2">
        <span className="text-2xl font-semibold text-black">📝 รีวิวทั้งหมด:</span>
        <span className="text-2xl font-bold text-blue-600">{reviews.length}</span>
      </div>

      {/* รายการรีวิว */}
      {reviews.length > 0 ? (
        <ul className="grid gap-4">
          {reviews.map((review) => (
            <li key={review.id} className="p-6 border-4 border-gray-900 rounded-lg shadow-lg bg-white">
              <div className="flex justify-between items-center">
                <span className={`text-white px-3 py-1 rounded-full font-semibold text-lg ${getColorFromHash(hashCode(review.course.name))}`}>
                  {review.course.name}
                </span>
                <div className="text-yellow-500 text-3xl ml-auto">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              <p className="mt-2 text-gray-700">{review.comment}</p>
              <p className="mt-4 text-sm text-gray-500">
                🕒 รีวิวเมื่อ {new Date(review.createdAt).toLocaleString()}
              </p>
              <div className="mt-4">
                <button
                  className="bg-blue-500 hover:bg-blue-600 transition-all text-white px-3 py-1 rounded-full text-sm font-semibold"
                >
                  ✨ โดย {review.user.name}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-500 mt-6 p-6 border border-gray-300 rounded-lg">
          <p className="text-lg">ยังไม่มีรีวิว</p>
          <p className="text-sm">รีวิวของคุณจะแสดงที่นี่</p>
        </div>
      )}
    </div>
  );
}
