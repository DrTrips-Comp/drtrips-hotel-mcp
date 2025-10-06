# Publishing Guide

This document describes how to publish the DrTrips Hotel MCP Server to NPM and the MCP Registry.

## Overview

The server is published automatically via GitHub Actions when you push a version tag. The workflow publishes to both:
1. **NPM Registry** - for package distribution
2. **MCP Registry** - for discoverability in the Model Context Protocol ecosystem

## Prerequisites

Before publishing, ensure you have:

1. **NPM Token**: Create an NPM access token with publish permissions
   - Go to https://www.npmjs.com/settings/{your-username}/tokens
   - Create a new token with "Automation" or "Publish" permission
   - Add it as a GitHub secret named `NPM_TOKEN`

2. **GitHub Permissions**: The repository must have:
   - GitHub Actions enabled
   - OIDC authentication enabled (default for most repos)
   - Proper permissions for `id-token: write`

## Publishing Process

### Automated Publishing (Recommended)

1. **Update Version**: Update the version in both `package.json` and `server.json`:
   ```bash
   # Update package.json version
   npm version patch  # or minor, or major

   # Manually update server.json to match
   ```

2. **Create and Push Tag**:
   ```bash
   git add package.json server.json
   git commit -m "Release version X.Y.Z"
   git tag vX.Y.Z
   git push origin main --tags
   ```

3. **Monitor Workflow**: Check GitHub Actions for the publishing workflow
   - Navigate to: https://github.com/DrTrips-Comp/drtrips-hotel-mcp/actions
   - Watch the "Publish to NPM and MCP Registry" workflow

### Manual Publishing (Fallback)

If automated publishing fails, you can publish manually:

1. **Build the Package**:
   ```bash
   npm install
   npm run build
   ```

2. **Publish to NPM**:
   ```bash
   npm publish --access public
   ```

3. **Install MCP Publisher**:
   - Download from: https://github.com/modelcontextprotocol/publisher/releases
   - For Windows: download `mcp-publisher-windows-amd64.exe`
   - Add to PATH or run directly

4. **Login to MCP Registry**:
   ```bash
   mcp-publisher login --github-oidc
   ```

5. **Publish to MCP Registry**:
   ```bash
   mcp-publisher publish
   ```

## Validation

Before publishing, validate your configuration:

### Validate server.json

Run the validation script:
```bash
python validate-server.py
```

This checks:
- Valid JSON syntax
- Required fields present
- Correct deployment configuration
- Namespace format

### Test the Package Locally

```bash
npm run build
npm test
```

## Configuration Files

### server.json

The `server.json` file contains MCP registry metadata:
- **namespace**: `io.github.drtrips-comp/drtrips-hotel-mcp` (matches GitHub repo)
- **deployment.type**: `package` (NPM package)
- **deployment.package.name**: `drtrips-hotel-mcp` (must match package.json)

### GitHub Actions Workflow

The workflow (`.github/workflows/publish-mcp.yml`) runs on tag push:
1. Builds the TypeScript project
2. Publishes to NPM
3. Installs MCP Publisher
4. Authenticates via GitHub OIDC
5. Publishes to MCP Registry

## Troubleshooting

### NPM Publishing Fails

- Verify `NPM_TOKEN` secret is set in GitHub
- Check package name is available on NPM
- Ensure version hasn't been published before

### MCP Publishing Fails

- Verify `server.json` namespace matches GitHub repo
- Check package was published to NPM first
- Ensure GitHub OIDC permissions are correct

### Version Mismatch

Always ensure `package.json` and `server.json` versions match:
```bash
# Check versions
node -e "console.log('package.json:', require('./package.json').version)"
node -e "console.log('server.json:', require('./server.json').version)"
```

## Post-Publishing

After successful publishing:

1. **Verify NPM**: Check package at https://www.npmjs.com/package/drtrips-hotel-mcp
2. **Verify MCP Registry**: Search for "drtrips-hotel-mcp" in the MCP registry
3. **Test Installation**: Try installing in a fresh Claude Desktop config

## Additional Resources

- [MCP Publishing Guide](https://raw.githubusercontent.com/modelcontextprotocol/registry/refs/heads/main/docs/guides/publishing/publish-server.md)
- [GitHub Actions Guide](https://raw.githubusercontent.com/modelcontextprotocol/registry/refs/heads/main/docs/guides/publishing/github-actions.md)
- [NPM Publishing Docs](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
