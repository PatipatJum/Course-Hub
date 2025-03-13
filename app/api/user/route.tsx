import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const userData = await prisma.user.findMany({
            select:{
                id: true,
                name: true,
                image: true,
            }
        });
        return NextResponse.json(userData);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch userData" }, { status: 500 });
    }
}
