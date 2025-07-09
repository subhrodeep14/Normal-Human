"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const getAurinkoAuthUrl =async(serviceType:'Google' | 'office365')=>{
    const {userId}= await auth();
    if(!userId) throw new Error('User not authenticated');
    const params = new URLSearchParams({
        clientId: process.env.AURINKO_CLIENT_ID as string,
        
        responseType: 'code',
        scope: 'Mail.ReadWrite Mail.Send Mail.Read Mail.Drafts Mail.All',
        reponseType: 'code',
        serviceType,
        returnUrl:`${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`

    });
    return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;

}

export const exchangeCodeForAccessToken =async (code: string) => {
    try{
        const response= await axios.post(`https://api.aurinko.io/v1/auth/token/${code}`, {

        },{
            auth:{
                username: process.env.AURINKO_CLIENT_ID as string,
                password: process.env.AURINKO_CLIENT_SECRET as string
            }
        })
        return response.data as{
            accessToken: string;
            accountId: string;
            userId:string;
            userSession: string;
        };
    }catch (error) {
        if(axios.isAxiosError(error)) {
            console.error('Error exchanging code for access token:', error.response?.data || error.message);
        throw new Error('Failed to exchange code for access token');
    }
}
}

export const getAccountDetails = async (accessToken: string) => {
    try {
        const response = await axios.get('https://api.aurinko.io/v1/account', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data as {
           
            email: string;
            name: string;
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching account details:', error.response?.data || error.message);
            throw new Error('Failed to fetch account details');
        }
    }
}