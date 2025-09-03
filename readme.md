![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/frjcomp/renovate-config-resolver/test.yml)

# Renovate Config Resolver

A microservice that exposes an HTTP endpoint to resolve and expand Renovate configuration presets, returning the fully merged configuration.

## API Endpoints

### `GET /health`

Returns the health status of the service.

**Response:**

```json
{ "status": "ok" }
```

### `POST /resolve`

Resolves a Renovate config and returns the resolved configuration.

**Request Body:**

```json
{
  "extends": ["config:base"]
}
```

**Response:**

```json
{
  // ... fully resolved config
}
```

**Example using curl:**

```sh
curl -X POST http://localhost:3000/resolve \
  -H "Content-Type: application/json" \
  -d '{"extends":["config:base"]}'
```

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

- [Renovate Documentation](https://docs.renovatebot.com/config-presets/)
- [Vitest Documentation](https://vitest.dev/)
