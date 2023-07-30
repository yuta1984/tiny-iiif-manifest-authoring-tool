import { IIIF_BASE_URL } from '../config';

export function manifestURI(
  id: string,
  version = 2
): string {
  return `${IIIF_BASE_URL}api/presentation/${version}/${id}.json`;
}

export function iiifImageURI(
  name: string,
  version = 2
): string {
  return `${IIIF_BASE_URL}api/iiif/${version}/${name}.tif`;
}
