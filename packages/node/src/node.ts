import { Elysia, t } from "elysia";
import { PrivateKey } from "o1js";

export function startNode(port: number = 3000) {
  const node = new Elysia({
                          websocket: {
                              idleTimeout: 30
                          }
                        })
                        .get("/", () => "Hello Elysia")
                        .get("/generateAddress", () => PrivateKey.random().toPublicKey().toBase58())
                        .post("/sendTransaction", (req) => {
                          console.log(req.body);
                          return "ok";
                        })
                        .ws('/ws', {
                          // validate incoming message
                          body: t.Object({
                              message: t.String()
                          }),
                          message(ws, { message }) {
                              ws.send({
                                  message,
                                  time: Date.now()
                              })
                          }
                      })
                        .listen(port);
  console.log(
    `🦊 Elysia is running at ${node.server?.hostname}:${node.server?.port}`
  );
  return node;
}