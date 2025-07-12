import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server"
import axios from "axios";
import { NextResponse ,NextRequest} from "next/server";
import { waitUntil } from "@vercel/functions";

export const GET = async (req: NextRequest) => {
    const {userId} = await auth();
    console.log('User ID:', userId);
    if(!userId) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });

    const params= req.nextUrl.searchParams;
    const status = params.get('status');
    if(status !== 'success') {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 400 });
    }
    const code = params.get('code');
    if(!code) {
        return NextResponse.json({ error: 'Authorization code not found' }, { status: 400 });
    }

        const token=await exchangeCodeForAccessToken(code);
        if(!token) {
            return NextResponse.json({ error: 'Failed to exchange code for access token' }, { status: 500 });
        }

        const accountDetails = await getAccountDetails(token.accessToken);
        if (!accountDetails) {
            return NextResponse.json({ error: 'Failed to fetch account details' }, { status: 500 });
        }

        await db.account.upsert({
            where:{
                id: token.accountId.toString()
            },
            create: {
            
                emailAddress: accountDetails.email,
                id: token.accountId.toString(),
                userId,
                token: token.accessToken,
                provider: 'Aurinko',
                accessToken: token.accessToken,
                name: accountDetails.name
            },
            update: {
                
                accessToken: token.accessToken,
            
            }
        })

        waitUntil( axios.post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
            accountId: token.accountId.toString(),
            userId
        }).then((res) => {
            console.log('Initial sync started:', res.data);
        }).catch((error) => {
            console.error('Error starting initial sync:', error.response?.data || error.message);
        }));

    return NextResponse.redirect(new URL('/mail', req.url));
}