
## 📚 Documentação Oficial

### Git
- Official Docs: https://git-scm.com/doc
- Pro Git Book: https://git-scm.com/book/en/v2
- Git Cheat Sheet: https://education.github.com/git-cheat-sheet-education.pdf

### GitHub
- Docs: https://docs.github.com
- GitHub Actions: https://docs.github.com/en/actions
- GitHub CLI: https://cli.github.com/manual/
- REST API: https://docs.github.com/en/rest
- GraphQL API: https://docs.github.com/en/graphql

---

## 🌳 Git Best Practices

### Branch Naming Convention

```bash
# Feature branches
git checkout -b feature/user-authentication
git checkout -b feature/add-payment-gateway

# Bug fixes
git checkout -b fix/login-error
git checkout -b fix/database-connection

# Hotfixes (production)
git checkout -b hotfix/security-patch

# Refactoring
git checkout -b refactor/user-service

# Documentation
git checkout -b docs/api-documentation

# Chores (dependencies, config)
git checkout -b chore/update-dependencies
```

### Commit Message Convention (Conventional Commits)

**Format**: `<type>(<scope>): <subject>`

```bash
# Features
git commit -m "feat(auth): add Google OAuth integration"
git commit -m "feat(user): implement user profile page"

# Bug Fixes
git commit -m "fix(login): resolve token expiration issue"
git commit -m "fix(api): handle null response from server"

# Documentation
git commit -m "docs(readme): add installation instructions"
git commit -m "docs(api): update endpoint documentation"

# Style (formatting, missing semi colons, etc)
git commit -m "style(components): format code with prettier"

# Refactoring
git commit -m "refactor(auth): simplify authentication logic"

# Performance
git commit -m "perf(database): optimize user query"

# Tests
git commit -m "test(auth): add unit tests for login service"

# Chores
git commit -m "chore(deps): update Angular to v18"
git commit -m "chore(config): update tsconfig settings"

# CI/CD
git commit -m "ci(github-actions): add deployment workflow"

# Breaking Changes
git commit -m "feat(api)!: change user endpoint structure

BREAKING CHANGE: User endpoint now returns different format"
```

### Commit Message Template

```bash
# Configure template
git config --global commit.template ~/.gitmessage

# Create template file
cat > ~/.gitmessage << 'TEMPLATE'
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>

# Types:
# - feat: New feature
# - fix: Bug fix
# - docs: Documentation
# - style: Formatting
# - refactor: Code restructure
# - perf: Performance improvement
# - test: Tests
# - chore: Maintenance
# - ci: CI/CD changes

# Example:
# feat(auth): add social login
#
# - Added Google OAuth
# - Added Facebook login
# - Updated login UI
#
# Closes #123
TEMPLATE
```

### Workflow Patterns

#### Feature Branch Workflow

```bash
# 1. Create and switch to feature branch
git checkout -b feature/user-dashboard

# 2. Make changes and commit
git add .
git commit -m "feat(dashboard): add user statistics"

# 3. Keep branch updated with main
git fetch origin
git rebase origin/main

# 4. Push to remote
git push origin feature/user-dashboard

# 5. Create Pull Request (via GitHub CLI or web)
gh pr create --title "Add user dashboard" --body "Implements user statistics view"

# 6. After PR approval, merge via GitHub (squash & merge recommended)
```

#### Git Flow

```bash
# Main branches
# - main: Production-ready code
# - develop: Integration branch for features

# Create feature from develop
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# Work on feature
git add .
git commit -m "feat: implement new feature"

# Merge feature to develop
git checkout develop
git merge --no-ff feature/new-feature

# Create release branch
git checkout -b release/1.2.0 develop

# Merge release to main
git checkout main
git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"

# Merge release back to develop
git checkout develop
git merge --no-ff release/1.2.0
```

---

## 🔧 GitHub CLI (gh) Best Practices

### Installation

```bash
# macOS
brew install gh

# Windows (via winget)
winget install --id GitHub.cli

# Linux (Debian/Ubuntu)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

### Authentication

```bash
# Login
gh auth login

# Check status
gh auth status

# Set default editor
gh config set editor "code --wait"
```

### Common Operations

```bash
# Repository
gh repo create my-project --public
gh repo clone owner/repo
gh repo view
gh repo fork owner/repo

# Pull Requests
gh pr create --title "Add feature" --body "Description"
gh pr list
gh pr view 123
gh pr checkout 123
gh pr merge 123 --squash
gh pr review 123 --approve
gh pr review 123 --comment --body "Looks good!"

# Issues
gh issue create --title "Bug report" --body "Description"
gh issue list
gh issue view 123
gh issue close 123
gh issue comment 123 --body "Fixed in PR #456"

# GitHub Actions
gh workflow list
gh workflow view deploy.yml
gh run list
gh run view 123456
gh run watch

