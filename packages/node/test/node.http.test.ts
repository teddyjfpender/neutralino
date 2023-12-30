import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { startNode } from "../src/node";
  
describe('HTTP Endpoints', () => {
    let node: ReturnType<typeof startNode>;
    beforeAll(() => {
        // Start the server before all tests
        node = startNode(3000);
      });

    afterAll(() => {
        // Close the server after all tests
        node.server?.stop();
    })

    it('GET / should return "Hello Elysia"', async () => {
      const response = await node.handle(new Request('http://localhost:3000/')).then((res) => res)
      expect(await response.text()).toBe('Hello Elysia');
      expect(response.status).toBe(200);
    });
  
    it('GET /generateAddress should return a valid address', async () => {
      const response = await node.handle(new Request('http://localhost:3000/generateAddress')).then((res) => res)
      expect(await response.text()).toMatch(/[1-9A-HJ-NP-Za-km-z]{44,}/); // Simple regex for base58
      expect(response.status).toBe(200);
    });
  
    it('POST /sendTransaction should acknowledge with "ok"', async () => {
      const response = await node.handle(new Request('http://localhost:3000/sendTransaction', { method: 'POST', body: 'test' })).then((res) => res)
      expect(await response.text()).toBe('ok');
      expect(response.status).toBe(200);
    });
  });
  