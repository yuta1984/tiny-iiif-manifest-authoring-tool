import express from 'express';
import { check, validationResult } from 'express-validator';
import { checkAuth } from '../utils/auth';
import {
  addManifest,
  getAllManifestsByUid,
  getManifestById,
  updateManifest,
} from '../utils/db';
import { Manifest } from '../types';

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
      metadata: req.body.metadata,
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

router.get('/new', checkAuth, (req, res) => {
  return res.render('manifests/new', {
    data: { flash: req.flash() },
  });
});

router.get('/:id/edit', checkAuth, async (req, res) => {
  const id = req.params.id;
  // validate form
  try {
    const manifest = await getManifestById(id);
    req.flash('info', 'Manifest updated.');
    return res.render('manifests/edit', { manifest, id });
  } catch (err) {
    console.log(err);
    return res.render('manifests/edit', {
      manifest: {},
      id,
      flash: req.flash(),
    });
  }
});

router.post('/:id', checkAuth, ...formCheck, (req, res) => {
  const id = req.params!.id;
  console.log('updating manifest: ', id);
  // validate form
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect(`/manifests/${id}/edit`);
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
    metadata: req.body.metadata,
    updatedAt: Date.now(),
  };
  try {
    updateManifest(manifest);
  } catch (err) {
    console.log(err);
  } finally {
    return res.redirect(`/manifests/${id}/edit`);
  }
});

router.get('/', checkAuth, async (req, res) => {
  const uid = req.user?.id!;
  try {
    const manifests = await getAllManifestsByUid(uid);
    return res.render('manifests/index', {
      manifests,
      flash: req.flash(),
    });
  } catch (err) {
    console.log(err);
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
    console.log(err);
  }
});

export default router;
