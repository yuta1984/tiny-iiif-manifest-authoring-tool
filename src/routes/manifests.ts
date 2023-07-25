import sqlite3 from "sqlite3";
import express from "express";
import { check, validationResult } from "express-validator";
import { requireLogin } from "./auth";
import getDB from "../utils/getDB";

const router = express.Router();
const db = new sqlite3.Database("./db/db.sqlite3");

const formCheck = [
  check("id")
    .matches(/^[A-Za-z0-9_]+$/i)
    .trim()
    .escape(),
  check("label").not().isEmpty().trim().escape(),
  check("description").not().isEmpty().trim().escape(),
  check("attribution").not().isEmpty().trim().escape(),
  check("license").not().isEmpty().trim().escape(),
];

router.post("/", ...formCheck, (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
  }
  const uid = req.user!.id;
  // validate form
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.render("manifests/new", {
      errors: errors.array(),
      data: req.body,
    });
  } else {
    db.serialize(() => {
      db.run(
        `INSERT INTO manifests (
        id, 
        uid,
        label, 
        description, 
        attribution,         
        viewingDirection,
        viewingHint,
        logo,
        license
        )
      VALUES (?,?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.body.id,
          uid,
          req.body.label,
          req.body.description,
          req.body.attribution,
          req.body.viewingDirection,
          req.body.viewingHint,
          req.body.logo,
          req.body.license,
        ],
        (err) => {
          console.log(err);
          if (err) {
            return res.render("manifests/new", { errors: err });
          } else {
            return res.redirect("/manifests");
          }
        }
      );
    });
  }
});

router.get("/new", (req, res) => {
  requireLogin(req, res);
  return res.render("manifests/new", { data: {} });
});

router.get("/:id/edit", (req, res) => {
  requireLogin(req, res);
  const id = req.params.id;
  db.serialize(() => {
    db.get(`SELECT * FROM manifests WHERE id = ?`, [id], (err, row) => {
      if (err) {
        return res.render("manifests/edit", { errors: err, isEdit: true });
      } else {
        return res.render("manifests/edit", {
          manifest: row,
          isEdit: true,
          id,
        });
      }
    });
  });
});

router.post("/:id", ...formCheck, (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
  }
  const id = req.params!.id;
  console.log("updating manifest: ", id);
  // validate form
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect(`/manifests/${id}/edit`);
  } else {
    db.serialize(() => {
      console.log(req.body);
      db.run(
        `UPDATE manifests SET 
          label = ?, 
          description = ?, 
          attribution = ?,         
          viewingDirection = ?,
          viewingHint = ?,
          logo = ?,
          license = ?        
        WHERE id = ?`,
        [
          req.body.label,
          req.body.description,
          req.body.attribution,
          req.body.viewingDirection,
          req.body.viewingHint,
          req.body.logo,
          req.body.license,
          id,
        ],
        (err) => {
          console.log("sql update error:", err);
          if (err) {
            return res.render(`manifests/edit`);
          } else {
            return res.redirect(`/manifests/${id}/edit`);
          }
        }
      );
    });
  }
});

router.get("/", (req, res) => {
  requireLogin(req, res);
  const uid = req.user?.id;
  db.serialize(() => {
    db.all(`SELECT * FROM manifests WHERE uid = ?`, [uid], (err, rows) => {
      if (err) {
        return res.render("manifests/index", { errors: err });
      } else {
        console.log(rows);
        return res.render("manifests/index", { manifests: rows });
      }
    });
  });
});

router.get("/:id/browse", async (req, res) => {
  const db = await getDB();
  const id = req.params.id;
  // get manifest record by id
  const manifest = await db.get("SELECT * FROM manifests WHERE id = ?", id);
  return res.render("manifests/browse", { manifest });
});

router.get("/:id.json", async (req, res) => {
  const db = await getDB();
  const id = req.params.id;
  // get manifest record by id
  const manifest = await db.get("SELECT * FROM manifests WHERE id = ?", id);
  // get all images for this manifest
  const images = await db.all("SELECT * FROM images WHERE manifestId = ?", id);
  const json: any = {};
  json["@context"] = "http://iiif.io/api/presentation/2/context.json";
  json["@id"] = `${req.protocol}://${req.get("host")}/manifests/${id}.json`;
  json["@type"] = "sc:Manifest";
  json["label"] = manifest.label;
  json["description"] = manifest.description;
  json["attribution"] = manifest.attribution;
  json.logo = manifest.logo;
  json.license = manifest.license;
  json.seeAlso = manifest.seeAlso;
  json.sequences = [
    {
      "@type": "sc:Sequence",
      viewIngHint: manifest.viewingHint,
      canvases: images.map((image: any, index: number) => {
        return {
          "@id": `${req.protocol}://${req.get("host")}/api/${
            image.name
          }/canvas/${index + 1}`,
          "@type": "sc:Canvas",
          label: `Image ${index + 1}`,
          height: image.height,
          width: image.width,
          images: [
            {
              "@type": "oa:Annotation",
              motivation: "sc:painting",
              on: `${req.protocol}://${req.get("host")}/api/${
                image.name
              }/canvas/${index + 1}`,
              resource: {
                "@id": `${req.protocol}://${req.get("host")}/iiif/2/${
                  image.name
                }.tif/full/full/0/default.jpg`,
                "@type": "dctypes:Image",
                format: "image/jpeg",
                height: image.height,
                width: image.width,
                service: {
                  "@context": "http://iiif.io/api/image/2/context.json",
                  "@id": `${req.protocol}://${req.get("host")}/iiif/2/${
                    image.name
                  }.tif`,
                  profile: "http://iiif.io/api/image/2/level2.json",
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
