import common from "oci-common";
import os from "oci-objectstorage";
import fs from "fs";

const provider = new common.ConfigFileAuthenticationDetailsProvider(
  "C:\\Users\\linli\\.oci\\config",
  "DEFAULT"
);

const client = new os.ObjectStorageClient({
  authenticationDetailsProvider: provider,
});

const namespace = "iddukkrtuh3l";
const bucketName = "my-oci-blog-assets";

const content = Buffer.from("hello from my oci blog");
const objectName = `test/hello-${Date.now()}.txt`;

const result = await client.putObject({
  namespaceName: namespace,
  bucketName,
  objectName,
  putObjectBody: content,
  contentLength: content.length,
  contentType: "text/plain",
});

console.log("Upload OK:", result.etag, objectName);