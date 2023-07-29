import express from 'express';
import {
  getImagesByManifestId,
  getManifestById,
} from '../utils/db';
import { IIIF_URI_PREFIX } from '../config';
import { manifestURI } from '../utils/uri';

const router = express.Router();

// PREFIX/manifests/2/:id.json
router.get('/2/:id.json', async (req, res) => {
  const id = req.params.id;
  // get manifest record by id
  const manifest = await getManifestById(id);
  if (!manifest) {
    return res.status(404).json({ error: 'Not found' });
  }
  const manifestId = manifestURI(id, 2);
  const images = await getImagesByManifestId(id);
  const json: any = {};
  json['@context'] =
    'http://iiif.io/api/presentation/2/context.json';
  json['@id'] = manifestId;
  json['@type'] = 'sc:Manifest';
  json.label = manifest.label;
  json.description = manifest.description;
  json.attribution = manifest.attribution;
  json.logo = manifest.logo;
  json.license = manifest.license;
  json.seeAlso = manifest.seeAlso;
  json.metadata = manifest.metadata || [];
  json.sequences = [
    {
      '@type': 'sc:Sequence',
      viewingHint: manifest.viewingHint,
      viewingDirection: manifest.viewingDirection,
      canvases: images.map((image: any, index: number) => {
        const canvasURI = `${manifestId}/canvas/${
          index + 1
        }`;
        const resourceId = `${IIIF_URI_PREFIX}api/iiif/2/${image.name}.tif/full/full/0/default.jpg`;
        const imageId = `${IIIF_URI_PREFIX}api/iiif/2/${image.name}.tif`;
        return {
          '@id': canvasURI,
          '@type': 'sc:Canvas',
          label: `Image ${index + 1}`,
          height: image.height,
          width: image.width,
          images: [
            {
              '@type': 'oa:Annotation',
              motivation: 'sc:painting',
              on: canvasURI,
              resource: {
                '@id': resourceId,
                '@type': 'dctypes:Image',
                format: 'image/jpeg',
                height: image.height,
                width: image.width,
                service: {
                  '@context':
                    'http://iiif.io/api/image/2/context.json',
                  '@id': imageId,
                  profile:
                    'http://iiif.io/api/image/2/level2.json',
                },
              },
            },
          ],
        };
      }),
    },
  ];
  return res.json(json);
});

export default router;
