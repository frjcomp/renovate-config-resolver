# Renovate Config Resolver

A microservice to resolve Renovate configs programmatically.

## Development Setup

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd renovate-config-resolver
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Start the development server:**
   ```sh
   npm run dev
   ```
   This uses `nodemon` for automatic reloads.

4. **Start the server manually:**
   ```sh
   npm start
   ```

## Running Tests

Tests are written using [Vitest](https://vitest.dev/).

- **Run all tests:**
  ```sh
  npx vitest run
  ```
  Or, if you have a test script in your `package.json`:
  ```sh
  npm test
  ```

## Continuous Integration

Tests are automatically run on every push and pull request to the `main` branch using GitHub Actions.  
See [`.github/workflows/test.yml`](.github/workflows/test.yml) for details.

## Useful Links

- [Renovate Documentation](https://docs.renovatebot.com/)
- [Vitest Documentation](https://vitest.dev/)
