# Background

This repo contains an example script that demonstrates a bug with the AWS JS SDK V3 that results in incorrect checksum mismatches when fetching a compressed file from S3 via the GetObject API.

# Dependencies to install
- https://yarnpkg.com/
- https://rollupjs.org/
- https://nodejs.org/en

# Building and running
```sh
yarn install
rollup -c
node dist/s3.mjs
```