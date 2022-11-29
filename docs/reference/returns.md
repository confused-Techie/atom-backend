# Returns

This document details the JSON schema that many endpoints are expected to provide, as well as the names assigned to them in this project.

## Package Object Short

This is the most common return for a package, which leaves out some details of the package, most notably, all versions extra versions and version information. This includes enough data allowing the user to understand the package itself and to download the latest version of its source.

### Schema

```json
{
  "name": "language-css",
  "repository": {
    "type": "git",
    "url": "https://github.com/atom/language-css"
  },
  "downloads": 400004,
  "stargazers_count": 76,
  "releases": {
    "latest": "0.45.7"
  },
  "readme": "# CSS language support in Atom\n",
  "metadata": {
    "name": "language-css",
    "description": "CSS support in Atom",
    "keywords": [
      "tree-sitter"
    ],
    "version": "0.45.7",
    "engines": {
      "atom": "*",
      "node": "*"
    },
    "homepage": "http://atom.github.io/language-css",
    "repository": {
      "type": "git",
      "url": "https://github.com/atom/language-css.git"
    },
    "license": "MIT",
    "bugs": {
      "url": "https://github.com/atom/language-css/issues"
    },
    "devDependencies": {
      "coffeelint": "^1.10.1"
    },
    "dependencies": {
      "tree-sitter-css": "^0.19.0"
    }
  }
}
```

### Returns Where this is Expected

The following is a list of endpoints that are expected to return Packages in this format.

* GET /api/packages - This endpoint returns packages as an Array of Package Object Shorts.
* GET /api/packages/search - This endpoint returns packages as an Array of Package Object Shorts.
* GET /api/stars - This endpoint returns packages as an Array of Package Object Shorts.

---

## Package Object Full

This is the second most common return for a package, which includes full details of the package, as well as the details for every version of this package, published to the backend. Containing all information that could possible be required of it.

### Schema

```json
{
  "name": "language-css",
  "repository": {
    "type": "git",
    "url": "https:/github.com/atom/language-css"
  },
  "downloads": 400004,
  "stargazers_count": 76,
  "releases": {
    "latest": "0.45.7"
  },
  "versions": {
    "0.45.7": {
      "name": "language-css",
      "description": "CSS Support in Atom",
      "keywords": [
        "tree-sitter"
      ],
      "version": "0.45.7",
      "engines": {
        "atom": "*",
        "node": "*"
      },
      "homepage": "http://atom.github.io/language-css",
      "repository": {
        "type": "git",
        "url": "https://github.com/atom/language-css.git"
      },
      "license": "MIT",
      "bugs": {
        "url": "https://github.com/atom/language-css/issues"
      },
      "devDependencies": {
        "coffeelint": "^1.10.1"
      },
      "dependencies": {
        "tree-sitter-css": "^0.19.0"
      },
      "dist": {
        "tarball": "https:/www.atom.io/api/packages/language-css/versions/0.45.7/tarball"
      }
    },
    "0.45.6": {
      ... ( Contains the package.json for this version )
    },
    ... ( Contains every other version published to the backend )
  },
  "readme": "# CSS language support in Atom\n",
  "metadata": {
    "name": "language-css",
    "description": "CSS Support in Atom",
    "keywords": [
      "tree-sitter"
    ],
    ... ( Contains the latest Version package.json )
  }
}
```

### Returns Where this is Expected

* GET /api/packages/:packageName - This endpoint returns a Single Package Object Full
* POST /api/packages - This endpoint returns a Single Package Object Full
* POST /api/packages/:packageName/star - This endpoint returns a Single Package Object Full

---

## Package Object Mini

This is generally the smallest form package that will be returned. Essentially just containing the packages `package.json` of a specific version. With a download link added to it. This is essentially what is returned to allow downloading the package.

### Schema

```json
{
  "name": "language-css",
  "description": "CSS support in Atom",
  "keywords": [
    "tree-sitter"
  ],
  "version": "0.45.4",
  "engines": {
    "atom": "*",
    "node": "*"
  },
  "homepage": "http://atom.github.io/language-css",
  "repository": {
    "type": "git",
    "url": "https://github.com/atom/language-css.git"
  },
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/atom/language-css/issues"
  },
  "devDependencies": {
    "coffeelint": "^1.10.1"
  },
  "dependencies": {
    "tree-sitter-css": "^0.19.0"
  },
  "dist": {
    "tarball": "https://www.atom.io/api/packages/language-css/versions/0.45.4/tarball"
  }
}
```

### Returns Where this is Expected

* GET /api/packages/:packageName/versions/:versionName - Returns a single Package Object Mini
* POST /api/packages/:packageName/versions - Returns a single Package Object Mini

---

## User Object

This return is for informing the user about users involved in a package.

### Schema

```json
{
  "login": "theirUserName"
}
```

### Returns Where this is Expected

* GET /api/packages/:packageName/stargazers - Returns an array of User Objects
