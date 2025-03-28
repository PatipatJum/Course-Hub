import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { log } from "console";
import { NextApiRequest, NextApiResponse } from "next";
import { PiKeyReturnBold } from "react-icons/pi";
import { tree } from "next/dist/build/templates/app-page";

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
    try {
        // await params next 13+ dynamic routing
        const { userId } = await params; 

        const user_id = parseInt(userId);

        if (isNaN(user_id)) {
            return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
        }

        const reviews = await prisma.review.findMany({
            where: { userId: user_id },
            select: {
                id: true,
                comment: true,
                rating: true,
                createdAt: true,
                user: {
                    select:{
                        name: true,
                    }
                },
                course:{
                    select:{
                        name: true,
                    }
                }
            }
        });

        return NextResponse.json(reviews);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { userId: string } }) {
    try {
        const { userId } = await params; 
        const user_id = parseInt(userId);


        const { course_name, rating, content } = await request.json();

        // console.log(user_id,course_name, rating, content);

        if (!user_id || !course_name || !rating || !content)
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

        const normalizedCourseName = course_name.trim().toLowerCase();

        let course = await prisma.course.findUnique({
            where: { name: normalizedCourseName },
        });

        if (!course) {
            course = await prisma.course.create({
                data: { name: normalizedCourseName }
            });
        }

        const review = await prisma.review.create({
            data: {
                userId: user_id,
                courseId: course.id,
                comment: content,
                rating: rating
            }
        });

        return NextResponse.json(review, { status: 201 });

    } catch (error) {
        console.error("Error adding review:", error);
        return NextResponse.json({ error: "Failed to add review" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { userId: string } }) {
    try {
        const user_id = parseInt(params.userId);
        const { reviewId, rating, comment } = await request.json();

        if (!user_id || !reviewId || !rating || !comment) { 
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const updatedReview = await prisma.review.updateMany({
            where: { userId: user_id, id: reviewId }, 
            data: { rating, comment },
        });

        if (updatedReview.count === 0) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Review updated successfully" });
    } catch (error) {
        console.error("Error updating review:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}



export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const review_id = searchParams.get("reviewId");

        if (!review_id) {
            return NextResponse.json({ error: "Missing review id" }, { status: 400 });
        }

        await prisma.review.delete({
            where: {
                id: Number(review_id),
            },
        });

        return NextResponse.json({ message: "Review deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting review:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}



