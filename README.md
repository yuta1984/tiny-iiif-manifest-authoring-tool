# tiny-iiif-manifest-authoring-tool
A tiny authoring tool for IIIF manifests with the function of serving as a IIIF Image hosting service.

# Overview
IIIF is an extremely useful framework for making image resources interoperable. However, for individuals or small groups, publishing images using IIIF may not always be straightforward due to the technical complexities involved in tasks such as hosting IIIF Images and editing IIIF Manifests.

This web application, based on Express.js, enables individuals and small groups to easily publish IIIF resources through a simple set of steps. Specifically, it provides a straightforward web interface for the following tasks:

1. Hosting user-uploaded images in IIIF Image format.
2. Editing IIIF Manifests that reference these images.

# Dependencies
To use this application, you need to have the following installed:
- [Node.js](https://nodejs.org/)
- [ImageMagick](https://imagemagick.org/index.php)
- [SQLite](https://www.sqlite.org/index.html)

# Getting Started
```bash
git clone https://github.com/yuta1984/tiny-iiif-manifest-authoring-tool

cd tiny-iiif-manifest-authoring-tool

# install dependencies
npm install

# initialize sqlite3 database
npm run init_db

# add user
npm add_user [username]

# start web server
IIIF_URI_PREFIX="https://yourdomain.com” PORT=3000 npm run serve
```
The environment variable IIIF_URI_PREFIX is used for properties like @id in the IIIF Manifest files.

# License
MIT License
