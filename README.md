# Atom Community Server Backend JS
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/d4ca4ded429c446fb28d0654c8c05d6d)](https://www.codacy.com/gh/confused-Techie/atom-community-server-backend-JS/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=confused-Techie/atom-community-server-backend-JS&amp;utm_campaign=Badge_Grade)

> This is originally based off the research done on [Atom Community Server Backend](https://github.com/confused-Techie/atom-community-server-backend) which was written in Golang. But has been switched to JS for more broad support.

## Documentation

To view researched information and the behavior that will be mirrored from the original Backend is available [here](/docs/overview.md).

If you would like to read more about the routes available those are available [here](/docs/api.md).

There's a crash course guide to any new contributors available [develpers.md](/docs/developers.md). As well as JSDoc generated [documentation](/docs/JavaScript.md) of the source code.

Additionally for any bug hunters [Complexity Reports](/docs/complexity-report.md) are generated. Keep in mind since the tools underlying AST generator doesn't support ES6 not everything is included currently.

Finally there are many `TODO::`s scattered around for things that still need to be done. Otherwise a collection of 'Good First Issues' are [available](https://github.com/confused-Techie/atom-community-server-backend-JS/issues). And lastly theres a collection of all [functions/methods](/docs/major_todo.md) and their current status to help someone quickly jump in.

If you'd like to help [Atom-Community Core](https://github.com/atom-community/atom) there is still much work to be done.

Please note that for the time being this documentation of the Read Me is overly verbose to allow easy communication while in development.

### Data

There is quite a bit of data that can be obtained from the API.

The API needs to be aware of:

* Package Repo entries
* List of valid users and tokens to provide for them.
* Each users list of all stared repos
* Each repos list of all users that have starred it.
* The time a repo was created
* The last time a repo has been updates.

Things to note:

* When a repo has a change of name, the old name will permanently redirect to its current version of the repo.
* This means the name of a repo is never able to be a unique identifier.
* A repo can transfer owners
* This means the owner or creator of a repo is also not sufficient to be a unique identifier.

This means that simply storing the archive or future package repo entries will not be sufficient.

The proposed solution to this issue:

A possible way to solve this issue while not having to work with complex data types.

#### package_pointer.json
This file will act as a pointer to the specific data of each package.
With each key being a packages name, and pointing to its raw file location.
If a package changes name a new entry will be created under the new name, pointing to the same file.
This also means if we don't remove the previous entry, the old name will still point to the file.

#### package_repo files
These JSON files will be saved under a UUID like so `UUIDv4.json` allowing any content inside to change
while always pointing to the same file.
This UUIDv4.json will also be the location the package_pointer.json index will refer to.

Within each package file will be additional data not retreived in the API. Including a list of all users
that have stared the package, listed by their username.
Additionally will list the creation date, and last modified date.
But these values will be removed before returning via the API.

#### users.json
A large user object. Where their username is the key to the object, and inside will be (once we determine how to handle auth) any valid keys for the user, which is used to check authenticated requests,
additionally which will contain an array of every package they have stared. This value can use the packages name, as long as it then uses the pointer to find the package data.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/confused-Techie"><img src="https://avatars.githubusercontent.com/u/26921489?v=4?s=100" width="100px;" alt=""/><br /><sub><b>confused_techie</b></sub></a><br /><a href="https://github.com/confused-Techie/atom-community-server-backend-JS/commits?author=confused-Techie" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Digitalone1"><img src="https://avatars.githubusercontent.com/u/25790525?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Giusy Digital</b></sub></a><br /><a href="https://github.com/confused-Techie/atom-community-server-backend-JS/commits?author=Digitalone1" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
