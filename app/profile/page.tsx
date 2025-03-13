"use client";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

interface UserData {
  id: string;
  name: string;
  image?: string;
}

interface Review {
  id: string;
  comment: string;
  course: { name: string };
  user: { id: string; name: string };
  rating: number;
  createdAt: string;
}

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [userEdit, setUserEdit] = useState<UserData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myProfile, setMyProfile] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (status === "authenticated" && userId) {
      setMyProfile(session?.user?.id === userId);
      fetchUserData();
      fetchReviews();
    }
  }, [status, userId, session, router]);

  const fetchUserData = async () => {
    if (!userId) return;
    try {
      const { data } = await axios.get<UserData>(`/api/user/${userId}`);
      setUserData(data);
      setUserEdit(data);
      setImageError(false); 
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchReviews = async () => {
    if (!userId) return;
    try {
      const { data } = await axios.get<Review[]>(`/api/review/${userId}`);
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const updateProfile = async () => {
    if (!userId || !userEdit) return;
    try {
      await axios.put(`/api/user/${userId}`, {
        name: userEdit.name,
        image: userEdit.image,
      });
      setShowPopup(false);
      fetchUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const defaultImage = "https://www.worldsbestcatlitter.com/wp-content/uploads/2019/12/02_coughing-cat-meme.jpg";

  if (status === "loading") return <p className="text-center text-gray-500">Loading session...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {userData ? (
        <div className="flex flex-col items-center space-y-4">
          <img
            src={imageError || !userData.image ? defaultImage : userData.image}
            alt={userData.name}
            className="w-32 h-32 rounded-full border-4 border-gray-300 object-cover"
            onError={handleImageError}
          />
          <h1 className="text-2xl font-bold text-black">ชื่อ: {userData.name}</h1>
          {myProfile && (
            <button
              onClick={() => setShowPopup(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mt-2"
            >
              แก้ไขโปรไฟล์
            </button>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-center">Loading user data...</p>
      )}

      {showPopup && (
        <div className="text-black fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">แก้ไขโปรไฟล์</h2>
            <label className="block mb-2 font-medium">ชื่อ</label>
            <input
              type="text"
              value={userEdit?.name || ""}
              onChange={(e) => setUserEdit((prev) => prev ? { ...prev, name: e.target.value } : null)}
              className="border p-2 rounded-lg w-full mb-4"
            />
            <label className="block mb-2 font-medium">รูปโปรไฟล์ (URL)</label>
            <input
              type="text"
              value={userEdit?.image || ""}
              onChange={(e) => setUserEdit((prev) => prev ? { ...prev, image: e.target.value } : null)}
              className="border p-2 rounded-lg w-full mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowPopup(false)} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg">ยกเลิก</button>
              <button onClick={updateProfile} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 mb-4 flex items-center space-x-2">
        <span className="text-2xl font-semibold text-black">📝 รีวิวทั้งหมด:</span>
        <span className="text-2xl font-bold text-blue-600">{reviews.length}</span>
      </div>

      {reviews.length > 0 ? (
        <ul className="grid gap-4">
          {reviews.map((review) => (
            <li key={review.id} className="p-6 border-4 border-gray-900 rounded-lg shadow-lg bg-white">
              <div className="flex justify-between items-center">
                <span className="text-white px-3 py-1 rounded-full font-semibold text-lg bg-blue-500">{review.course.name}</span>
                <div className="text-yellow-500 text-3xl ml-auto">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
              </div>
              <p className="mt-2 text-gray-700">{review.comment}</p>
              <p className="mt-4 text-sm text-gray-500">🕒 รีวิวเมื่อ {new Date(review.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-500 mt-6 p-6 border border-gray-300 rounded-lg">
          <p className="text-lg">ยังไม่มีรีวิว</p>
        </div>
      )}
    </div>
  );
}