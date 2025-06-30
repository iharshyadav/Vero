"use client"
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query';
import { FC } from 'react'

interface clientProps {
  
}

const Client: FC<clientProps> = ({}) => {

    const trpc = useTRPC();
    const {data} = useSuspenseQuery(trpc.hello.queryOptions({text : "Hello Harsh!"}))

    
  return <div>
    {JSON.stringify(data)}
  </div>
}

export default Client