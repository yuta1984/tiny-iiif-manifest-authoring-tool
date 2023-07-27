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
  check('license').not().isEmpty().trim().escape(),
];

router.post(
  '/',
  checkAuth,
  ...formCheck,
  async (req, res) => {
    const uid = req.user!.id;
    console.log(req.body);
    // validate form
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.render('manifests/new', {
        errors: errors.array(),
        data: req.body,
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
      return res.redirect(`/manifests/`);
    } catch (err) {
      console.log(err);
      return res.render('manifests/new', {
        errors: err,
        data: req.body,
      });
    }
  }
);

router.get('/new', checkAuth, (req, res) => {
  return res.render('manifests/new', { data: {} });
});

router.get(
  '/:id/edit',
  checkAuth,

  async (req, res) => {
    const id = req.params.id;
    // validate form
    try {
      const manifest = await getManifestById(id);
      return res.render('manifests/edit', { manifest, id });
    } catch (err) {
      console.log(err);
      return res.render('manifests/edit', {
        manifest: {},
        id,
      });
    }
  }
);

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
    return res.render('manifests/index', { manifests });
  } catch (err) {
    console.log(err);
  }
});

export default router;
