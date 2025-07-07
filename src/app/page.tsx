"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {

   const [value, setvalue] = useState("")
   const router = useRouter();
   const trpc = useTRPC();
   const createProject = useMutation(trpc.projects.create.mutationOptions({
      onError : (e) => {
         toast.error(e.message)
      },
      onSuccess : (data) => {
         router.push(`/projects/${data.id}`)
      }
   }));

  return (
  <>
   <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
         <h1 className="text-2xl font-bold text-center text-gray-800">AI Tool</h1>
         <p className="text-center text-gray-500 mb-6">Create a new project to get started</p>
         
         <div className="space-y-4">
            <Input 
               className="w-full text-black" 
               placeholder="Enter project name" 
               value={value} 
               onChange={(e) => setvalue(e.target.value)}
            />
            
            <Button 
               className="w-full" 
               disabled={createProject.isPending || !value.trim()} 
               onClick={() => createProject.mutate({value: value})}
            >
               {createProject.isPending ? "Creating..." : "Create Project"}
            </Button>
         </div>
      </div>
   </div>
  </>
  );
}
