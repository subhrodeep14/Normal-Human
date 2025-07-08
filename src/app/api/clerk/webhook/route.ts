import { db } from "@/server/db";

export const POST = async (req: Request) => {
    const {data} = await req.json();
    
  
    const email=data.email_addresses[0].email_address;
    const firstName=data.first_name;
    const lastName=data.last_name;
    const image=data.profile_image_url;

    // Here you would typically save the user to your database
    // For example, using Prisma:   
    await db.user.create({
        data: {
            id: data.id,
            email,
            firstName,
            lastName,
            image
        }
    });
    console.log("User created:");
    
      return new Response("Webhook received", {
        status: 200,
    });
}
