'use client'

import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

// ✅ กำหนด Type ของรีวิว
type Review = {
  id: string;
  course: { name: string };
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string };
};

export default function ReviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // ✅ กำหนด Type ของ State ให้เป็น Review[]
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [sortOrder, setSortOrder] = useState("desc");

  // โหลดข้อมูลรีวิว
  const fetchAllReviews = async () => {
    try {
      const response = await axios.get('/api/review');
      const data: Review[] = response.data; // ✅ ใช้ Type Assertion
      setReviews(data);
      setFilteredReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // ✅ เรียงรีวิวตามเรตติ้ง และใช้ Type Assertion
  const sortReviews = (order: string) => {
    const sorted = [...filteredReviews].sort((a: Review, b: Review) => 
      order === "desc" ? b.rating - a.rating : a.rating - b.rating
    );
    setFilteredReviews(sorted);
  };

  useEffect(() => {
    sortReviews(sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAllReviews();
    } else if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  return (
    status === 'authenticated' && session?.user && (
      <div className="mt-10 min-h-screen bg-bg-[#FFFAE6] flex flex-col">
        <div className="mt-10 text-black w-full max-w-4xl mx-auto">
          <h1 className='text-5xl font-bold mb-2'>ค้นหารายวิชา</h1>
          <div className="relative w-full flex gap-2 items-center">
            <input type="text" placeholder="🔍 ค้นหาคอร์ส..." className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")} className="p-2 bg-blue-500 text-white rounded-md">
              เรียงตามดาว: {sortOrder === "desc" ? "มากไปน้อย" : "น้อยไปมาก"}
            </button>
          </div>

          {/* แสดงข้อมูลรีวิว */}
          <div className="mt-4">
            <h2 className="text-5xl font-bold mb-4">รีวิวทั้งหมด</h2>
            {filteredReviews.length > 0 ? (
              <ul>
                {filteredReviews.map((review) => (
                  <li key={review.id} className="mb-8 py-6 px-4 border-4 border-gray-900 rounded-lg shadow-none bg-white">
                    <div className="flex justify-between items-center">
                      <span className="text-white px-3 py-1 rounded-full font-semibold text-[1.4rem] bg-blue-500">
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