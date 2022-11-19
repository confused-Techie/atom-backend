Alright, auth is a pain, lets all admit it.

The plan for authentication has gone through many many revisions.

But lets lay them out here and see what and why they kept being switched.

---

The Current Plan:

Alright, so what about this -

We don't save anything we don't have to.

Basically when a user creates an account we use the token provided to collect some user info.
Mainly their name, and their and avatar url. That's basically it. Maybe if we need to their node_id or just id. Probably should contact GitHub to see if this is truly random.

But once we have created their account we then don't save any auth. Anytime they need to authenticate, we are provided a token, we use this token to find the user ifnormation of whoever owns it.

If that user is in our db, we continue to check if they have permissions for whatever action they've requested.

Now they are authenticated.

The drawbacks:

They have to provide a token often, that may expire or otherwise become invalid, and may increase sign ins.

We have to frequently reach out to GitHub, every single time they authenticate we reach out to GitHub.

If the user name changes how to ensure we have the same user? How do we know when to update their username here.
