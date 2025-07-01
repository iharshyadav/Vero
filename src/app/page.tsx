"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {

   const [value, setvalue] = useState("")
   const trpc = useTRPC();
   const invoke = useMutation(trpc.invoke.mutationOptions({
      onSuccess : () => {
         toast.success("Background jobs started")
      }
   }));

   useEffect(() => {
      console.log(value)
   },[value])

  return (
  <>
    <div className="p-4 max-w-7xl mx-auto">
       <Input value={value} onChange={(e) => setvalue(e.target.value)}></Input>
       <Button onClick={() => invoke.mutate({value : value})}>
           Invoke Background Job
       </Button>
    </div>
  </>
  );
}
