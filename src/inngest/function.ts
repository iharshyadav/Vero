import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { createAgent, createNetwork, createTool } from "@inngest/agent-kit";
import { githubOpenAI } from "./model";
import { string, z } from "zod";
import { PROMPT } from "./prompt";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      try {
        const sandbox = await Sandbox.create("nextjs-demo-1274");
        return sandbox.sandboxId;
      } catch (error) {
        console.error("Failed to create sandbox:", error);
        throw new Error("Sandbox creation failed");
      }
    });

    const codeAgent = createAgent({
      name: "code-agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: githubOpenAI,
      tools : [
        createTool({
          name : "Terminal",
          description : "Use the terminal to run commands",
          parameters : z.object({
            command : string()
          }),
          handler : async ({command} , {step}) => {
             return step?.run("terminal", async () => {
              const buffers = { stdout : "" , stderr : "" };
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run( command , {
                  onStdout : (data : string) => {
                    buffers.stdout += data;
                  },
                  onStderr : (data :string) => {
                    buffers.stderr += data;
                  },
                })
                return result.stdout;
              } catch (e) {
                console.error(
                  `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`
                );
                return `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
              }
             })
          }
        }),
          createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async (
            { files },
            { step, network }
          ) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }
                  return updatedFiles;
                } catch (e) {
                  return "Error: " + e;
                }
              }
            );

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read a file from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (e) {
                return "Error: " + e;
              }
            });
          },
        }),
      ],
      lifecycle : {
         onResponse : async ({result , network}) => {
           const lastAssistantMessageText = lastAssistantTextMessageContent(result);

           if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }
          return result
         }
      }
    });

    const network = createNetwork({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      // defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }

        return codeAgent;
      },
    });

    const result = await network.run(event.data.value);

    // const userQuery = `Write a code snippet for: ${event.data.value}`;

    //   const {output} = await codeAgent.run(userQuery);
      // const { output } = agentResponse;

      const sandboxUrl = await step.run("get-sandbox-url", async () => {
          const sandbox = await getSandbox(sandboxId);
          const host = sandbox.getHost(3000);
          return `https://${host}`;
        
      });

      // console.log(output, "harsh");
      return {
        url: sandboxUrl,
        title: "Fragment",
        files: result.state.data.files,
        summary: result.state.data.summary,
      };
  }
);
