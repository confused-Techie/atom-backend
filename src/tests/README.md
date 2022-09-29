This folder contains the tests that can easily and safely be self contained. Relying on zero external services.

Every test file that needs to exist has been created at this point, now only needing to incorporate all possible tests.

It's recommended to run these tests with `npm run test:unit`

Which just runs this folder using `jest` doing zero setup for external services, thus why we can't rely on them.
