name: General Pull Request
description: Open a PR to contribute to the code of this project.
body:
- type: checkboxes
  attributes:
    description: "Checked other open Pull Requests to ensure this is not a duplicate."
    label: "Have you checked for existing Pull Requests?"
    options:
      - label: Completed
        required: true
- type: checkboxes
  attributes:
    description: "Have you run tests against the code being submitted?"
    options:
      - label: Completed
        required: false
- type: textarea
  id: summary
  attributes:
    label: Summary
    placeholder: "Please give some details about the Pull Request you are submitting."
  validations:
    required: true
- type: markdown
  attributes:
    value: |
      As always thanks for contributing! 🎉

---
name: General Pull Request
about: Open a PR to contribute to the code of this project.
---

### Requirements

* Filling out the template is required.
* All new code requires tests to ensure against regressions.
  - However, if your PR contains zero code changes, feel free to select the `Documentation Pull Request Template`.

[] - Have you ran tests against this code?

### Description of the Change

<!--
Please give some details about the Pull Request you are submitting.
=== As always Thanks for Contributing! ===
-->
