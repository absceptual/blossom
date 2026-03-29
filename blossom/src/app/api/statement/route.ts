import { retrieveFile, fileExists } from "@/actions/azure";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
        return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    const path = `${id}/statement.pdf`;
    const exists = await fileExists(path);
    if (!exists) {
        return NextResponse.json({ error: "Statement not found" }, { status: 404 });
    }

    const data = await retrieveFile(path) as Buffer;
    return new NextResponse(data, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${id}.pdf"`,
        },
    });
}
