
import { db } from "./server/db";

await db.user.create(
    {
        data: {
            email: "john@example.com",
            firstName: "John",
            lastName: "Doe",
            image: "https://example.com/image.jpg",

        }
    }
)
console.log("User created successfully");
