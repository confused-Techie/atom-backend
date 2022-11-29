# Queries

This document aims to collect all the queries used to retrieve data from the SQL Database, as well as the resulting Object you'll receive from them.

But please note that this document is currently in progress, and may not contain all endpoints that are in production use.

* [Retrieve Single Package : Package Object Full](#retrievesinglepackagepackageobjectfull)
* [Retrieve Many Sorted Packages : Package Object Short](#retievemanysortedpackagespackageobjectshort)

---

## Retrieve Single Package : Package Object Full

```sql
SELECT p.*, JSON_AGG(v.*)
FROM packages p
JOIN versions v ON p.pointer = v.package
JOIN names n ON n.pointer = p.pointer
WHERE n.name = ${name}
GROUP BY p.pointer, v.package;
```

`utils.constructPackageObjectFull()` can be used to create a Package Object Full from this query.

Returns the following Object (Modeled after 'language-css'):

```
{
  pointer: 'b0024ed9-f69d-4389-a067-1025ac231851',
  name: 'language-css',
  created: 2022-09-08T05:58:07.546Z,
  updated: 2022-09-08T05:58:07.546Z,
  creation_method: 'Migrated from Atom.io',
  stargazers_count: '76',
  data: {
    name: 'language-css',
    readme: '# CSS language support in Atom\n' +
      'Adds syntax highlighting, completions, and snippets to CSS files in Atom.\n',
    metadata: {
      bugs: {
        url: 'https://github.com/atom/language-css/issues'
      },
      name: 'language-css',
      engines: {
        atom: '*',
        node: '*'
      },
      license: 'MIT',
      version: '0.45.7',
      homepage: 'http://atom.github.io/language-css',
      keywords: [ 'tree-sitter' ],
      repository: {
        url: 'https://github.com/atom/langauge-css',
        type: 'git'
      },
      description: 'CSS Support in Atom',
      dependencies: {
        'tree-sitter-css': '^0.19.0'
      },
      devDependencies: {
        coffeelint: '^1.10.1'
      }
    },
    repository: {
      url: 'https://github.com/atom/langauge-css',
      type: 'git'
    }
  },
  original_stargazers: '76',
  json_agg: [
    {
      id: 131489,
      package: 'b0024ed9-f69d-4389-a067-1025ac231851',
      status: 'latest',
      semver: '0.45.7',
      license: 'MIT',
      engine: {
        atom: '*',
        node: '*'
      },
      meta: {
        bugs: {
          url: 'https://github.com/atom/language-css/issues'
        },
        dist: {
          tarball: 'https://www.atom.io/api/packages/language-css/versions/0.45.7/tarball'
        },
        name: 'language-css',
        version: '0.45.7',
        homepage: 'http://atom.github.io/language-css',
        keywords: [ 'tree-sitter' ],
        repository: {
          url: 'https://github.com/atom/langauge-css',
          type: 'git'
        },
        description: 'CSS Support in Atom',
        dependencies: {
          'tree-sitter-css': '^0.19.0'
        },
        devDependencies: {
          coffeelint: '^1.10.1'
        }
      }
    },
    {
      id: 131490,
      package: 'b0024ed9-f69d-4389-a067-1025ac231851',
      status: 'published',
      semver: '0.45.6',
      license: 'MIT',
      engine: {
        atom: '*',
        node: '*'
      },
      meta: {
        bugs: {
          url: 'https://github.com/atom/language-css/issues'
        },
        dist: {
          tarball: 'https://www.atom.io/api/packages/language-css/versions/0.45.7/tarball'
        },
        name: 'language-css',
        version: '0.45.6',
        homepage: 'http://atom.github.io/language-css',
        keywords: [ 'tree-sitter' ],
        repository: {
          url: 'https://github.com/atom/langauge-css',
          type: 'git'
        },
        description: 'CSS Support in Atom',
        dependencies: {
          'tree-sitter-css': '^0.19.0'
        },
        devDependencies: {
          coffeelint: '^1.10.1'
        }
      }
    },
    ...
  ]
}
```

## Retrieve Many Sorted Packages : Package Object Short

```sql
SELECT * FROM packages AS p INNER JOIN versions AS v ON (p.pointer = v.package) AND (v.status = 'latest')
ORDER BY ${sort_method} ${sort_direction}
LIMIT ${limit}
OFFSET ${offset}
```

`utils.constructPackageObjectShort()` Can be used to create an array of Package Object Shorts from this query.

Returns the following Object: (Using sort_method = 'downloads', sort_direction = 'DESC', limit = 30, offset = 0)

```
[
  {
    pointer: '6a464942-781a-4311-92af-2e5fcafa564f',
    name: 'platformio-ide-terminal',
    created: 2022-09-08T05:46:49.741Z,
    updated: 2022-09-08T05:46:49.741Z,
    creation_method: 'Migrated from Atom.io',
    downloads: '16692421',
    stargazers_count: '1114',
    data: {
      ... (Read through Retrieve Signle Package .data )
    },
    original_stargazers: '1114',
    id: 109302,
    package: '',
    status: 'latest',
    semver: '2.10.1',
    license: 'MIT',
    engine: {
      atom: '>=1.12.2 <2.0.0'
    },
    meta: {
      sha: '[REDACTED]',
      dist: [OBJECT],
      main: './lib/platformio-ide-terminal',
      name: 'platformio-ide-terminal',
      author: 'Jeremy Ebneyamin',
      version: '2.10.1',
      homepage: 'https://atom.io/packages/platformio-ide-terminal',
      keywords: [ARRAY],
      repository: 'https://github.com/platformio/platformio-atom-ide-terminal',
      description: 'A terminal package for Atom, complete with themes, API and more for PlatformIO IDE. Fork of terminal-plus',
      tarball_url: 'https://api.github.com/repos/platformio/platformio-atom-ide-terminal/tarball/refs/tags/v2.10.1',
      contributors: [ARRAY],
      dependencies: [OBJECT],
      activationHooks: [ARRAY],
      consumedServices: [OBJECT],
      providedServices: [OBJECT]
    }
  },
  ...
]
```
