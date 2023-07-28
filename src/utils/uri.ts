import { IIIF_URI_PREFIX } from '../config';

export function manifestURI(
  id: string,
  version = 2
): string {
  return `${IIIF_URI_PREFIX}api/presentation/${version}/${id}.json`;
}

export function iiifImageURI(
  name: string,
  version = 2
): string {
  return `${IIIF_URI_PREFIX}api/iiif/${version}/${name}.tif`;
}
