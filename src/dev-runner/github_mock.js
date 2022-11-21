/**
 * @module github_mock
 * @desc This module is only used during testing. It exists to attempt to fully test
 * the ./src/git.js module by allowing it to carry out API requests and respond accordingly,
 * but without having to hammer GitHub Servers or have to worry about credential managment
 * in CI environments.
 */

const express = require("express");
const app = express();

app.get("/user/repos", (req, res) => {
  let param = {
    page: req.params.page,
    auth: req.get("Authorization"),
  };

  // Then we choose what to do depending on which user is requesting access.

  switch (param.auth) {
    case "Bearer admin-token":
      // user: admin_user token: admin-token
      res
        .status(200)
        .set({
          Authorization: req.get("Authorization"),
          "User-Agent": req.get("User-Agent"),
          Link: '<localhost:9999/user/repos?page=1>; rel="first", <localhost:9999/user/repos?page=1>; rel="last"',
        })
        .json([
          {
            id: 123456,
            full_name: "admin_user/atom-backend",
          },
        ]);
      break;
    case "Bearer no-valid-token":
      // user: no_perm_user token: no-valid-token
      res
        .status(401)
        .set({
          Authorization: req.get("Authorization"),
          "User-Agent": req.get("User-Agent"),
          Link: '<localhost:9999/user/repos?page=1>; rel="first", <localhost:9999/user/repos?page=1>; rel="last"',
        })
        .json({
          message: "Requires authentication",
          documentation_url:
            "https://docs.github.com/rest/reference/repo#list-repositories-for-the-authenticated-user",
        });
      break;
    default:
      res.status(500).json({ message: "huh??" });
      break;
  }
});

app.get("/git-test/atom-backend", async (req, res) => {
  // This endpoint will always return that the 'repo' exists and is valid.
  res.status(200).send();
});

app.get("/git-test/does-not-exist", (req, res) => {
  // This endpoint will always return that the 'repo' does not exist.
  res.status(404).send();
});

