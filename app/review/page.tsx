'use client'

import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

//function to generate a number from a string (course name)
const hashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return hash;
};

// Map the hash to a color
const getColorFromHash = (hash: number) => {
  const colors = [
    'bg-green-500', 'bg-blue-500', 'bg-red-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-lime-500', 'bg-cyan-500', 'bg-rose-400',
    'bg-sky-400', 'bg-emerald-400', 'bg-violet-500', 'bg-amber-500',
    'bg-fuchsia-500', 'bg-blue-700', 'bg-green-700', 'bg-red-700',
  ];
  

  // Use the modulus operator to map the hash to a valid index in the color array
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function Review() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reviews, setReviews] = useState([]) // เก็บข้อมูลรีวิว
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState("") // คำที่ใช้ค้นหาวิชา
  const [allCourses, setAllCourses] = useState([]) // รายชื่อวิชาทั้งหมด
  const [suggestions, setSuggestions] = useState([]) // รายชื่อวิชาที่กรองแล้ว
  const [filteredReviews, setFilteredReviews] = useState([]) // รีวิวที่กรองตามวิชา

  // โหลดข้อมูลรายวิชา
  const fetchAllCourses = async () => {
    try {
      const res = await axios.get("/api/course")
      setAllCourses(res.data)
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการโหลดวิชา:", error)
    }
  }

  // โหลดข้อมูลรีวิว
  const fetchAllReviews = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/review')
      if (!response.ok) throw new Error('Failed to fetch reviews')
      const data = await response.json()
      setReviews(data)
      setFilteredReviews(data) // โหลดรีวิวทั้งหมดเริ่มต้น
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setError('ไม่สามารถดึงข้อมูลรีวิวได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  // เลือกวิชา กรองรีวิว + ซ่อนคำแนะนำ
  const handleSelect = (selectedName: string) => {
    setQuery(selectedName)
    setSuggestions([]) // ซ่อนตัวเลือก
    filterReviews(selectedName)
  }

  // ค้นหาวิชา อัปเดตรายการคำแนะนำ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    if (value.trim() === "") {
      setSuggestions([])
      setFilteredReviews(reviews)
    } else {
      const filtered = allCourses.filter((item: any) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(filtered)
    }
  }

  // ฟังก์ชันสำหรับกรองรีวิว
  const filterReviews = (courseName: string) => {
    if (!courseName.trim()) {
      setFilteredReviews(reviews)
      return
    }
    const filtered = reviews.filter((review: any) =>
      review.course?.name.toLowerCase().includes(courseName.toLowerCase())
    )
    setFilteredReviews(filtered)
  }


  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchAllCourses()
      fetchAllReviews()
    }
  }, [status, router])

  return (
    status === 'authenticated' && session?.user && (
      <div className="mt-10 min-h-screen bg-bg-[#FFFAE6] flex flex-col">
        <div className="mt-10 text-black w-full max-w-4xl mx-auto">

          {/* ค้นหารายวิชา */}
          <h1 className='text-5xl font-bold mb-2'>ค้นหารายวิชา</h1>
          <div className="relative w-full flex gap-2">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="🔍 ค้นหาคอร์ส..."
                value={query}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {suggestions.length > 0 && (
                <ul className="absolute left-0 w-full bg-white border border-blue-700 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto z-10 mt-2">
                  {suggestions.map((item: any) => (
                    <li
                      className="text-lg p-3 hover:bg-blue-100 cursor-pointer text-black transition duration-200"
                      onClick={() => handleSelect(item.name)}
                      key={item.id}
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* แสดงข้อผิดพลาด */}
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* แสดงข้อมูลรีวิว */}
          <div className="mt-4">
            <h2 className="text-5xl font-bold mb-4">รีวิวทั้งหมด</h2>
            {isLoading ? (
              <p>กำลังโหลด...</p>
            ) : filteredReviews.length > 0 ? (
              <ul>
                {filteredReviews.map((review: any) => (
                  <li
                    key={review.id}
                    className="mb-8 py-6 px-4 border-4 border-gray-900 rounded-lg shadow-none bg-white"
                  >
                    <div className="flex justify-between items-center">
                    <span className={`text-white px-3 py-1 rounded-full font-semibold text-[1.4rem] ${getColorFromHash(hashCode(review.course?.name || ''))}`}>
                      {review.course?.name
                      ? review.course.name.charAt(0).toUpperCase() + review.course.name.slice(1)
                      : 'คอร์สที่ไม่รู้จัก'}
                    </span>
                      <div className="text-yellow-500 text-3xl text-[2.5rem] ml-auto">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700">{review.comment}</p>
                    <p className="mt-4 text-sm text-gray-500">
                      รีวิวเมื่อ {new Date(review.createdAt).toLocaleString()}
                    </p>
                    <div className="mt-2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        โดย {review.user?.name || 'ผู้ใช้ที่ไม่รู้จัก'}
                      </span>
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
  )
}