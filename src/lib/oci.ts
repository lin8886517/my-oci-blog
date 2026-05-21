import common from "oci-common";
import os from "oci-objectstorage";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getNamespaceName() {
  return getRequiredEnv("OCI_NAMESPACE");
}

export function getBucketName() {
  return getRequiredEnv("OCI_BUCKET_NAME");
}

export function getObjectStorageClient() {
  const tenancy = getRequiredEnv("OCI_TENANCY_ID");
  const user = getRequiredEnv("OCI_USER_ID");
  const fingerprint = getRequiredEnv("OCI_FINGERPRINT");
  const privateKey = getRequiredEnv("OCI_PRIVATE_KEY");
  const regionId = getRequiredEnv("OCI_REGION");

  const region = common.Region.fromRegionId(regionId);

  const provider = new common.SimpleAuthenticationDetailsProvider(
    tenancy,
    user,
    fingerprint,
    privateKey.replace(/\\n/g, "\n"),
    null,
    region
  );

  return new os.ObjectStorageClient({
    authenticationDetailsProvider: provider,
  });
}