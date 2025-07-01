import { Sandbox } from "@e2b/code-interpreter";



/**
 * Connects to a sandbox environment using the provided sandbox ID.
 *
 * @param sandboxId - The unique identifier of the sandbox to connect to
 * @returns A promise that resolves to the connected sandbox instance
 */
export async function getSandbox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId);
  return sandbox;
}
