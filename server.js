const fastify = require("fastify")();

fastify.get("/", async (request, reply) => {
  return {};
});

const start = async () => {
  try {
    await fastify.listen(3000);
    console.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
start();
