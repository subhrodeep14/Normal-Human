
import { Account } from "@/lib/account";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";



export const POST = async (req: NextRequest) => {
    const body = await req.json()
    const { accountId, userId } = body
    if (!accountId || !userId) return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });

    const dbAccount = await db.account.findUnique({
        where: {
            id: accountId,
            userId,
        }
    })
    if (!dbAccount) return NextResponse.json({ error: "ACCOUNT_NOT_FOUND" }, { status: 404 });

    const account = new Account(dbAccount.accessToken);

   const response = await account.performInitialSync();

   if (!response) return NextResponse.json({ error: "INITIAL_SYNC_FAILED" }, { status: 500 });
   const { emails, deltaToken } = response;
    console.log('email', emails);
    
//     await db.account.update({
//         where: {
//             id: accountId,
//         },
//         data: {
//             nextDeltaToken: deltaToken,
//     }
//    })
//    await syncEmailsToDatabase
//    (response.emails, accountId);
//    console.log('sync completed', deltaToken);

   return NextResponse.json({ success: true }, { status: 200 });
}