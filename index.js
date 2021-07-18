const request = require("request");
const cheerio = require("cheerio");
const Queue = require("bull");

async function main(baseurl = "https://seorangeksa.com") {
  // Initiating the Queue
  const crawlQueue = new Queue("CrawlQueue", {
    redis: { host: "127.0.0.1", port: 6379 },
  });

  // Adding a job to the Queue
  crawlQueue.add({ url: baseurl }, { delay: 6000, attempts: 2 });

  // Consumer
  crawlQueue.process(async (job) => {
    const result = await crawl(job.data.url);
    console.log("Result: ", result);
  });
}

/**
 * Crawling a web site
 * @param baseurl : string
 * @returns object with data (array) and total (int)
 */
async function crawl(baseurl) {
  return new Promise((resolve, reject) => {
    request(baseurl, (err, res, body) => {
      if (err && res.statusCode !== 200) {
        reject(err);
        return;
      }

      const data = [];
      let $ = cheerio.load(body);
      $(".article__list").each((i, val) => {
        const title = $(val)?.find($(".article__title")).text().trim();
        const link = $(val)?.find($(".article__link")).attr("href");
        const imgUrl = $(val)
          ?.children(".article__list__asset")
          .children(".article__asset")
          .find("a > img")
          .attr("data-src");
        const tag = $(val)?.find(".article__subtitle").text().trim();
        const createdAt = $(val)?.find(".article__date").text().trim();

        data.push({ title, link, imgUrl, tag, createdAt });
      });

      resolve({ data, total: data.length });
    });
  });
}

const url = "https://www.kompas.com";
main(url);
