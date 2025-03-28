'use client'

import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Agbalumo } from 'next/font/google';

//add front
const agbalumo = Agbalumo({ subsets: ['latin'], weight: '400' });

type Review = {
  id: string;
  course: { name: string };
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string; id: number };
};

//----------------------------------กำหนดสีชื่อรีวิว------------------------------------------------
const hashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
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
//------------------------------------------------------------------------------------


export default function ReviewPage() {

  //----------------------------------------State Management with useState--------------
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  //-----------------------------------------------------------------------------------

  //ระบบเรียงคะแนนรายวิชา
  const sortedReviews = [...filteredReviews].sort((a, b) =>
    sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating
  );

  //ดึงข้อมูลรีวิวทั้งหมด
  const fetchAllReviews = async () => {
    try {
      const response = await axios.get('/api/review');
      setReviews(response.data);
      setFilteredReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };


  //---------------------------------------------------------------------------------
  useEffect(() => {
    const filtered = reviews.filter((review) =>
      review.course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReviews(filtered);
  }, [searchTerm, reviews]);


  useEffect(() => {
    if (status === 'authenticated') {
      fetchAllReviews();
    } else if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);
  //---------------------------------------------------------------------------------

  return (
    //มีการloginแล้ว
    status === 'authenticated' && session?.user && (
      <div className="mt-20 min-h-screen flex flex-col items-center">
        <h1 className={`${agbalumo.className} text-[8rem] font-extrabold text-black drop-shadow-2xl italic`}>Course Hub</h1>
        <div className="mt-7 text-black w-full max-w-4xl">
          {/* ค้นหารายวิชา */}
          <h1 className='text-3xl font-bold mb-2 text-left text-[#FFA500] italic'>ค้นหารายวิชา</h1>
          <div className="relative w-full flex gap-2 items-center">
            <input
              type="text"
              placeholder="🔍 ค้นหาคอร์ส..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* ปุ่มเรียงคะแนนรายวิชา */}
            <button onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} className="px-4 py-2 bg-[#FFA500] text-white rounded-md">
              ดาว: {sortOrder === 'desc' ? 'มากไปน้อย' : 'น้อยไปมาก'}
            </button>
          </div>
          {/* แสดงรีวิวทั้งหมด */}
          <div className="mt-6">
            <h2 className="text-3xl font-bold mb-6 text-center text-[#FFA500] italic">รีวิวทั้งหมด</h2>
            {sortedReviews.length > 0 ? (
              <ul>
                {sortedReviews.map((review) => (
                  <li key={review.id} className="mb-8 py-6 px-4 border-4 border-gray-900 rounded-lg shadow-md bg-white">
                    <div className="flex justify-between items-center">
                      <span className={`text-white px-4 py-2 rounded-full font-semibold text-[1.5rem] ${getColorFromHash(hashCode(review.course.name))}`}>
                        {review.course?.name
                          ? review.course.name.charAt(0).toUpperCase() + review.course.name.slice(1)
                          : 'unknown course'}
                      </span>
                      <div className="text-yellow-500 text-3xl ml-auto">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700 text-lg">{review.comment}</p>
                    <p className="text-sm text-gray-500">
                      รีวิวเมื่อ{' '}
                      {new Date(review.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <div className="mt-2">
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold"
                        // query parameters
                        onClick={() => router.push(`/profile?id=${review.user.id}&user=${encodeURIComponent(review.user.name)}`)}
                      >โดย {review.user.name}</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-600 text-xl">กำลังโหลดข้อมูล...</p>
            )}
          </div>
        </div>
      </div>
    )
  );
}
