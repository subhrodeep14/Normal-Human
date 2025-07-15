import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server"
import axios from "axios";
import { NextResponse ,NextRequest} from "next/server";
import { waitUntil } from "@vercel/functions";


export const GET = async (req: NextRequest) => {
    const {userId} = await auth();
    console.log('User ID:', userId);
    console.log('Request URL:', req.url);
    
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

        const token=await exchangeCodeForAccessToken(code as string);
        if(!token) {
            return NextResponse.json({ error: 'Failed to exchange code for access token' }, { status: 500 });
        }
        console.log('Token received:', token);

        const accountDetails = await getAccountDetails(token.accessToken);
        if (!accountDetails) {
            return NextResponse.json({ error: 'Failed to fetch account details' }, { status: 500 });
        }
            console.log('Account details:', accountDetails);

          console.log('Saving account details to database');
       
          await db.user.upsert({
            where: { id: userId },
            update: {
                email: accountDetails.email,
                firstName: accountDetails.name,
                
                
            },
            create: {
                id: userId,
                email: accountDetails.email,
                firstName: accountDetails.name,
            } 
        });
          
            
        await db.account.upsert({
            where:{
                id: token.accountId.toString()
            },
             update: {
                accessToken: token.accessToken,
            },
            create: {
                emailAddress: accountDetails.email,
                id: token.accountId.toString(),
                userId: userId,
                accessToken: token.accessToken,
                name: accountDetails.name
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