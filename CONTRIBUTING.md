This project welcomes all forms of contributions, and everything is always appreciated.

But please before contributing ensure to read this document in it's entirety.

## Guidelines

Our contributing guidelines and conventions surrounding all types of contributions.

* Keep the barrier to entry low. This codebase does everything it can to reduce the complexity of any single area of code. Hopefully allowing developers to infer the behavior and returns of any function or module easily by looking at similar ones around it. If you PR adds additional complexity or causes something to behave differently than what you would assume from all other features around it, make sure there is a good justification for doing so and that there is no other way to reduce this complexity to outside modules.
* Document, Document, and Document.
  - If you are adding a new function ensure to write some type of documentation for it in [JSDoc](https://jsdoc.app/) comments.
  - If you are adding or modifying an API endpoint and how it behaves, ensure to write the appropriate [JSDoc-Like](https://www.npmjs.com/package/@confused-techie/quick-webserver-docs) comments.
  - Help make sure the rest of our docs stay up to date, such as adding a new Server Status Object Short Code make sure to add it to [bubbled_errors.md](/docs/reference/bubbled_errors.md). Or when adding a new Numeric Error Code ensure to add it to [numeric_error_codes.md](/docs/reference/numeric_error_codes.md).
* Be kind. This should be known after reading our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), but it deserves to be said again. All interactions should be kind.

## Important Consideration

As known from the readme, this project will live in two places.
  - [Atom Backend](https://github.com/confused-Techie/atom-backend)
  - [Pulsar Backend](https://github.com/pulsar-edit/package-backend)

Again the Atom Backend is only ever meant to reach feature parity with the original Atom.io Package Backend. Any improvements to how the backend behaves should go to the Pulsar Backend.

So when wanting to contribute consider the following examples:
  - You want to add a new query parameter to an endpoint - Add it to the Pulsar Backend, since it didn't original exist.
  - You want to remove a query parameter that is no longer used - Add it to the Pulsar Backend, since it would be incompatible with the original Atom application.
  - You've found a bug in how an endpoint behaves - Add it to the Atom Backend, since fixing this would ensure it behaves how Atom's did originally.
  - You've found an originally undocumented endpoint from Atom and want to add it - Add it to the Atom Backend, since it should have been there from the start.

If at any time you are unsure where to direct your PR, please feel free to reach out via Issues, in the PR's themselves, or to the [Pulsar Discord](https://discord.gg/7aEbB9dGRT) in the #backend channel.

## Resources

There a few moving parts within this codebase, and a great deal of care has been put into our [docs](/docs/reference/index.md). Please feel free to read them.

## Last Notes

To reiterate all contributors are welcome, and all contributions are welcome.

And as always thanks for contributing!
