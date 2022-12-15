# Pulsar's Packages

Welcome to any package maintainers that have been directed here.

This document will detail the how and why Pulsar has the packages that it does available on the Pulsar Package Repository, as well as what to do if you find your package listed here, and want it removed, or why you're package may no longer be listed here while it was on Atom.

---

The Pulsar Package Repository came about during the very early days of Atom's announced sunset, and as such the priority of the project was to keep the large package ecosystem that Atom had alive and well. To do this, of course, we needed to have every package that was originally published.

After all original packages where archived, if you'd like more details feel free to read through a [blog post](https://pulsar-edit.dev/blog/20221127-confused-Techie-SunsetMisadventureBackend.html) on this topic, steps were then taken to ensure the quality of our archived packages.

After the initial archive of packages we had a collection of 12,470 packages from Atom.io

To do this the first steps that were taken comprised of the following.

- Make sure every package linked to a valid and public GitHub repo. (Since you cannot install a package if the GitHub is private or deleted)
- Make sure every package had a URL safe name. (This is due to the safety mechanism on the new backend.)
- Lastly, remove any packages that had been reported for Malware.

Taking these steps resulted in:

- Packages removed due to their GitHub being unavailable: 1,381
- Packages removed due to URL-Unsafe names: 5
- Packages Removed due to having Banned Names: 10

This then leaves us with 11,074 packages that are still valid.

At this point we then got to work migrating all packages left into the new backend.

Along the way there were additional packages or package versions that were removed for various reasons. You can see exactly which packages were effected in [Administrative Actions](Admin_Actions.md).

## What should you do if your package isn't listed from Atom?

If you'd like your package to be listed and it's not, very likely the reason is one of the stated quality checks done. The best thing you can do is resolve the above issue/issues and [publish](https://pulsar-edit.dev/docs/launch-manual/sections/core-hacking/#publishing) your package to Pulsar as if it was a new package.

## What should you do if your package IS listed on the Pulsar Repo and you'd like it removed?

While in the future there are plans to allow this process to be much easier, for the time being, the best way to remove your Package from the Pulsar Package Repository is to either

1) Create an Account with Pulsar, and [remove the package](https://pulsar-edit.dev/docs/launch-manual/sections/behind-pulsar/#unpublish-your-package) as if it was still on Atom.
2) Contact the [Pulsar Admin Team](https://pulsar-edit.dev/community.html) to request removal of your package.
