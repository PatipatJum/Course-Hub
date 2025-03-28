import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const { userId } = await params;
        const user_id = parseInt(userId);

        if (isNaN(user_id)) {
            return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
        }

        const userData = await prisma.user.findUnique({
            where: { id: user_id },
            select: {
                id: true,
                name: true,
                image: true,
            }
        });

        return NextResponse.json(userData);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch userData" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const { userId } = params;
        const user_id = parseInt(userId);

        if (isNaN(user_id)) {
            return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
        }

        const { name, image } = await request.json();
        if (!name || !image) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user_id },
            data: { name, image },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update userData" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

