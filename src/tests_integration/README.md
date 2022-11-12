This folder contains the tests that rely on some sort of external service. These are the tests that cannot be self contained, or be at risk of being inaccurate.

Every test file that needs to exist has been created at this point, now only needing to incorporate all possible test.

It's recommended to run these tests with `npm run test:integration`

Which will automatically, granted you have `docker` installed and running, create a PostgreSQL server to use for any and all database calls.
