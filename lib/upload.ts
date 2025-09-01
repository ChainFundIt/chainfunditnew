import { createUploadConfig } from 'pushduck/server';

const { s3 } = createUploadConfig()
  .provider("cloudflareR2",{
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    region: 'auto',
    endpoint: process.env.AWS_ENDPOINT_URL!,
    bucket: process.env.S3_BUCKET_NAME!,
    accountId: process.env.R2_ACCOUNT_ID!,
  })
  .build();

export const uploadRouter = s3.createRouter({
  imageUpload: s3.image(),
  documentUpload: s3.file()
});

export type AppUploadRouter = typeof uploadRouter;