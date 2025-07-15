
import { Button } from "@/components/ui/button";
import LinkAccountButton from "@/components/ui/link-account-button";
import { SignIn } from "@clerk/nextjs";
import React, { use } from "react";
import { redirect } from "next/navigation";

export default async function Home() {


  return (
    <div>
    

    <h1 className="text-3xl font-bold underline">
    hello
    </h1>



    <LinkAccountButton>
    </LinkAccountButton>
     </div>
  );
}
