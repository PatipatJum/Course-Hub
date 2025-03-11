'use client'

import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// ✅ กำหนด Type ของรีวิว
type Review = {
  id: string;
  course: { name: string };
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string };
};

// ฟังก์ชันสร้างค่า Hash จากชื่อคอร์ส
const hashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

// ฟังก์ชันสุ่มสีจากค่า Hash
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

export default function ReviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  // โหลดข้อมูลรีวิว
  const fetchAllReviews = async () => {
    try {
      const response = await axios.get('/api/review');
      setReviews(response.data);
      setFilteredReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // ค้นหาคอร์สตามชื่อ
  useEffect(() => {
    const filtered = reviews.filter((review) =>
      review.course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReviews(filtered);
  }, [searchTerm, reviews]);

  // เรียงลำดับรีวิวตามเรตติ้ง
  const sortedReviews = [...filteredReviews].sort((a, b) =>
    sortOrder === "desc" ? b.rating - a.rating : a.rating - b.rating
  );

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAllReviews();
    } else if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  return (
    status === 'authenticated' && session?.user && (
      <div className="mt-10 min-h-screen bg-[#FFFAE6] flex flex-col">
        <div className="mt-10 text-black w-full max-w-4xl mx-auto">
          <h1 className='text-5xl font-bold mb-2'>ค้นหารายวิชา</h1>
          <div className="relative w-full flex gap-2 items-center">
            <input 
              type="text" 
              placeholder="🔍 ค้นหาคอร์ส..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")} className="p bg-blue-500 text-white rounded-md">
              ดาว: {sortOrder === "desc" ? "มากไปน้อย" : "น้อยไปมาก"}
            </button>
          </div>

          <div className="mt-4">
            <h2 className="text-5xl font-bold mb-4">รีวิวทั้งหมด</h2>
            {sortedReviews.length > 0 ? (
              <ul>
                {sortedReviews.map((review) => (
                  <li key={review.id} className="mb-8 py-6 px-4 border-4 border-gray-900 rounded-lg shadow-none bg-white">
                    <div className="flex justify-between items-center">
                      <span className={`text-white px-3 py-1 rounded-full font-semibold text-[1.4rem] ${getColorFromHash(hashCode(review.course.name))}`}>
                        {review.course.name}
                      </span>
                      <div className="text-yellow-500 text-3xl text-[2.5rem] ml-auto">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700">{review.comment}</p>
                    <p className="mt-4 text-sm text-gray-500">รีวิวเมื่อ {new Date(review.createdAt).toLocaleString()}</p>
                    <div className="mt-2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">โดย {review.user.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>ไม่พบรีวิว</p>
            )}
          </div>
        </div>
      </div>
    )
  );
}
