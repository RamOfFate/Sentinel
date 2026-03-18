import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Record from "@/models/record";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const ENCRYPTED_PAYLOAD_REGEX = /^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const record = await Record.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!record)
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { id } = await params; // Fix: Await params
  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const body = await req.json();
    const { tags, attributes, links } = body;

    if (
      attributes &&
      (!Array.isArray(attributes) ||
        attributes.some(
          (attr) =>
            typeof attr?.label !== "string" || !Array.isArray(attr?.values),
        ))
    ) {
      return NextResponse.json(
        { error: "Invalid attributes structure" },
        { status: 400 },
      );
    }

    if (attributes) {
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
    }

    const updateFields: any = { lastModified: new Date() };
    if (tags !== undefined) updateFields.tags = tags;
    if (attributes !== undefined) updateFields.attributes = attributes;
    if (links !== undefined) updateFields.links = links;

    const updatedRecord = await Record.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!updatedRecord)
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    return NextResponse.json(updatedRecord);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const result = await Record.deleteOne({ _id: id, userId: session.user.id });

    if (result.deletedCount === 0)
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    return NextResponse.json({ message: "Dossier permanently erased" });
  } catch (error) {
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