app.get("/repos/git-test/atom-backend/contents/package.json", (req, res) => {
  // This endpoint will always return a repo readme. Modeled after `pulsar-edit/find-and-replace`
  res.status(200).json({
    name: "package.json",
    path: "package.json",
    sha: "eee0d8f6f57ea9530cf202425459ed690ece9241",
    size: 5036,
    url: "https://api.github.com/repos/pulsar-edit/find-and-replace/contents/package.json?ref=master",
    html_url:
      "https://github.com/pulsar-edit/find-and-replace/blob/master/package.json",
    git_url:
      "https://api.github.com/repos/pulsar-edit/find-and-replace/git/blobs/eee0d8f6f57ea9530cf202425459ed690ece9241",
    download_url:
      "https://raw.githubusercontent.com/pulsar-edit/find-and-replace/master/package.json",
    type: "file",
    content:
      "ewogICJuYW1lIjogImZpbmQtYW5kLXJlcGxhY2UiLAogICJtYWluIjogIi4v\nbGliL2ZpbmQiLAogICJkZXNjcmlwdGlvbiI6ICJGaW5kIGFuZCByZXBsYWNl\nIHdpdGhpbiBidWZmZXJzIGFuZCBhY3Jvc3MgdGhlIHByb2plY3QuIiwKICAi\ndmVyc2lvbiI6ICIwLjIxOS44IiwKICAibGljZW5zZSI6ICJNSVQiLAogICJh\nY3RpdmF0aW9uQ29tbWFuZHMiOiB7CiAgICAiYXRvbS13b3Jrc3BhY2UiOiBb\nCiAgICAgICJwcm9qZWN0LWZpbmQ6c2hvdyIsCiAgICAgICJwcm9qZWN0LWZp\nbmQ6dG9nZ2xlIiwKICAgICAgInByb2plY3QtZmluZDpzaG93LWluLWN1cnJl\nbnQtZGlyZWN0b3J5IiwKICAgICAgImZpbmQtYW5kLXJlcGxhY2U6c2hvdyIs\nCiAgICAgICJmaW5kLWFuZC1yZXBsYWNlOnRvZ2dsZSIsCiAgICAgICJmaW5k\nLWFuZC1yZXBsYWNlOmZpbmQtYWxsIiwKICAgICAgImZpbmQtYW5kLXJlcGxh\nY2U6ZmluZC1uZXh0IiwKICAgICAgImZpbmQtYW5kLXJlcGxhY2U6ZmluZC1w\ncmV2aW91cyIsCiAgICAgICJmaW5kLWFuZC1yZXBsYWNlOmZpbmQtbmV4dC1z\nZWxlY3RlZCIsCiAgICAgICJmaW5kLWFuZC1yZXBsYWNlOmZpbmQtcHJldmlv\ndXMtc2VsZWN0ZWQiLAogICAgICAiZmluZC1hbmQtcmVwbGFjZTp1c2Utc2Vs\nZWN0aW9uLWFzLWZpbmQtcGF0dGVybiIsCiAgICAgICJmaW5kLWFuZC1yZXBs\nYWNlOnVzZS1zZWxlY3Rpb24tYXMtcmVwbGFjZS1wYXR0ZXJuIiwKICAgICAg\nImZpbmQtYW5kLXJlcGxhY2U6c2hvdy1yZXBsYWNlIiwKICAgICAgImZpbmQt\nYW5kLXJlcGxhY2U6cmVwbGFjZS1uZXh0IiwKICAgICAgImZpbmQtYW5kLXJl\ncGxhY2U6cmVwbGFjZS1hbGwiLAogICAgICAiZmluZC1hbmQtcmVwbGFjZTpz\nZWxlY3QtbmV4dCIsCiAgICAgICJmaW5kLWFuZC1yZXBsYWNlOnNlbGVjdC1h\nbGwiLAogICAgICAiZmluZC1hbmQtcmVwbGFjZTpjbGVhci1oaXN0b3J5Igog\nICAgXQogIH0sCiAgInJlcG9zaXRvcnkiOiAiaHR0cHM6Ly9naXRodWIuY29t\nL3B1bHNhci1lZGl0L2ZpbmQtYW5kLXJlcGxhY2UiLAogICJlbmdpbmVzIjog\newogICAgImF0b20iOiAiKiIKICB9LAogICJkZXBlbmRlbmNpZXMiOiB7CiAg\nICAiYmluYXJ5LXNlYXJjaCI6ICJeMS4zLjMiLAogICAgImV0Y2giOiAiMC45\nLjMiLAogICAgImZzLXBsdXMiOiAiXjMuMC4wIiwKICAgICJ0ZW1wIjogIl4w\nLjguMyIsCiAgICAidW5kZXJzY29yZS1wbHVzIjogIjEueCIKICB9LAogICJk\nZXZEZXBlbmRlbmNpZXMiOiB7CiAgICAiY29mZmVlbGludCI6ICJeMS45Ljci\nLAogICAgImRlZGVudCI6ICJeMC42LjAiCiAgfSwKICAiY29uc3VtZWRTZXJ2\naWNlcyI6IHsKICAgICJhdG9tLmZpbGUtaWNvbnMiOiB7CiAgICAgICJ2ZXJz\naW9ucyI6IHsKICAgICAgICAiMS4wLjAiOiAiY29uc3VtZUZpbGVJY29ucyIK\nICAgICAgfQogICAgfSwKICAgICJhdXRvY29tcGxldGUud2F0Y2hFZGl0b3Ii\nOiB7CiAgICAgICJ2ZXJzaW9ucyI6IHsKICAgICAgICAiMS4wLjAiOiAiY29u\nc3VtZUF1dG9jb21wbGV0ZVdhdGNoRWRpdG9yIgogICAgICB9CiAgICB9LAog\nICAgImZpbGUtaWNvbnMuZWxlbWVudC1pY29ucyI6IHsKICAgICAgInZlcnNp\nb25zIjogewogICAgICAgICIxLjAuMCI6ICJjb25zdW1lRWxlbWVudEljb25z\nIgogICAgICB9CiAgICB9LAogICAgIm1ldHJpY3MtcmVwb3J0ZXIiOiB7CiAg\nICAgICJ2ZXJzaW9ucyI6IHsKICAgICAgICAiXjEuMS4wIjogImNvbnN1bWVN\nZXRyaWNzUmVwb3J0ZXIiCiAgICAgIH0KICAgIH0KICB9LAogICJwcm92aWRl\nZFNlcnZpY2VzIjogewogICAgImZpbmQtYW5kLXJlcGxhY2UiOiB7CiAgICAg\nICJkZXNjcmlwdGlvbiI6ICJBdG9tJ3MgYnVuZGxlZCBmaW5kLWFuZC1yZXBs\nYWNlIHBhY2thZ2UiLAogICAgICAidmVyc2lvbnMiOiB7CiAgICAgICAgIjAu\nMC4xIjogInByb3ZpZGVTZXJ2aWNlIgogICAgICB9CiAgICB9CiAgfSwKICAi\nY29uZmlnU2NoZW1hIjogewogICAgImZvY3VzRWRpdG9yQWZ0ZXJTZWFyY2gi\nOiB7CiAgICAgICJ0eXBlIjogImJvb2xlYW4iLAogICAgICAiZGVmYXVsdCI6\nIGZhbHNlLAogICAgICAiZGVzY3JpcHRpb24iOiAiRm9jdXMgdGhlIGVkaXRv\nciBhbmQgc2VsZWN0IHRoZSBuZXh0IG1hdGNoIHdoZW4gYSBmaWxlIHNlYXJj\naCBpcyBleGVjdXRlZC4gSWYgbm8gbWF0Y2hlcyBhcmUgZm91bmQsIHRoZSBl\nZGl0b3Igd2lsbCBub3QgYmUgZm9jdXNlZC4iCiAgICB9LAogICAgInByb2pl\nY3RTZWFyY2hSZXN1bHRzUGFuZVNwbGl0RGlyZWN0aW9uIjogewogICAgICAi\ndHlwZSI6ICJzdHJpbmciLAogICAgICAiZGVmYXVsdCI6ICJub25lIiwKICAg\nICAgImVudW0iOiBbCiAgICAgICAgIm5vbmUiLAogICAgICAgICJyaWdodCIs\nCiAgICAgICAgImRvd24iCiAgICAgIF0sCiAgICAgICJ0aXRsZSI6ICJEaXJl\nY3Rpb24gdG8gb3BlbiByZXN1bHRzIHBhbmUiLAogICAgICAiZGVzY3JpcHRp\nb24iOiAiRGlyZWN0aW9uIHRvIHNwbGl0IHRoZSBhY3RpdmUgcGFuZSB3aGVu\nIHNob3dpbmcgcHJvamVjdCBzZWFyY2ggcmVzdWx0cy4gSWYgJ25vbmUnLCB0\naGUgcmVzdWx0cyB3aWxsIGJlIHNob3duIGluIHRoZSBhY3RpdmUgcGFuZS4i\nCiAgICB9LAogICAgImNsb3NlRmluZFBhbmVsQWZ0ZXJTZWFyY2giOiB7CiAg\nICAgICJ0eXBlIjogImJvb2xlYW4iLAogICAgICAiZGVmYXVsdCI6IGZhbHNl\nLAogICAgICAidGl0bGUiOiAiQ2xvc2UgUHJvamVjdCBGaW5kIFBhbmVsIEFm\ndGVyIFNlYXJjaCIsCiAgICAgICJkZXNjcmlwdGlvbiI6ICJDbG9zZSB0aGUg\nZmluZCBwYW5lbCBhZnRlciBleGVjdXRpbmcgYSBwcm9qZWN0LXdpZGUgc2Vh\ncmNoLiIKICAgIH0sCiAgICAic2Nyb2xsVG9SZXN1bHRPbkxpdmVTZWFyY2gi\nOiB7CiAgICAgICJ0eXBlIjogImJvb2xlYW4iLAogICAgICAiZGVmYXVsdCI6\nIGZhbHNlLAogICAgICAidGl0bGUiOiAiU2Nyb2xsIFRvIFJlc3VsdCBPbiBM\naXZlLVNlYXJjaCAoaW5jcmVtZW50YWwgZmluZCBpbiBidWZmZXIpIiwKICAg\nICAgImRlc2NyaXB0aW9uIjogIlNjcm9sbCB0byBhbmQgc2VsZWN0IHRoZSBj\nbG9zZXN0IG1hdGNoIHdoaWxlIHR5cGluZyBpbiB0aGUgYnVmZmVyIGZpbmQg\nYm94LiIKICAgIH0sCiAgICAibGl2ZVNlYXJjaE1pbmltdW1DaGFyYWN0ZXJz\nIjogewogICAgICAidHlwZSI6ICJpbnRlZ2VyIiwKICAgICAgImRlZmF1bHQi\nOiAzLAogICAgICAibWluaW11bSI6IDAsCiAgICAgICJkZXNjcmlwdGlvbiI6\nICJUaGUgbWluaW11bSBudW1iZXIgb2YgY2hhcmFjdGVycyB3aGljaCBuZWVk\nIHRvIGJlIHR5cGVkIGludG8gdGhlIGJ1ZmZlciBmaW5kIGJveCBiZWZvcmUg\nc2VhcmNoIHN0YXJ0cyBtYXRjaGluZyBhbmQgaGlnaGxpZ2h0aW5nIG1hdGNo\nZXMgYXMgeW91IHR5cGUuIgogICAgfSwKICAgICJzZWFyY2hDb250ZXh0TGlu\nZUNvdW50QmVmb3JlIjogewogICAgICAidHlwZSI6ICJpbnRlZ2VyIiwKICAg\nICAgImRlZmF1bHQiOiAzLAogICAgICAibWluaW11bSI6IDAsCiAgICAgICJk\nZXNjcmlwdGlvbiI6ICJUaGUgbnVtYmVyIG9mIGV4dHJhIGxpbmVzIG9mIGNv\nbnRleHQgdG8gcXVlcnkgYmVmb3JlIHRoZSBtYXRjaCBmb3IgcHJvamVjdCBy\nZXN1bHRzIgogICAgfSwKICAgICJzZWFyY2hDb250ZXh0TGluZUNvdW50QWZ0\nZXIiOiB7CiAgICAgICJ0eXBlIjogImludGVnZXIiLAogICAgICAiZGVmYXVs\ndCI6IDMsCiAgICAgICJtaW5pbXVtIjogMCwKICAgICAgImRlc2NyaXB0aW9u\nIjogIlRoZSBudW1iZXIgb2YgZXh0cmEgbGluZXMgb2YgY29udGV4dCB0byBx\ndWVyeSBhZnRlciB0aGUgbWF0Y2ggZm9yIHByb2plY3QgcmVzdWx0cyIKICAg\nIH0sCiAgICAic2hvd1NlYXJjaFdyYXBJY29uIjogewogICAgICAidHlwZSI6\nICJib29sZWFuIiwKICAgICAgImRlZmF1bHQiOiB0cnVlLAogICAgICAidGl0\nbGUiOiAiU2hvdyBTZWFyY2ggV3JhcCBJY29uIiwKICAgICAgImRlc2NyaXB0\naW9uIjogIkRpc3BsYXkgYSB2aXN1YWwgY3VlIG92ZXIgdGhlIGVkaXRvciB3\naGVuIGxvb3BpbmcgdGhyb3VnaCBzZWFyY2ggcmVzdWx0cy4iCiAgICB9LAog\nICAgInVzZVJpcGdyZXAiOiB7CiAgICAgICJ0eXBlIjogImJvb2xlYW4iLAog\nICAgICAiZGVmYXVsdCI6IGZhbHNlLAogICAgICAidGl0bGUiOiAiVXNlIHJp\ncGdyZXAiLAogICAgICAiZGVzY3JpcHRpb24iOiAiVXNlIHRoZSBleHBlcmlt\nZW50YWwgYHJpcGdyZXBgIHNlYXJjaCBjcmF3bGVyLiBUaGlzIHdpbGwgbWFr\nZSBzZWFyY2hlcyBzdWJzdGFudGlhbGx5IGZhc3RlciBvbiBsYXJnZSBwcm9q\nZWN0cy4iCiAgICB9LAogICAgImVuYWJsZVBDUkUyIjogewogICAgICAidHlw\nZSI6ICJib29sZWFuIiwKICAgICAgImRlZmF1bHQiOiBmYWxzZSwKICAgICAg\nInRpdGxlIjogIkVuYWJsZSBQQ1JFMiByZWdleCBlbmdpbmUiLAogICAgICAi\nZGVzY3JpcHRpb24iOiAiRW5hYmxlIFBDUkUyIHJlZ2V4IGVuZ2luZSAoYXBw\nbGllcyBvbmx5IHRvIGByaXBncmVwYCBzZWFyY2gpLiBUaGlzIHdpbGwgZW5h\nYmxlIGFkZGl0aW9uYWwgcmVnZXggZmVhdHVyZXMgc3VjaCBhcyBsb29rYmVo\naW5kLCBidXQgbWF5IG1ha2Ugc2VhcmNoZXMgc2xvd2VyLiIKICAgIH0sCiAg\nICAiYXV0b2NvbXBsZXRlU2VhcmNoZXMiOiB7CiAgICAgICJ0eXBlIjogImJv\nb2xlYW4iLAogICAgICAiZGVmYXVsdCI6IGZhbHNlLAogICAgICAidGl0bGUi\nOiAiQXV0b2NvbXBsZXRlIFNlYXJjaCIsCiAgICAgICJkZXNjcmlwdGlvbiI6\nICJBdXRvY29tcGxldGVzIGVudHJpZXMgaW4gdGhlIGZpbmQgc2VhcmNoIGZp\nZWxkLiIKICAgIH0sCiAgICAicHJlc2VydmVDYXNlT25SZXBsYWNlIjogewog\nICAgICAidHlwZSI6ICJib29sZWFuIiwKICAgICAgImRlZmF1bHQiOiBmYWxz\nZSwKICAgICAgInRpdGxlIjogIlByZXNlcnZlIGNhc2UgZHVyaW5nIHJlcGxh\nY2UuIiwKICAgICAgImRlc2NyaXB0aW9uIjogIktlZXAgdGhlIHJlcGxhY2Vk\nIHRleHQgY2FzZSBkdXJpbmcgcmVwbGFjZTogcmVwbGFjaW5nICd1c2VyJyB3\naXRoICdwZXJzb24nIHdpbGwgcmVwbGFjZSAnVXNlcicgd2l0aCAnUGVyc29u\nJyBhbmQgJ1VTRVInIHdpdGggJ1BFUlNPTicuIgogICAgfQogIH0KfQo=\n",
    encoding: "base64",
    _links: {
      self: "https://api.github.com/repos/pulsar-edit/find-and-replace/contents/package.json?ref=master",
      git: "https://api.github.com/repos/pulsar-edit/find-and-replace/git/blobs/eee0d8f6f57ea9530cf202425459ed690ece9241",
      html: "https://github.com/pulsar-edit/find-and-replace/blob/master/package.json",
    },
  });
});