# Releases
gh release create v1.0.0 --title "Version 1.0.0" --notes "Release notes"
gh release list
gh release view v1.0.0
```

---

## 🤖 GitHub Actions Best Practices

### Basic CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm test -- --coverage
      
      - name: Build
        run: npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Angular CI Workflow

```yaml
# .github/workflows/angular-ci.yml
name: Angular CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm run test:ci
      
      - name: Build
        run: npm run build -- --configuration=production
      
      - name: E2E Tests
        run: npm run e2e
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

### Deploy to Firebase Hosting

```yaml
# .github/workflows/firebase-deploy.yml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build -- --configuration=production
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

### Secrets Management

```bash
# Add secrets via CLI
gh secret set FIREBASE_TOKEN --body "your-token-here"

# Or via GitHub UI:
# Settings > Secrets and variables > Actions > New repository secret
```

### Workflow Triggers

```yaml
# On push to specific branches
on:
  push:
    branches:
      - main
      - develop

# On pull request
on:
  pull_request:
    branches:
      - main

# On schedule (cron)
on:
  schedule:
    - cron: '0 0 * * 0' # Every Sunday at midnight

# Manual trigger
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        type: choice
        options:
          - dev
          - staging
          - production

# On release
on:
  release:
    types: [published]

# On specific paths
on:
  push:
    paths:
      - 'src/**'
      - 'package.json'
```

---

## 📋 Issue Templates

### Bug Report Template

```yaml
# .github/ISSUE_TEMPLATE/bug_report.yml
name: Bug Report
description: Report a bug to help us improve
title: "[BUG]: "
labels: ["bug", "needs-triage"]
assignees:
  - isasinha

body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!

  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear description of the bug
      placeholder: Tell us what you see!
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. Scroll down to '...'
        4. See error
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What you expected to happen
    validations:
      required: true

  - type: textarea
    id: actual
    attributes:
      label: Actual Behavior
      description: What actually happened
    validations:
      required: true

  - type: textarea
    id: screenshots
    attributes:
      label: Screenshots
      description: Add screenshots if applicable

  - type: dropdown
    id: browser
    attributes:
      label: Browser
      options:
        - Chrome
        - Firefox
        - Safari
        - Edge
        - Other
    validations:
      required: true

  - type: input
    id: version
    attributes:
      label: Version
      description: What version of the app?
      placeholder: "v1.0.0"
    validations:
      required: true

  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Any other context about the problem
```

### Feature Request Template

```yaml
# .github/ISSUE_TEMPLATE/feature_request.yml
name: Feature Request
description: Suggest a new feature or enhancement
title: "[FEATURE]: "
labels: ["enhancement"]

body:
  - type: markdown
    attributes:
      value: |
        Thanks for suggesting a new feature!

  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: Is your feature request related to a problem?
      placeholder: I'm always frustrated when...
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: Describe the solution you'd like
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Considered
      description: Describe alternatives you've considered

  - type: dropdown
    id: priority
    attributes:
      label: Priority
      options:
        - Low
        - Medium
        - High
        - Critical
    validations:
      required: true

  - type: checkboxes
    id: terms
    attributes:
      label: Checklist
      options:
        - label: I have searched for similar feature requests
          required: true
        - label: I have read the contributing guidelines
          required: true
```

---

## 🔀 Pull Request Template

```markdown
# .github/PULL_REQUEST_TEMPLATE/pull_request_template.md

## Description
<!-- Provide a brief description of the changes -->

## Type of Change
<!-- Mark with an 'x' all that apply -->
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 Style update (formatting, renaming)
- [ ] ♻️ Code refactoring
- [ ] ⚡ Performance improvement
- [ ] ✅ Test update

## Related Issues
<!-- Link related issues below. Use "Closes #<issue number>" to auto-close -->
Closes #

## Changes Made
<!-- List the specific changes made -->
- 
- 
- 

## Screenshots (if applicable)
<!-- Add screenshots to help explain your changes -->

## Testing
<!-- Describe the tests you ran -->
- [ ] Unit tests pass locally
- [ ] E2E tests pass locally
- [ ] Lint passes
- [ ] Build succeeds

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Additional Context
<!-- Add any other context about the PR here -->
```

---

## 🏷️ Labels Best Practices

### Recommended Label Structure

```yaml
# Type Labels
type: bug          # 🐛 Something isn't working
type: feature      # ✨ New feature or request
type: docs         # 📝 Documentation
type: refactor     # ♻️ Code refactoring
type: performance  # ⚡ Performance improvement
type: test         # ✅ Testing related

# Status Labels
status: needs-triage      # 🔍 Needs initial review
status: in-progress       # 🚧 Work in progress
status: blocked           # 🚫 Blocked by dependencies
status: needs-review      # 👀 Needs code review
status: needs-testing     # 🧪 Needs testing
status: ready-to-merge    # ✔️ Ready to merge

