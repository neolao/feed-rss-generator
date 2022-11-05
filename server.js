import Fastify from "fastify";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import config from "./config.json" assert { type: "json" };

const fastify = Fastify();

fastify.get(`/${config.basePath}`, async (request, reply) => {
  return {};
});

fastify.post(`/${config.basePath}/:name/items`, async (request, reply) => {
  const { name } = request.params;
  const { id, title, url, description } = request.body;

  const currentDirectory = dirname(fileURLToPath(import.meta.url));
  const directoryPath = `${currentDirectory}/feeds/`;
  const filePath = `${directoryPath}/${name}.xml`;
  await fs.promises.mkdir(directoryPath, { recursive: true });

  const content = `<rss version="2.0">
  <channel>
      <title>${name}</title>
      <item>
        <title>${title}</title>
        <link>${url}</link>
        <description>${description}</description>
      </item>
  </channel>
  </rss>`;
  await fs.promises.writeFile(filePath, content);

  reply
    .code(201)
    .header("Content-Type", "application/json; charset=utf-8")
    .send(request.body);
});

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`);
})
