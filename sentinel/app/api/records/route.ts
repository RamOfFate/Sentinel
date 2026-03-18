import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Record from "@/models/record";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get("limit") ?? 20);
  const skip = Number(searchParams.get("skip") ?? 0);
  if (
    !Number.isInteger(limit) ||
    !Number.isInteger(skip) ||
    limit < 1 ||
    limit > 100 ||
    skip < 0
  ) {
    return NextResponse.json(
      { error: "Invalid pagination params" },
      { status: 400 },
    );
  }

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

const ENCRYPTED_PAYLOAD_REGEX = /^[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { tags, attributes, links } = await req.json();

    if (
      (tags !== undefined &&
        (!Array.isArray(tags) ||
          tags.some((tag: unknown) => typeof tag !== "string"))) ||
      (links !== undefined &&
        (!Array.isArray(links) ||
          links.some(
            (link: any) =>
              !link ||
              typeof link !== "object" ||
              typeof link.relationship !== "string" ||
              typeof link.targetId !== "string",
          )))
    ) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(attributes) ||
      attributes.some(
        (attr: any) =>
          typeof attr?.label !== "string" || !Array.isArray(attr?.values),
      )
    ) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 },
      );
    }

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
    const err = error as Error;
    console.error("POST_RECORD_ERROR", {
      name: err.name,
      message: err.message,
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
