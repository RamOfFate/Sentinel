// @/app/api/user/update-name/route.ts
import dbConnect from "@/lib/mongodb";
import { nameSchema } from "@/lib/validations/auth";
import { NextResponse } from "next/server";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const validation = nameSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 },
      );
    }

    await dbConnect();
    await User.findOneAndUpdate(
      { email: session.user.email },
      { name: validation.data.name }, // Use the parsed/cleaned data
    );

    return NextResponse.json({ message: "Update Successful" });
  } catch (err) {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
