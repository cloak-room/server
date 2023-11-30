export const photoStorageDir = process.env.PHOTO_STORAGE_DIR ?? "./photos";
export const photoRequired = parseBool(process.env.PHOTO_REQUIRED) ?? true;

export const locationRequired: boolean =
  parseBool(process.env.LOCATION_REQUIRED) ?? true;

function parseBool(x: string | undefined): boolean | undefined {
  if (x === "true") return true;
  else if (x === "false") return false;
  return undefined;
}

const env = { photoStorageDir, photoRequired, locationRequired };
export default env;
