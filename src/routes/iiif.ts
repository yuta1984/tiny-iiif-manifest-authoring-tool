import express from "express";
import { Processor, IIIF } from "iiif-processor";
import fs from "fs";
import path from "path";

function createRouter(version: number) {
  const streamImageFromFile = (params: { id: string }) => {
    console.log("streamImageFromFile");
    const iiifImagePath = path.join(__dirname, "../../images/ptiff");
    console.log(iiifImagePath);
    const file = path.join(iiifImagePath, params.id);
    if (!fs.existsSync(file)) {
      throw new IIIF.Error("Not Found", { statusCode: 404 });
    }
    return fs.createReadStream(file);
  };

  const render = async (req: any, res: any) => {
    if (!req.params?.filename == null) {
      req.params.filename = "info.json";
    }

    try {
      const iiifUrl = `${req.protocol}://${req.get("host")}/iiif/${version}${
        req.path
      }`;
      const iiifProcessor = new Processor(iiifUrl, streamImageFromFile);
      console.log(req.url);
      const result = await iiifProcessor.execute();
      return res
        .set("Content-Type", result.contentType)
        .set("Link", [
          `<${result.canonicalLink}>;rel="canonical"`,
          `<${result.profileLink}>;rel="profile"`,
        ])
        .status(200)
        .send(result.body);
    } catch (err) {
      console.log(err);
      return res.status(502);
    }
  };

  const router = express.Router();

  // Respond with 204 NO CONTENT to all OPTIONS requests
  router.options(/^.*$/, (_req, res) => {
    res.status(204).send("");
  });

  router.get("/", function (_req, res) {
    return res.status(200).send(`IIIF v${version}.x endpoint OK`);
  });

  router.get("/:id", render);
  router.get("/:id/info.json", render);
  router.get("/:id/:region/:size/:rotation/:filename", render);

  return router;
}

export default createRouter;
