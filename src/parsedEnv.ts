export const photoStorageDir = process.env.PHOTO_STORAGE_DIR ?? "./photos";
export const photoRequired = parseBool(process.env.PHOTO_REQUIRED) ?? true;

export const locationRequired: boolean =
  parseBool(process.env.LOCATION_REQUIRED) ?? true;

export const pageSize = parseInt(process.env.PAGE_SIZE ?? "100");

function parseBool(x: string | undefined): boolean | undefined {
  if (x === "true") return true;
  else if (x === "false") return false;
  return undefined;
}

export const nodeEnv = process.env.NODE_ENV || "development";

const env = {
  photoStorageDir,
  photoRequired,
  locationRequired,
  pageSize,
  nodeEnv,
};
export default env;
