import sqlite3 from 'sqlite3';
import express from 'express';
import { open } from 'sqlite';
import imagemagick from 'imagemagick';
import bufferImageSize from 'buffer-image-size';
import { checkAuth } from '../utils/auth';
import {
  addImage,
  deleteImage,
  getImage,
  getManifestById,
} from '../utils/db';
import logger from '../utils/logger';

sqlite3.verbose();

const router = express.Router();

const getDB = async () => {
  return await open<sqlite3.Database, sqlite3.Statement>({
    filename: './db/db.sqlite3',
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
        '-define',
        'tiff:tile-geometry=256x256',
        '-compress',
        'lzw',
        output,
      ],
      (err, stdout) => {
        if (err) {
          logger.error("couldn't convert to ptiff", {
            error: err,
          });
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
  await db.run(sql, ['converted', name]);
  db.close();
};

router.get('/:id/images', async (req, res) => {
  const db = await getDB();
  const id = req.params.id;
  try {
    const manifest = await db.get(
      'SELECT * FROM manifests WHERE id = ?',
      id
    );
    const images = await db.all(
      'SELECT * FROM images WHERE manifestId = ?',
      id
    );
    return res.render('images/index', {
      manifest,
      images,
      flash: req.flash(),
    });
  } catch (err) {
    logger.error(err);
  } finally {
    db.close();
  }
});

type ImageUpload = {
  name: string;
  data: Buffer;
  mimetype: string;
  size: number;
  md5: string;
  mv: (path: string) => void;
};

router.post('/:id/images', checkAuth, async (req, res) => {
  const id = req.params.id;
  const user = req.user!;
  // delete button was clicked
  if (req.body.deleteImage) {
    const name = req.body.deleteImage;
    // get image
    const image = await getImage(name);
    // check if image exists
    if (image === undefined) {
      logger.error('Image not found', { name });
      return res.status(404).send('Image not found');
    }
    // check if user is authorized to delete image
    if (image.uid !== user.id) {
      logger.error('Forbidden', { user, image });
      return res.status(403).send('Forbidden');
    }
    // delete image from db
    await deleteImage(name);
    // delete image from filesystem
    const fs = require('fs');
    fs.unlinkSync(
      `${__dirname}/../../images/original/${name}.jpg`
    );
    fs.unlinkSync(
      `${__dirname}/../../images/ptiff/${name}.tif`
    );
    req.flash('info', 'Image deleted.');
    return res.redirect(`/manifests/${id}/images`);
    // submit button was clicked
  } else {
    // get manifest
    const manifest = await getManifestById(id);
    // check if manifest exists
    if (!manifest) {
      return res.status(404).send('Manifest not found');
    }
    // check if user is authorized to upload images to manifest
    if (manifest.uid !== user.id) {
      return res.status(403).send('Forbidden');
    }
    // insert images into db
    const images = Array.isArray(req.files!.images)
      ? (req.files!.images as ImageUpload[])
      : [req.files!.images as ImageUpload];
    const promises = images.map((image: any) => {
      const { size, data, md5 } = image;
      const hash = md5;
      const dimension = bufferImageSize(data);
      image.mv(
        `${__dirname}/../../images/original/${hash}.jpg`,
        async (err: any) => {
          if (err) {
            logger.error("couldn't upload image", {
              error: err,
            });
          } else {
            logger.info('image uploaded', { hash });
            await convertToPtiff(hash);
            logger.info('image converted to ptiff', {
              hash,
            });
            await updateImageStatus(hash);
            logger.info('image status updated', { hash });
          }
        }
      );
      return addImage({
        name: hash,
        uid: user.id,
        size,
        width: dimension.width,
        height: dimension.height,
        manifestId: id,
        status: 'uploading',
      });
    });
    await Promise.all(promises);
    req.flash('info', 'Images uploaded.');
    return res.redirect(`/manifests/${id}/images`);
  }
});

export default router;
