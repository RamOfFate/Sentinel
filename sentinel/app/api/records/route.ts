import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Record from "@/models/record";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);

  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = parseInt(searchParams.get("skip") || "0");

  try {
    await dbConnect();

    const records = await Record.find({ userId: session.user.id })
      .sort({ lastModified: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Record.countDocuments({ userId: session.user.id });

    return NextResponse.json({
      records,
      pagination: {
        total,
        skip,
        limit,
        hasNext: total > skip + limit,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 },
    );
  }
}

const ENCRYPTED_PAYLOAD_REGEX = /^[a-zA-Z0-9/+=]+:[a-zA-Z0-9/+=]+$/;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { tags, attributes, links } = await req.json();

    const isPayloadSecure = attributes.every((attr: any) => {
      const labelIsEncrypted = ENCRYPTED_PAYLOAD_REGEX.test(attr.label);
      const valuesAreEncrypted = attr.values.every((val: string) =>
        ENCRYPTED_PAYLOAD_REGEX.test(val),
      );
      return labelIsEncrypted && valuesAreEncrypted;
    });

    if (!isPayloadSecure) {
      return NextResponse.json(
        { error: "Insecure payload format" },
        { status: 400 },
      );
    }

    const newRecord = await Record.create({
      userId: session.user.id,
      tags: tags || [],
      attributes,
      links: links || [],
      lastModified: new Date(),
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("POST_RECORD_ERROR", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
