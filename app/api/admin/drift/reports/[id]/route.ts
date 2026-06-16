import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { status, blockBottle } = await request.json();
    const report = await prisma.$transaction(async (tx) => {
      const updated = await tx.driftReport.update({
        where: { id: params.id },
        data: {
          status,
          handledBy: session.user.id,
          handledAt: new Date(),
        },
        include: { bottle: true },
      });

      if (blockBottle && updated.bottleId) {
        await tx.driftBottle.update({
          where: { id: updated.bottleId },
          data: { status: "BLOCKED" },
        });
      }

      return updated;
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error("处理举报失败:", error);
    return NextResponse.json({ error: "处理举报失败" }, { status: 500 });
  }
}
