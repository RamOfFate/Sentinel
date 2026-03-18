import { NextResponse } from "next/server";

export function sanitizeError(error: any) {
  console.error(`[SERVER_ERROR] ${new Date().toISOString()}:`, error.message);

  if (error.name === "ValidationError") {
    return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
  }

  if (error.code === 11000) {
    return NextResponse.json(
      { error: "Duplicate entry found" },
      { status: 409 },
    );
  }

  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
