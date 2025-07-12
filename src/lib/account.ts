import axios, { all } from "axios";
import type { EmailMessage, SyncResponse, SyncUpdatedResponse } from "./types";

 export class Account{
    private token:string;

    constructor(token:string){
        this.token = token;
    }

    private async startSync(){
        const response = await axios.post<SyncResponse>('https://api.aurinko.io/v1/email/sync', {}, {
            headers: {
                Authorization: `Bearer ${this.token}`
            },
            params: {
                daysWithin:2,
                bodyType:'html'
                 // or 'incremental' based on your needs
            }
        });
        return response.data;
    }

    async getUpdatedEmails({deltaToken ,pageToken}:{deltaToken?:string ,pageToken?:string}){
        let params: Record<string, string> = {}
        if (deltaToken) {
            params.deltaToken = deltaToken;
        }
        if (pageToken) {
            params.pageToken = pageToken;
        }
        const response = await axios.get<SyncUpdatedResponse>('https://api.aurinko.io/v1/email/sync/updated', {
            headers: {
                Authorization: `Bearer ${this.token}`
            },
            params: {
                ...params,
                bodyType:'html'
            }
        });
        return response.data;
    }

    async performInitialSync(){ 
        try{
            let syncResponse = await this.startSync();
            while(!syncResponse.ready){
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
                syncResponse = await this.startSync();
            }

            let storeDeltaToken:string =syncResponse.syncUpdatedToken;

            let updatedResponse =await this.getUpdatedEmails({deltaToken:storeDeltaToken});

            if(updatedResponse.nextDeltaToken){
                storeDeltaToken = updatedResponse.nextDeltaToken;
            }
            let allEmails:EmailMessage[] = updatedResponse.records;

            while(updatedResponse.nextPageToken){
                updatedResponse = await this.getUpdatedEmails({deltaToken:storeDeltaToken, pageToken: updatedResponse.nextPageToken});
                allEmails=allEmails.concat(updatedResponse.records);
                if(updatedResponse.nextDeltaToken){
                    storeDeltaToken = updatedResponse.nextDeltaToken;
                }
                console.log('Fetched emails:', allEmails.length,'emails');

                return {
                    emails: allEmails, deltaToken: storeDeltaToken};
            }
        } catch (error) {
            console.error("Error performing initial sync:", error);
            return null;
        }
}

}