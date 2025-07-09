import { Button } from "@/components/ui/button";
import LinkAccountButton from "@/components/ui/link-account-button";
import React from "react";

export default async function Home() {
  

  return (
    <div>

   
    <h1 className="text-3xl font-bold underline">
    hello
    </h1>
    <Button className="bg-blue-500 text-white hover:bg-blue-300">
      Click Me
    </Button>
    <LinkAccountButton>
    </LinkAccountButton>
     </div>
  );
}