app.get("/repos/git-test/atom-backend/contents/README.md", (req, res) => {
  // This endpoint will always return a valid readme based off `pulsar-edit/find-and-replace`
  res.status(200).json({
    name: "README.md",
    path: "README.md",
    sha: "19368ca8a6c3315c5f2ed2071a23c2949a7b8048",
    size: 1013,
    url: "https://api.github.com/repos/pulsar-edit/find-and-replace/contents/README.md?ref=master",
    html_url:
      "https://github.com/pulsar-edit/find-and-replace/blob/master/README.md",
    git_url:
      "https://api.github.com/repos/pulsar-edit/find-and-replace/git-blobs/19368ca8a6c3315c5f2ed2071a23c2949a7b8048",
    download_url:
      "https://raw.githubusercontent.com/pulsar-edit/find-and-replace/master/README.md",
    type: "file",
    content:
      "IyBGaW5kIGFuZCBSZXBsYWNlIHBhY2thZ2UKCkZpbmQgYW5kIHJlcGxhY2Ug\naW4gdGhlIGN1cnJlbnQgYnVmZmVyIG9yIGFjcm9zcyB0aGUgZW50aXJlIHBy\nb2plY3QuCgojIyBGaW5kIGluIGJ1ZmZlcgoKVXNpbmcgdGhlIHNob3J0Y3V0\nIDxrYmQ+Y21kLWY8L2tiZD4gKE1hYykgb3IgPGtiZD5jdHJsLWY8L2tiZD4g\nKFdpbmRvd3MgYW5kIExpbnV4KS4KIVtzY3JlZW4gc2hvdCAyMDEzLTExLTI2\nIGF0IDEyIDI1IDIyIHBtXShodHRwczovL2YuY2xvdWQuZ2l0aHViLmNvbS9h\nc3NldHMvNjkxNjkvMTYyNTkzOC9hODU5ZmE3MC01NmQ5LTExZTMtOGIyYS1h\nYzM3YzUwMzMxNTkucG5nKQoKIyMgRmluZCBpbiBwcm9qZWN0CgpVc2luZyB0\naGUgc2hvcnRjdXQgPGtiZD5jbWQtc2hpZnQtZjwva2JkPiAoTWFjKSBvciA8\na2JkPmN0cmwtc2hpZnQtZjwva2JkPiAoV2luZG93cyBhbmQgTGludXgpLgoh\nW3NjcmVlbiBzaG90IDIwMTMtMTEtMjYgYXQgMTIgMjYgMDIgcG1dKGh0dHBz\nOi8vZi5jbG91ZC5naXRodWIuY29tL2Fzc2V0cy82OTE2OS8xNjI1OTQ1L2Iy\nMTZkN2I4LTU2ZDktMTFlMy04YjE0LTZhZmMzMzQ2N2JlOS5wbmcpCgojIyBQ\ncm92aWRlZCBTZXJ2aWNlCgpJZiB5b3UgbmVlZCBhY2Nlc3MgdGhlIG1hcmtl\nciBsYXllciBjb250YWluaW5nIHJlc3VsdCBtYXJrZXJzIGZvciBhIGdpdmVu\nIGVkaXRvciwgdXNlIHRoZSBgZmluZC1hbmQtcmVwbGFjZUAwLjAuMWAgc2Vy\ndmljZS4gVGhlIHNlcnZpY2UgZXhwb3NlcyBvbmUgbWV0aG9kLCBgcmVzdWx0\nc01hcmtlckxheWVyRm9yVGV4dEVkaXRvcmAsIHdoaWNoIHRha2VzIGEgYFRl\neHRFZGl0b3JgIGFuZCByZXR1cm5zIGEgYFRleHRFZGl0b3JNYXJrZXJMYXll\ncmAgdGhhdCB5b3UgY2FuIGludGVyYWN0IHdpdGguIEtlZXAgaW4gbWluZCB0\naGF0IGFueSB3b3JrIHlvdSBkbyBpbiBzeW5jaHJvbm91cyBldmVudCBoYW5k\nbGVycyBvbiB0aGlzIGxheWVyIHdpbGwgaW1wYWN0IHRoZSBwZXJmb3JtYW5j\nZSBvZiBmaW5kIGFuZCByZXBsYWNlLgo=\n",
    encoding: "base64",
    _links: {
      self: "https://api.github.com/repos/pulsar-edit/find-and-replace/contents/README.md?ref=master",
      git: "https://api.github.com/repos/pulsar-edit/find-and-replace/git/blobs/19368ca8a6c3315c5f2ed2071a23c2949a7b8048",
      html: "https://github.com/pulsar-edit/find-and-replace/blob/master/README.md",
    },
  });
});

