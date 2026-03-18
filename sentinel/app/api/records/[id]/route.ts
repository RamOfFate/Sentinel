import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Record from "@/models/record";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

const ENCRYPTED_PAYLOAD_REGEX = /^[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/;

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const body = await req.json();

    const { tags, attributes, links } = body;

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
      attributes !== undefined &&
      (!Array.isArray(attributes) ||
        attributes.some(
          (attr: any) =>
            typeof attr?.label !== "string" || !Array.isArray(attr?.values),
        ))
    ) {
      return NextResponse.json(
        { error: "Invalid request payload" },
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

    const updatedRecord = await Record.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      {
        tags: body.tags,
        attributes: body.attributes,
        links: body.links,
        lastModified: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!updatedRecord) {
      return NextResponse.json(
        { error: "Record not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedRecord);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();

    const result = await Record.deleteOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Record not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Dossier permanently erased" });
  } catch (error) {
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
