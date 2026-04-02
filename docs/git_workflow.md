# Git Workflow

## Branch rules

- `main` — production-ready code, protected
- `dev` — integration branch
- Feature branches: `feature/<short-description>`
- Bug fixes: `fix/<short-description>`

## Commit convention

Use conventional commits:

```
feat: add health check endpoint
fix: correct data parsing bug
docs: update README setup instructions
```

## Pull requests

- Always create a PR to merge into `main` or `dev`
- At least one review required before merging
- Keep PRs small and focused
