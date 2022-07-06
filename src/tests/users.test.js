const users = require("../users.js");

// ============== users.VerifyAuth()
// === Accepts valid token?
test("users.VerifyAuth accepts DEV 'valid_token'", async () => {
  const data = await users.VerifyAuth("valid_token");
  expect(data.ok).toBe(true);
});

// === Denies invalid token?
test("users.VerifyAuth denies DEV 'invalid_token'", async () => {
  const data = await users.VerifyAuth("invalid_token");
  expect(data.ok).toBe(false);
});

// ============== users.GetUser()
// === Returns valid user?
test("users.GetUser returns DEV 'confused-Techie' provided 'confused-Techie'", async () => {
  const data = await users.GetUser("confused-Techie");
  expect(data.content.name).toBe("confused-Techie");
});

// === "Not Found" on invalid user?
test("users.GetUser returns DEV Not Found provided 'not-confused-Techie'", async () => {
  const data = await users.GetUser("not-confused-Techie");
  expect(data.short).toBe("Not Found");
});

// ============== users.AddUserStar()
// === Adds star?
test("Ability to add arbitrary package to stars.", async () => {
  const data = await users.AddUserStar("testing", "confused-Techie");
  if (data.ok) {
    const reData = await users.GetUser("confused-Techie");
    expect(reData.content.stars.includes("testing")).toBeTruthy();
  } else {
    fail(`Wasn't able to add user star. ${data}`);
  }
});

// ============== users.RemoveUserStar()
// == Removes star?
test("Ability to remove arbitrary package from stars.", async () => {
  const data = await users.RemoveUserStar("testing", "confused-Techie");
  if (data.ok) {
    const reData = await users.GetUser("confused-Techie");
    expect(reData.content.stars.includes("testing")).toBeFalsy();
  } else {
    fail(`Wasn't able to remove user star. ${data}`);
  }
});

// ============== users.Prune()
// === Removes atom_token?
test("Does user.Prune remove 'atom_token'", async () => {
  const data = await users.GetUser("confused-Techie");
  if (data.ok) {
    const pruned = await users.Prune(data.content);
    expect(pruned.atom_token).toBeUndefined();
  } else {
    fail(`Wasn't able to get the user, to test prune. ${data}`);
  }
});

// === Removes github_token?
test("Does user.Prune remove 'github_token'", async () => {
  const data = await users.GetUser("confused-Techie");
  if (data.ok) {
    const pruned = await users.Prune(data.content);
    expect(pruned.github_token).toBeUndefined();
  } else {
    fail(`Wasn't able to get the user, to test prune. ${data}`);
  }
});

// === Removes created_at?
test("Does user.Prune remove 'created_at'", async () => {
  const data = await users.GetUser("confused-Techie");
  if (data.ok) {
    const pruned = await users.Prune(data.content);
    expect(pruned.created_at).toBeUndefined();
  } else {
    fail(`Wasn't able to get the user, to test prune. ${data}`);
  }
});
