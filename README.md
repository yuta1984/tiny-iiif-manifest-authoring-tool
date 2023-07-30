# tiny-iiif-manifest-authoring-tool

A node.js web app that provides a one-stop solution for publishing IIIF resources, offering various functionalities from image uploading to IIIF manifest authoring.

# Overview

IIIF is an extremely useful framework for publishing image resources in an interoperable way. However, for individuals or small groups, publishing images using IIIF may not always be straightforward due to the technical complexities involved in tasks such as hosting IIIF Images and editing IIIF Manifests.

This web app, written with Express.js, enables individuals and small groups to easily publish IIIF resources through a simple set of steps. Specifically, it provides a straightforward web interface for the following tasks:

1. Upload images and publish them in the IIIF Image format (mostly achieved by [iiif-processor](https://github.com/samvera/node-iiif) ).
2. Editing and publishing IIIF manifests that reference these images.

This web app is intended to be minimalist. Users can only edit top-level properties such as `label`, `description`, and `attribution` within the editor. However, it should be sufficient to cover most scenarios encountered by individuals or small groups.


IIIFは、画像リソースを相互運用可能な方法で公開するための非常に有用なフレームワークです。しかしながら、個人や少数のグループにとっては、IIIFを使用して画像を公開することは常に簡単ではありません。IIIF ImageのホスティングやIIIF Manifestsの編集など、非技術者には難しい作業が必要になるからです。

express.jsで書かれたこのWebアプリの目的は、個人や少人数のグループが簡単にIIIFリソースを公開できるようにすることです。具体的には、このWebアプリは次のステップをワンストップでおこなうためのシンプルなユーザーインターフェースを提供します：

1. 画像をアップロードして、IIIF Image形式でWeb公開する（主に iiif-processor によって実現されます）。
2. これらの画像を参照するIIIFマニフェストを編集および公開する。

このWebアプリはミニマリスト的であることを意図されています。ユーザーがIIIFマニフェストのエディター内で編集できるのは、`label`、`description`、`attribution`といったトップレベルのプロパティのみです。しかしながら、個人や少人数のグループが直面するほとんどのケースはこれでカバーできるはずです。

# Dependencies

To use this application, you need to have the following installed:

- [Node.js](https://nodejs.org/)
- [ImageMagick](https://imagemagick.org/index.php)
- [SQLite](https://www.sqlite.org/index.html)

# Getting Started

```bash
# clone code
git clone https://github.com/yuta1984/tiny-iiif-manifest-authoring-tool

# move to directory
cd tiny-iiif-manifest-authoring-tool

# install dependent node modules
npm install

# initialize sqlite3 database
npm run init_db

# add user for login
npm add_user [username]

# start web server
IIIF_BASE_URL="https://yourdomain.com/” PORT=3000 npm start

# you may daemonize the server with pm2. See: https://pm2.keymetrics.io/docs/usage/quick-start/
npm install -g pm2

# start daemon
pm2 start "npm start" --name IIIFAuthoringTool

# stop daemon
pm2 stop IIIFAuthoringTool 
```

The environment variable IIIF_BASE_URL will be used as a prefix for properties like @id in the IIIF Manifest files.

# License

MIT License
