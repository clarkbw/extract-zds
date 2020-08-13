# What

This looks for all GitHub Zendesk references within an issue.  It tries to find the `github.zendesk.com` domain based links.

This Action is for composability and doesn't take any action itself but outputs what it finds for you.

- `steps.id.outputs.length` is the number of unique references
- `steps.id.outputs.zeds` is the list of unique references in the format `[ZD-670378,ZD-782708]`

# Why

Use this to auto-label issues with support references.  The unique count of references can also be used to create a weighting system.

# Usage

Here's an example that labels all Zendesk references.

```yaml
name: Label all Zendesk References

on:
  issue_comment:
    types: [created, deleted, edited]
  issues:
    types: [opened, edited]

jobs:
  label-zed:
    runs-on: ubuntu-latest
    steps:
      - uses: clarkbw/extract-zds@main
        id: find-zds
        with:
          token: ${{secrets.GITHUB_TOKEN}}
      - name: Echo ZDs
        run: |
          echo "${{steps.find-zds.outputs.zeds}}"
      - uses: actions/github-script@v2
        if: steps.find-zds.outputs.length > 0
        with:
          github-token: ${{secrets.GITHUB_TOKEN}}
          script: |
            const issue = context.payload.issue;
            const zeds = ${{ steps.find-zds.outputs.zeds }};
            if (zeds.length <= 0) {
              return; // double checking there are no zeds
            }
            github.issues.addLabels({
              issue_number: issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              labels: ['support']
            })
```