app.get("/repos/git-test/atom-backend/tags", (req, res) => {
  res.status(200).json([
    {
      name: "v0.219.8",
      zipball_url:
        "https://api.github.com/repos/pulsar-edit/find-and-replace/zipball/refs/tags/v0.219.8",
      tarball_url:
        "https://api.github.com/repos/pulsar-edit/find-and-replace/tarball/refs/tags/v0.219.8",
      commit: {
        sha: "61fe02539f2a444cf084ac6fb73f8635ec7a4a55",
        url: "https://api.github.com/repos/pulsar-edit/find-and-replace/commits/61fe02539f2a444cf084ac6fb73f8635ec7a4a55",
      },
      node_id: "REF_kwDOHp7uBLJyZWZzL3RhZ3MvdjAuMjE5Ljg",
    },
    {
      name: "v0.219.7",
      zipball_url:
        "https://api.github.com/repos/pulsar-edit/find-and-replace/zipball/refs/tags/v0.219.7",
      tarball_url:
        "https://api.github.com/repos/pulsar-edit/find-and-replace/tarball/refs/tags/v0.219.7",
      commit: {
        sha: "1ccd881b2995dc504c5f7908fbfa24d9a3b3dd62",
        url: "https://api.github.com/repos/pulsar-edit/find-and-replace/commits/1ccd881b2995dc504c5f7908fbfa24d9a3b3dd62",
      },
      node_id: "REF_kwDOHp7uBLJyZWZzL3RhZ3MvdjAuMjE5Ljc",
    },
  ]);
});

app.use((req, res) => {
  res.status(404).json({
    message: "Not Found",
    documentation_url: "https://docs.github.com/rest",
  });
});

module.exports = app;