# Priority Labels
priority: low       # Low priority
priority: medium    # Medium priority
priority: high      # ⚠️ High priority
priority: critical  # 🔥 Critical - needs immediate attention

# Scope Labels
scope: frontend     # Frontend related
scope: backend      # Backend related
scope: database     # Database related
scope: ci-cd        # CI/CD related
scope: security     # 🔒 Security related

# Other Labels
good first issue    # 👶 Good for newcomers
help wanted         # 🙋 Extra attention is needed
wontfix            # This will not be worked on
duplicate          # This issue or PR already exists
```

### Creating Labels via CLI

```bash
# Create label
gh label create "type: bug" --color "d73a4a" --description "Something isn't working"

# List labels
gh label list

# Delete label
gh label delete "old-label"
```

---

## 📊 GitHub Projects Best Practices

### Project Board Structure

**Columns:**
1. 📋 Backlog
2. 📝 Todo
3. 🚧 In Progress
4. 👀 In Review
5. ✅ Done

### Automation

```yaml
# .github/workflows/project-automation.yml
name: Project Automation

on:
  issues:
    types: [opened, closed, reopened]
  pull_request:
    types: [opened, ready_for_review, closed]

jobs:
  automate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/add-to-project@v0.5.0
        with:
          project-url: https://github.com/users/isasinha/projects/1
          github-token: ${{ secrets.GH_TOKEN }}
```

---

## 🔒 Security Best Practices

### Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  # Enable version updates for npm
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "npm"
    assignees:
      - "isasinha"
    reviewers:
      - "isasinha"
    commit-message:
      prefix: "chore"
      include: "scope"

  # Enable version updates for GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "github-actions"
```

### CodeQL Analysis

```yaml
# .github/workflows/codeql-analysis.yml
name: "CodeQL"

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 1' # Every Monday

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: ['javascript', 'typescript']

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: ${{ matrix.language }}

      - name: Autobuild
        uses: github/codeql-action/autobuild@v2

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
```

---

## 🎯 Branch Protection Rules

### Recommended Settings

```bash
# Via GitHub CLI
gh api repos/isasinha/REPO_NAME/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["ci"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"dismissal_restrictions":{},"dismiss_stale_reviews":true,"require_code_owner_reviews":true,"required_approving_review_count":1}' \
  --field restrictions=null
```

**Recommended Rules:**
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require conversation resolution
- ✅ Require signed commits (optional)
- ✅ Include administrators
- ❌ Allow force pushes
- ❌ Allow deletions

---

## 📝 CODEOWNERS

```
# .github/CODEOWNERS

# Default owners for everything
* @isasinha

# Frontend
/src/app/**/*.ts @isasinha @frontend-team
/src/app/**/*.html @isasinha @frontend-team
/src/app/**/*.scss @isasinha @frontend-team

# Firebase
/firebase.json @isasinha @backend-team
/firestore.rules @isasinha @backend-team

# CI/CD
/.github/workflows/** @isasinha @devops-team

# Documentation
/docs/** @isasinha @documentation-team
*.md @isasinha @documentation-team

# Configuration
package.json @isasinha
tsconfig.json @isasinha
angular.json @isasinha
```

---

## ✅ GitHub Best Practices Checklist

### Repository Setup
- [ ] Add comprehensive README.md
- [ ] Add LICENSE file
- [ ] Add .gitignore
- [ ] Add CONTRIBUTING.md
- [ ] Add CODE_OF_CONDUCT.md
- [ ] Configure branch protection rules
- [ ] Add CODEOWNERS file
- [ ] Setup issue templates
- [ ] Setup PR template
- [ ] Add topics/tags to repo

### CI/CD
- [ ] Setup GitHub Actions workflows
- [ ] Configure automated testing
- [ ] Setup automated deployment
- [ ] Enable Dependabot
- [ ] Setup CodeQL security scanning
- [ ] Configure status checks

### Documentation
- [ ] Document setup instructions
- [ ] Document contribution guidelines
- [ ] Document API endpoints
- [ ] Add code examples
- [ ] Keep changelog updated

### Security
- [ ] Never commit secrets/credentials
- [ ] Use GitHub Secrets for sensitive data
- [ ] Enable 2FA for account
- [ ] Review and approve Dependabot PRs
- [ ] Regularly update dependencies
- [ ] Use signed commits (optional)

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| GitHub Docs | https://docs.github.com |
| GitHub CLI | https://cli.github.com |
| GitHub Actions | https://docs.github.com/en/actions |
| Git Documentation | https://git-scm.com/doc |
| Conventional Commits | https://www.conventionalcommits.org |
| Semantic Versioning | https://semver.org |
