import sqlite3 from "sqlite3";
import express from "express";
import { open } from "sqlite";
import imagemagick from "imagemagick";
import bufferImageSize from "buffer-image-size";

sqlite3.verbose();

const router = express.Router();

const getDB = async () => {
  return await open<sqlite3.Database, sqlite3.Statement>({
    filename: "./db/db.sqlite3",
    driver: sqlite3.Database,
  });
};

const convertToPtiff = async (name: string) => {
  const input = `${__dirname}/../../images/original/${name}.jpg`;
  const output = `${__dirname}/../../images/ptiff/${name}.tif`;
  return new Promise((resolve, reject) => {
    imagemagick.convert(
      [
        input,
        "-define",
        "tiff:tile-geometry=256x256",
        "-compress",
        "lzw",
        output,
      ],
      (err, stdout) => {
        if (err) {
          reject(err);
        }
        resolve(stdout);
      }
    );
  });
};

const updateImageStatus = async (name: string) => {
  const db = await getDB();
  const sql = `
    UPDATE images
    SET status = ?
    WHERE name = ?
  `;
  await db.run(sql, ["converted", name]);
  db.close();
};

router.get("/:id/images", async (req, res) => {
  const db = await getDB();
  const id = req.params.id;
  const manifest = await db.get("SELECT * FROM manifests WHERE id = ?", id);
  const images = await db.all("SELECT * FROM images WHERE manifestId = ?", id);
  db.close();
  return res.render("images/index", { manifest, images });
});

// accept image uploads and convert them to pyramid tiffs
router.post("/:id/images", async (req, res) => {
  const db = await getDB();
  const id = req.params.id;
  console.log(req.files!.images);
  // insert images into db
  const images = req.files!.images as {
    name: string;
    data: Buffer;
    mimetype: string;
    size: number;
    md5: string;
    mv: (path: string) => void;
  }[];
  const promises = images.map(async (image: any) => {
    const { size, data, md5 } = image;
    const hash = md5;
    const dimension = bufferImageSize(data);
    image.mv(
      `${__dirname}/../../images/original/${hash}.jpg`,
      async (err: any) => {
        if (err) {
          console.log(err);
        } else {
          console.log("uploaded: ", hash);
          console.log("converting to ptiff...");
          await convertToPtiff(hash);
          console.log("done converting to ptiff");
          await updateImageStatus(hash);
          console.log("done updating image status");
        }
      }
    );
    const sql = `
      INSERT INTO images (name, size, width, height, manifestId, uid, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return await db.run(sql, [
      hash,
      size,
      dimension.width,
      dimension.height,
      id,
      "hashimoto",
      "converting",
      new Date().getTime(),
    ]);
  });
  await Promise.all(promises);
  res.redirect(`/manifests/${id}/images`);
});

export default router;
