const request = require("request");
const cheerio = require("cheerio");

const url = "https://www.kompas.com";

request(url, (err, res, body) => {
  if (err && res.statusCode !== 200) throw err;

  const result = [];
  let $ = cheerio.load(body);
  $(".article__list").each((i, val) => {
    const title = $(val).find($(".article__title")).text().trim();
    const link = $(val).find($(".article__link")).attr("href");
    const imgUrl = $(val)
      .children(".article__list__asset")
      .children(".article__asset")
      .find("a > img")
      .attr("data-src");
    const tag = $(val).find(".article__subtitle").text().trim();
    const createdAt = $(val).find(".article__date").text().trim();

    const meta = { title, link, imgUrl, tag, createdAt };
    result.push(meta);
  });

  console.log("RESULT ==> ", result);
  console.log("TOTAL RESULT: ", result?.length);
});
