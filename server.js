import Fastify from "fastify";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import crypto from "crypto";
import config from "./config.json" assert { type: "json" };

const fastify = Fastify();

async function updateFeed(name) {
  const currentDirectory = dirname(fileURLToPath(import.meta.url));
  const feedDataDirectory = `${currentDirectory}/data/feeds/${name}`;
  const feedDataFiles = await fs.promises.readdir(feedDataDirectory);
  feedDataFiles.sort().reverse();

  const feedsDirectory = `${currentDirectory}/feeds/`;
  const filePath = `${feedsDirectory}/${name}.xml`;
  await fs.promises.mkdir(feedsDirectory, { recursive: true });

  const feedItems = [];
  for (const feedDataFile of feedDataFiles) {
    const fileContent = await fs.promises.readFile(`${feedDataDirectory}/${feedDataFile}`);
    const feedItem = JSON.parse(fileContent);
    feedItems.push(`<item>
      <title><![CDATA[${feedItem.title}]]></title>
      <link><![CDATA[${feedItem.url}]]></link>
      <description><![CDATA[${feedItem.description}]]></description>
    </item>`);
  }

  const content = `<rss version="2.0">
  <channel>
      <title>${name}</title>
      ${feedItems.join("\n")}
  </channel>
  </rss>`;
  await fs.promises.writeFile(filePath, content);
}

async function addFeedItem(name, id, title, url, description) {
  const currentDirectory = dirname(fileURLToPath(import.meta.url));
  const feedDataDirectory = `${currentDirectory}/data/feeds/${name}`;
  const idsDirectory = `${currentDirectory}/data/ids`;
  const hashedId = crypto.createHash('md5').update(id).digest("hex");
  const idPath = `${idsDirectory}/${hashedId}.json`;

  if (fs.existsSync(idPath)) {
    return false;
  }

  const timestamp = Date.now();
  const data = {
    timestamp,
    name,
    id,
    hashedId,
    title,
    url,
    description
  };
  const stringifiedData = JSON.stringify(data);

  await fs.promises.writeFile(idPath, stringifiedData);

  await fs.promises.mkdir(feedDataDirectory, { recursive: true });
  const feedItemDataPath = `${feedDataDirectory}/${timestamp}-${hashedId}.json`;
  await fs.promises.writeFile(feedItemDataPath, stringifiedData);

  await updateFeed(name);

  return true;
}

fastify.get(`/${config.basePath}`, async (request, reply) => {
  return {};
});

fastify.post(`/${config.basePath}/:name/items`, async (request, reply) => {
  const { name } = request.params;
  const { id, title, url, description } = request.body;

  const created = await addFeedItem(name, id, title, url, description);
  const httpCode = created ? 201 : 200;

  reply
    .code(httpCode)
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
