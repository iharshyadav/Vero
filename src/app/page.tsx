import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import Client from "./client";

export default function Home() {

 const queryClient = getQueryClient();
 void queryClient.prefetchQuery(trpc.hello.queryOptions({text : "Hello Harsh!"}));

  return (
  <>
     <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>Loading...</p>}>
         <Client />
      </Suspense>
     </HydrationBoundary>
  </>
  );
}
