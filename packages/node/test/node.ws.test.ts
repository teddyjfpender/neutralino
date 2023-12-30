import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { WebSocket } from "ws";
import { startNode } from "../src/node";

describe('WebSocket Endpoints', () => {
    let node: ReturnType<typeof startNode>;
    let ws: WebSocket;

    beforeAll(() => {
        // Start the server before all tests
        node = startNode(3000);
    });

    afterAll(() => {
        // Close the server and WebSocket after all tests
        ws.close();
        node.server?.stop();
    });

    it('should handle WebSocket connection and messages', (done) => {
        ws = new WebSocket('ws://localhost:3000/ws');

        ws.on('open', () => {
            ws.send(JSON.stringify({ message: 'Hello WebSocket' }));
        });

        ws.on('message', (data) => {
            let messageString;
            if (data instanceof Buffer) {
                // If the data is a Buffer, convert it to a string
                messageString = data.toString();
            } else if (typeof data === 'string') {
                // If the data is already a string, use it as is
                messageString = data;
            } else {
                // For other types like ArrayBuffer or Blob, handle them accordingly
                // Here, I'll just convert an ArrayBuffer to a Buffer and then to a string
                // Note: This might not be needed depending on your WebSocket configuration
                messageString = Buffer.from(data).toString();
            }
        
            const response = JSON.parse(messageString);
            expect(response).toHaveProperty('message', 'Hello WebSocket');
            expect(response).toHaveProperty('time');
            done();
        });
        

        ws.on('error', (err) => {
            done(err);
        });
    });
});
