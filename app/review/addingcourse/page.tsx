'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Star } from "lucide-react";
import axios from "axios";

interface Review {
    id: string;
    comment: string;
    course: {
        name: string;
    };
    user: {
        name: string;
    };
    rating: number;
    createdAt: string;
};

interface newReview {
    newNameCourse: string;
    newContent: string;
    newRating: number;
};

interface Course {
    id: string;
    name: string;
};

interface StarRatingProps {
    rating: number;
    setRating: (rating: number) => void;
};



export default function Page() {

    //----------------------------------------State Management with useState------------------------------------------------------------
    const router = useRouter();
    const { data: session, status } = useSession();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newReview, setNewReview] = useState({
        newNameCourse: "",
        newContent: "",
        newRating: 0,
    })

    const [countdown, setCountdown] = useState(3);
    const [showModal, setShowModal] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [dataEdit, setDataEdit] = useState({
        editCourseId: "",
        editCourse: "",
        editContent: "",
        editRating: 0
    })

    const [allCourse, setallCourse] = useState<Course[]>([]);
    const [suggestions, setSuggestions] = useState<Course[]>([])
    //---------------------------------------------------------------------------------------------------------------------------------
    
    
    //-------------------------------------------------ระบบดาว-------------------------------------------------------------------------
    //ระบบคะแนนดาว
    const StarRating = ({ rating, setRating }: StarRatingProps) => {
        return (
            <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`cursor-pointer ${i < rating ? "fill-yellow-400 stroke-yellow-400" : "fill-gray-300 stroke-gray-300"
                            }`}
                        onClick={() => setRating(i + 1)}
                        size={60}
                    />
                ))}
                <button
                    onClick={() => setRating(0)}
                    className="bg-red-500 py-[0.1rem] px-[0.3rem] rounded-lg text-[1.5rem]"
                >
                    Clear
                </button>
            </div>
        );
    };

    const handleRatingChange = (value: number) => {
        setNewReview({ ...newReview, newRating: value });
    };

    const handleRatingEdit = (value: number) => {
        setDataEdit({ ...dataEdit, editRating: value });
    };

    //----------------------------------------------------------------------------------------------------------------------------



    //-----------------------------ดึงข้อมูลจากDatabase-------------------------------------------
    // fatchdata
    const fetchReview = async () => {
        if (!session?.user?.id) {
            console.warn("Session is not ready or does not have a user ID.");
            return;
        }

        try {
            const response = await axios.get<Review[]>(`/api/review/${session.user.id}`);
            console.log("✅ Pulled reviews:", response.data);
            setReviews(response.data);
        } catch (error) {
            console.error("❌ Error occurred while fetching reviews:", error);
        }
    };
    //ดึงข้อมูลรายวิชาทั้งหมด
    const fetchAllcourse = async () => {
        try {
            const response = await axios.get<Course[]>("/api/course");
            setallCourse(response.data);
        } catch (error) {
            console.error("❌ Error occurred while fetching reviews:", error);
        }
    };
    //----------------------------------------------------------------------------------------

    //ลบ รีวิวที่ต้องการจาก id review
    const handleDelete = async (Id: string) => {
        try {
            if (!session?.user?.id) {
                console.warn("Session is not ready or does not have a user ID.");
                return;
            }
            await axios.delete(`/api/review/${session.user.id}?reviewId=${Id}`);
            fetchReview();
        }
        catch (error) {
            console.error(" Error deleting the review: ", error);
        }
    }
    
    //----------------------------------------จัดการแทบค้นหารายวิชา---------------------------------------------
    //มีการพิมในช่องค้นหารายวิชา
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewReview(prevState => ({ ...prevState, [name]: value }));

        // ถ้ากรอกชื่อคอร์ส
        if (name === "newNameCourse") {
            if (value.trim() === "") {
                setSuggestions([]);  // ถ้าชื่อคอร์สว่าง ก็ให้ซ่อนคำแนะนำ
            } else {
                // กรองชื่อคอร์สที่ตรงกับค่าที่พิมพ์
                const filteredSuggestions = allCourse.filter(course =>
                    course.name && course.name.toLowerCase().includes(value.toLowerCase())
                );

                setSuggestions(filteredSuggestions);
                // แสดงผลลัพธ์ที่กรองแล้ว
            }
        }
    };
    //กดเลือกรายวิชา
    const handleSelect = (courseName: string) => {
        setNewReview(prevState => ({ ...prevState, newNameCourse: courseName }));
        setSuggestions([]);
    }
    //----------------------------------------------------------------------------------------------------------

    

    //---------------------------------แก้ไขข้อมูล รีวิว------------------------------------------------------------
    
    //เตรียมข้อมูลสำหรับหน้าแก้ไขreview
    const handleEditModal = (review: Review) => {
        setDataEdit({
            editCourseId: review.id,
            editCourse: review.course.name,
            editContent: review.comment,
            editRating: review.rating
        });
        //ทำให้เป็น true เพื่อแสดงpop up แก้ไมข้อมูล
        setShowEditModal(true);
    };
    //เตรียมข้อมูลที่ผ่านการแก้ไข
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDataEdit((prev) => ({
            ...prev,
            [name]: name === "editRating" ? Number(value) : value,
        }));
    }
    //กดยืนยันการแก้ไข
    const handleSubmitEdit  = async (id: string) => {
        try {
            if (!session?.user?.id) {
                console.warn("Session is not ready or does not have a user ID.");
                return;
            }

            if (Number(dataEdit.editRating) > 5) {
                dataEdit.editRating = 5;
            }
            else if (Number(dataEdit.editRating) < 0) {
                dataEdit.editRating = 0;
            }
            await axios.put(`/api/review/${session.user.id}`, {
                reviewId: id,
                rating: dataEdit.editRating,
                comment: dataEdit.editContent
            });

            //fetch data again
            fetchReview();
            setShowEditModal(false);
            setDataEdit({
                editCourseId: id,
                editCourse: "",
                editContent: "",
                editRating: 0
            });
        }
        catch (error) {
            console.error("Error updating the review: ", error);
        }
    };
    //-----------------------------------------------------------------------------------------------
    
    //กดยืนยันเพิ่มรีวิว
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!session?.user?.id) {
            console.warn("Session is not ready or does not have a user ID.");
            return;
        }
        
        try {
            if (Number(newReview.newRating) > 5) {
                newReview.newRating = 5;
            }
            else if (Number(newReview.newRating) < 0) {
                newReview.newRating = 0;
            }
            await axios.post(`/api/review/${session.user.id}`, {
                course_name: newReview.newNameCourse,
                rating: Number(newReview.newRating),
                content: newReview.newContent,
            });
            
            setShowModal(true);
            setCountdown(3);
            setNewReview({
                newNameCourse: "",
                newContent: "",
                newRating: 0,
            })

            fetchReview();
            fetchAllcourse();
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev === 1) {
                        clearInterval(timer);
                        setShowModal(false);
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        catch (error) {
            console.error("Error saving the review: ", error);
        }
    }

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            router.push("/signin");
        } else if (status === "authenticated" && session?.user?.id) {
            console.log("Fetching reviews...");
            //ดึงข้อมูลรายวิชา และ รีวิว
            fetchAllcourse();
            fetchReview();
        }
    }, [status, session?.user?.id]);

    return (
        status === 'authenticated' &&
        session?.user && (
            <div className=" mt-20 bg-white p-8 max-w-4xl mx-auto rounded-lg">

                {/* input form */}
                <div className="max-w-4xl mx-auto  p-6 bg-gray-900 shadow-lg rounded-lg text-white">
                    <h1 className="text-[4rem] font-bold text-center mb-6">✍️ Write my review</h1>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* course */}
                        <div className="relative">
                            <label className="block text-lg font-semibold mb-3 text-[2rem]">📚 Course name</label>
                            <input
                                className="w-full p-3 border border-gray-500 rounded-md bg-white text-black focus:ring-2 focus:ring-blue-600 text-[1rem]"
                                type="text"
                                placeholder="Enter the course name"
                                name="newNameCourse"
                                value={newReview.newNameCourse}
                                onChange={handleChange}
                            />
                            {/* แสดงการค้นหารายวิชา */}
                            {suggestions.length > 0 && (
                                <ul className="absolute left-0 w-full bg-white border border-blue-700 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto z-10 mt-2">
                                    {suggestions.map((course: Course) => (
                                        <li
                                            key={course.id}
                                            className="text-lg p-3 hover:bg-blue-100 cursor-pointer text-black transition duration-200"
                                            onClick={() => handleSelect(course.name)}
                                        >
                                            {course.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>


                        {/* content */}
                        <div>
                            <label className="block text-lg font-semibold mb-3 text-[2rem]">📝 Comment</label>
                            <textarea
                                className="w-full p-3 border border-gray-500 rounded bg-white text-black h-40 "
                                placeholder="Write your review here..."
                                name="newContent"
                                value={newReview.newContent}
                                onChange={handleChange}

                            />
                        </div>
                        {/* rating */}
                        <div>
                            <label className="block text-lg font-semibold mb-1">⭐ Rate  (0-5)</label>
                            <StarRating rating={newReview.newRating} setRating={handleRatingChange} />
                        </div>
                        <button type="submit"
                            className="bg-blue-700 hover:bg-blue-800 text-xl font-bold p-3 text-center w-full text-white rounded transition duration-200"
                        >
                            ➕ Add Review
                        </button>
                    </form>
                </div>

                {/* show myReview */}
                <h2 className="mt-5 text-3xl font-bold text-gray-800 mb-4"> My review</h2>
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-4 mb-4 shadow-md">
                            <div className="flex items-center mb-2">
                                <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold text-[1.5rem]">
                                    {review.course?.name
                                        ? review.course.name.charAt(0).toUpperCase() + review.course.name.slice(1)
                                        : 'unknown course'}
                                </span>
                                <div className="text-yellow-500 text-3xl ml-auto">
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </div>
                            </div>

                            <p className="text-gray-700 text-base mb-2">{review.comment}</p>

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

                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                โดย {review.user?.name || 'unknown user'}
                            </span>

                            {/* Buttons */}
                            <div className="flex justify-center mt-2">
                                <button
                                    className="rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white py-1 mx-2 w-1/2"
                                    onClick={() => handleEditModal(review)}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    className="rounded-lg bg-red-500 hover:bg-red-600 text-white py-1 mx-2 w-1/2"
                                    onClick={() => handleDelete(review.id)}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-center">No reviews </p>
                )}


                {/* Modal inputdata Popup */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                            <h2 className="text-xl font-bold text-green-600">✅ Review has been recorded !</h2>
                            <p className="text-gray-600">Window will close in {countdown} second...</p>
                        </div>
                    </div>
                )}

                {/* Modal Edit Popup */}
                {showEditModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white p-6 rounded-2xl shadow-xl w-[700px] h-[500px] max-w-[90%] transform transition-all duration-300">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Edit a review</h2>

                            <label className="block text-gray-700 font-semibold">Course name:</label>
                            <p className="bg-gray-100 text-gray-800 p-2 rounded-lg">{dataEdit.editCourse}</p>

                            <label className="block mt-4 text-gray-700 font-semibold">Your review</label>
                            <textarea
                                className="w-full p-3 border border-gray-300 rounded-lg mt-2 text-black focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                                name="editContent"
                                value={dataEdit.editContent}
                                onChange={handleEditChange}
                                rows={4}
                            ></textarea>

                            <label className="block mt-4 text-gray-700 font-semibold">⭐ Rate(0-5)</label>
                            <StarRating rating={dataEdit.editRating} setRating={handleRatingEdit} />

                            <div className="flex justify-between mt-6">
                                <button
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200 mx-1"
                                    onClick={() => handleSubmitEdit(dataEdit.editCourseId)}
                                >
                                    ✅ okay
                                </button>
                                <button
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 mx-1"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    ❌ cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    );
}
`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               `