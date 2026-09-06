import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
    params: Promise<{ certificateId: string }>;
};

type CertificateDetail = {
    certificate_id: string;
    certificate_number: string;
    verification_code: string;
    trainee_name: string | null;
    course_title: string | null;
    issued_at: string | null;
    revoked_at: string | null;
};

export async function GET(request: Request, { params }: RouteContext) {
    await requireRole("trainee");

    const { certificateId } = await params;
    const parsed = z.string().uuid().safeParse(certificateId);
    if (!parsed.success) {
        return new Response("Not found", { status: 404 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_my_certificate_detail", {
        p_certificate_id: parsed.data,
    });

    if (error) {
        console.error("Unable to load certificate detail:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        return new Response("Not found", { status: 404 });
    }

    const detail = ((Array.isArray(data) ? data[0] : data) ?? null) as CertificateDetail | null;
    if (!detail) return new Response("Not found", { status: 404 });
    if (detail.revoked_at) return new Response("Forbidden", { status: 403 });

    const verificationUrl = new URL(`/verify/${detail.verification_code}`, request.url).toString();
    const qrPng = await QRCode.toBuffer(verificationUrl, {
        type: "png",
        width: 180,
        margin: 1,
    });

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([841.89, 595.28]);
    const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
    const qrImage = await pdf.embedPng(qrPng);
    const { width, height } = page.getSize();

    page.drawRectangle({
        x: 28,
        y: 28,
        width: width - 56,
        height: height - 56,
        borderColor: rgb(0.08, 0.15, 0.25),
        borderWidth: 2,
    });
    page.drawText("CAPACITY CONNECT", {
        x: 0,
        y: height - 105,
        size: 25,
        font: boldFont,
        color: rgb(0.05, 0.12, 0.22),
        maxWidth: width,
        wordBreaks: [],
    });
    page.drawText("Certificate of Completion", {
        x: 0,
        y: height - 145,
        size: 18,
        font: regularFont,
        color: rgb(0.25, 0.3, 0.38),
        maxWidth: width,
        wordBreaks: [],
    });
    page.drawText("This certifies that", {
        x: 0,
        y: height - 205,
        size: 14,
        font: regularFont,
        color: rgb(0.25, 0.3, 0.38),
        maxWidth: width,
        wordBreaks: [],
    });

    const traineeName = detail.trainee_name ?? "Learner";
    const courseTitle = detail.course_title ?? "CAPACITY CONNECT course";
    const centeredTextX = (text: string, size: number, font = boldFont) =>
        (width - font.widthOfTextAtSize(text, size)) / 2;

    page.drawText(traineeName, {
        x: centeredTextX(traineeName, 28),
        y: height - 255,
        size: 28,
        font: boldFont,
        color: rgb(0.05, 0.12, 0.22),
    });
    page.drawText("has successfully completed", {
        x: centeredTextX("has successfully completed", 14, regularFont),
        y: height - 295,
        size: 14,
        font: regularFont,
        color: rgb(0.25, 0.3, 0.38),
    });
    page.drawText(courseTitle, {
        x: centeredTextX(courseTitle, 22),
        y: height - 340,
        size: 22,
        font: boldFont,
        color: rgb(0.05, 0.12, 0.22),
        maxWidth: width - 260,
        wordBreaks: [" ", "-"],
    });

    const issuedDate = formatDate(detail.issued_at);
    page.drawText(`Certificate Number: ${detail.certificate_number}`, {
        x: 90,
        y: 120,
        size: 11,
        font: regularFont,
    });
    page.drawText(`Issued: ${issuedDate}`, {
        x: 90,
        y: 98,
        size: 11,
        font: regularFont,
    });
    page.drawText("Verified by CAPACITY CONNECT", {
        x: 90,
        y: 62,
        size: 10,
        font: boldFont,
    });
    page.drawText("MoES / IMD Capacity Building Platform", {
        x: 90,
        y: 45,
        size: 9,
        font: regularFont,
        color: rgb(0.25, 0.3, 0.38),
    });
    page.drawImage(qrImage, {
        x: width - 220,
        y: 48,
        width: 150,
        height: 150,
    });

    const bytes = await pdf.save();
    return new Response(Buffer.from(bytes), {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="capacity-connect-${detail.certificate_number}.pdf"`,
        },
    });
}

function formatDate(value: string | null) {
    if (!value) return "Unknown";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}