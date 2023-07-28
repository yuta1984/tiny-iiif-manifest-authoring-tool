import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { Manifest, User, Image } from '../types';

sqlite3.verbose();

export const getDB = async () => {
  return await open<sqlite3.Database, sqlite3.Statement>({
    filename: './db/db.sqlite3',
    driver: sqlite3.Database,
  });
};

export async function getUserById(id: string) {
  const db = await getDB();
  const sql = `
    SELECT * FROM users
    WHERE id = ?
  `;
  return await db.get<User>(sql, id);
}

function restoreMetadataArray(m: Manifest) {
  if (m.metadata && typeof m.metadata === 'string') {
    m.metadata = JSON.parse(m.metadata);
  }
  return m;
}

export async function getManifestById(id: string) {
  const db = await getDB();
  const sql = `
    SELECT * FROM manifests
    WHERE id = ?
  `;
  const m = await db.get<Manifest>(sql, id);
  return m ? restoreMetadataArray(m) : undefined;
}

export async function getAllManifestsByUid(uid: string) {
  const db = await getDB();
  const sql = `
    SELECT * FROM manifests
    WHERE uid = ?
    ORDER BY createdAt DESC
  `;
  const manifests = await db.all<Manifest[]>(sql, uid);
  return manifests.map(restoreMetadataArray);
}

export async function addManifest(m: Manifest) {
  if (Array.isArray(m.metadata)) {
    m.metadata = JSON.stringify(m.metadata);
  }
  const db = await getDB();
  const sql = `
    INSERT INTO manifests
    (id, uid, label, description, metadata, attribution, viewingHint, viewingDirection, logo, license, seeAlso, updatedAt, createdAt)
    VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const time = new Date().getTime();
  await db.run(sql, [
    m.id,
    m.uid,
    m.label,
    m.description,
    m.metadata,
    m.attribution,
    m.viewingHint,
    m.viewingDirection,
    m.logo,
    m.license,
    m.seeAlso,
    m.updatedAt || time,
    m.createdAt || time,
  ]);
}

export async function updateManifest(m: Partial<Manifest>) {
  if (Array.isArray(m.metadata)) {
    m.metadata = JSON.stringify(m.metadata);
  }
  const db = await getDB();
  const sql = `
    UPDATE manifests
    SET label = ?,
    description = ?,    
    attribution = ?,
    viewingHint = ?,
    viewingDirection = ?,
    logo = ?,
    license = ?,
    seeAlso = ?,
    metadata = ?,
    updatedAt = ?
    WHERE id = ?
  `;
  await db.run(sql, [
    m.label,
    m.description,
    m.attribution,
    m.viewingHint,
    m.viewingDirection,
    m.logo,
    m.license,
    m.seeAlso,
    m.metadata,
    m.updatedAt || new Date().getTime(),
    m.id,
  ]);
}

export async function deleteManifest(id: string) {
  const db = await getDB();
  const sql = `
    DELETE FROM manifests
    WHERE id = ?
  `;
  await db.run(sql, id);
}

export async function getImagesByManifestId(id: string) {
  const db = await getDB();
  const sql = `
    SELECT * FROM images
    WHERE manifestId = ?
  `;
  return await db.all<Manifest[]>(sql, id);
}

export async function addImage(
  i: Omit<Image, 'id' | 'createdAt'>
) {
  const db = await getDB();
  const sql = `
    INSERT INTO images
    (name, uid, size, width, height, manifestId, status, createdAt)
    VALUES
    (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const time = new Date().getTime();
  return await db.run(sql, [
    i.name,
    i.uid,
    i.size,
    i.width,
    i.height,
    i.manifestId,
    i.status,
    time,
  ]);
}

export async function deleteImage(name: string) {
  const db = await getDB();
  const sql = `
    DELETE FROM images
    WHERE name = ?
  `;
  await db.run(sql, name);
}

export async function getImage(name: string) {
  const db = await getDB();
  const sql = `
    SELECT * FROM images
    WHERE name = ?
  `;
  return await db.get<Image>(sql, name);
}
