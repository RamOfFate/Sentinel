import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Record from "@/models/record";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const ENCRYPTED_PAYLOAD_REGEX = /^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/;
const logAuditError = (context: string, error: any) => {
  console.error(`[AUDIT_FAIL] ${context}:`, error?.message || "Unknown Error");
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") ?? 20), 1),
    100,
  );
  const skip = Math.max(Number(searchParams.get("skip") ?? 0), 0);

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
      pagination: { total, skip, limit, hasNext: total > skip + limit },
    });
  } catch (error) {
    logAuditError("GET_RECORDS", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const { tags, attributes, links } = await req.json();

    if (
      !Array.isArray(attributes) ||
      attributes.some(
        (attr) =>
          typeof attr?.label !== "string" || !Array.isArray(attr?.values),
      )
    ) {
      return NextResponse.json({ error: "Invalid structure" }, { status: 400 });
    }

    const isPayloadSecure = attributes.every((attr: any) => {
      const labelValid = ENCRYPTED_PAYLOAD_REGEX.test(attr.label);
      const valuesValid = attr.values.every((val: string) =>
        ENCRYPTED_PAYLOAD_REGEX.test(val),
      );
      return labelValid && valuesValid;
    });

    if (!isPayloadSecure) {
      return NextResponse.json({ error: "Insecure payload" }, { status: 400 });
    }

    const newRecord = await Record.create({
      userId: session.user.id,
      tags: tags || [],
      attributes,
      links: links || [],
      lastModified: new Date(),
    });

    return NextResponse.json({ id: newRecord._id }, { status: 201 });
  } catch (error) {
    logAuditError("POST_RECORD", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
