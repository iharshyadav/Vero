import { main } from "@/app/gpt";
import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event , step }) => {

   const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("nextjs-demo-1274");
      return sandbox.sandboxId;
    });
    const systemPrompt =
      "You are a code agent. Write clean, idiomatic TypeScript code based on user input. and also you are a simple nextjs , reactjs code snippets";

    const userQuery = `write a code snipppet for : ${event.data.value}`;

    try {
      const res = await main(systemPrompt, userQuery);
       
       const sandboxUrl = await step.run("get-sandbox-url", async () => {
         const sandbox = await getSandbox(sandboxId);
         const host = sandbox.getHost(3000);
         return `https://${host}`;
       });

      return { output: res.message , sandboxUrl };
    } catch (error) {
      console.error("Error calling GitHub AI API:", error);
      return { output: "Failed to generate response", error: String(error) };
    }
  }
);
