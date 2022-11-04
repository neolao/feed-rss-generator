import Fastify from "fastify";

const fastify = Fastify();

fastify.get("/", async (request, reply) => {
  return {};
});

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`);
})
