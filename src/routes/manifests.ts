import express from 'express';
import { check, validationResult } from 'express-validator';
import { checkAuth } from '../utils/auth';
import {
  addManifest,
  deleteManifest,
  getAllManifestsByUid,
  getManifestById,
  updateManifest,
} from '../utils/db';
import { Manifest } from '../types';
import dayjs from 'dayjs';
import logger from '../utils/logger';

const router = express.Router();

const formCheck = [
  check('id')
    .matches(/^[A-Za-z0-9_]+$/i)
    .trim()
    .escape(),
  check('label').not().isEmpty().trim().escape(),
  check('description').not().isEmpty().trim().escape(),
  check('attribution').not().isEmpty().trim().escape(),
];

router.post(
  '/',
  checkAuth,
  ...formCheck,
  async (req, res) => {
    const uid = req.user!.id;
    // check if manifest id already exists
    const existing = await getManifestById(req.body.id);
    if (existing) {
      return res.render('manifests/new', {
        errors: [
          {
            path: 'ID',
            msg: 'This manifest ID is already taken. Try different one.',
          },
        ],
        data: req.body,
        flash: req.flash(),
      });
    }
    // validate form
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('manifests/new', {
        errors: errors.array(),
        data: req.body,
        flash: req.flash(),
      });
    }
    const manifest: Manifest = {
      id: req.body.id,
      uid,
      label: req.body.label,
      description: req.body.description,
      attribution: req.body.attribution,
      viewingDirection: req.body.viewingDirection,
      viewingHint: req.body.viewingHint,
      logo: req.body.logo,
      license: req.body.license,
      seeAlso: req.body.seeAlso,
      metadata: req.body.metadata || [],
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };
    try {
      await addManifest(manifest);
      req.flash('info', 'Manifest created.');
      return res.redirect(`/manifests/`);
    } catch (err) {
      console.log(err);
      return res.render('manifests/new', {
        errors: err,
        data: req.body,
        flash: req.flash(),
      });
    }
  }
);

router.get('/new', checkAuth, ...formCheck, (req, res) => {
  return res.render('manifests/new', {
    data: { flash: req.flash() },
  });
});

router.get('/:id/edit', checkAuth, async (req, res) => {
  const id = req.params.id;
  try {
    const manifest = await getManifestById(id);
    return res.render('manifests/edit', {
      manifest,
      id,
      flash: req.flash(),
    });
  } catch (err) {
    console.log(err);
    return res.render('manifests/edit', {
      manifest: {},
      id,
      flash: req.flash(),
    });
  }
});

router.post(
  '/:id',
  checkAuth,
  ...formCheck,
  async (req, res) => {
    const id = req.params!.id;
    const method = req.body._method;
    // if delete
    if (method === 'DELETE') {
      console.log('deleting manifest: ', id);
      await deleteManifest(id);
      req.flash('info', 'Manifest deleted.');
      return res.redirect(`/manifests/`);
    }
    console.log('updating manifest: ', id);
    // validate form
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.body.id = id;
      return res.render('manifests/edit', {
        errors: errors.array(),
        manifest: req.body,
        flash: req.flash(),
      });
    }
    const manifest: Partial<Manifest> = {
      id,
      uid: req.user!.id,
      label: req.body.label,
      description: req.body.description,
      attribution: req.body.attribution,
      viewingDirection: req.body.viewingDirection,
      viewingHint: req.body.viewingHint,
      logo: req.body.logo,
      license: req.body.license,
      seeAlso: req.body.seeAlso,
      metadata: req.body.metadata || [],
      updatedAt: Date.now(),
    };
    try {
      updateManifest(manifest);
    } catch (err) {
      console.log(err);
    } finally {
      req.flash('info', 'Manifest updated.');
      return res.redirect(`/manifests/${id}/edit`);
    }
  }
);

router.get('/', checkAuth, async (req, res) => {
  const uid = req.user?.id!;
  try {
    const manifests = await getAllManifestsByUid(uid);
    return res.render('manifests/index', {
      manifests,
      flash: req.flash(),
      formatDate: (date: number) => {
        return dayjs(new Date(date)).format(
          'YYYY-MM-DD HH:mm:ss'
        );
      },
    });
  } catch (err) {
    logger.error(err);
  }
});

router.get('/:id/browse', async (req, res) => {
  const id = req.params.id;
  try {
    const manifest = await getManifestById(id);
    return res.render('manifests/browse', {
      manifest,
      flash: req.flash(),
    });
  } catch (err) {
    logger.error(err);
  }
});

export default router;
