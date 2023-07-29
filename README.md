# tiny-iiif-manifest-authoring-tool
A tiny authoring tool for IIIF manifests with the function of serving as a IIIF Image hosting service.

# Overview
IIIF is an extremely useful framework for publishing image resources in an interoperable way. However, for individuals or small groups, publishing images using IIIF may not always be straightforward due to the technical complexities involved in tasks such as hosting IIIF Images and editing IIIF Manifests.

This web application, based on Express.js, enables individuals and small groups to easily publish IIIF resources through a simple set of steps. Specifically, it provides a straightforward web interface for the following tasks:

1. Upload images and publish them in the IIIF Image format (mostly achieved by [iiif-processor](https://github.com/samvera/node-iiif) ).
2. Editing IIIF manifests that reference these images.

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
IIIF_URI_PREFIX="https://yourdomain.com” PORT=3000 npm run serve
```
The environment variable IIIF_URI_PREFIX is used for properties like @id in the IIIF Manifest files.

# License
MIT License
