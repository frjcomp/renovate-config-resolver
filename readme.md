![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/frjcomp/renovate-config-resolver/test.yml)
![Docker Pulls](https://img.shields.io/docker/pulls/jfrcomp/renovate-config-resolver.svg)

# Renovate Config Resolver

A microservice that exposes an HTTP endpoint to resolve and expand Renovate configuration presets, returning the fully merged configuration.

Run it locally using Docker

```bash
docker run -p 3000:3000 jfrcomp/renovate-config-resolver:latest
```

Demo environment: https://juicy-marleen-frjcomp-ec77f95d.koyeb.app/resolve

```bash
curl -X POST https://juicy-marleen-frjcomp-ec77f95d.koyeb.app/resolve   -H "Content-Type: application/json"   -d '{"extends":["config:base"]}'
```

## API Endpoints

### Swagger UI

The service exposes an interactive Swagger UI to explore and test the API endpoints.

URL: http://localhost:3000/api-docs

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
   git clone git@github.com:frjcomp/renovate-config-resolver.git
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

```sh
npx vitest run
```

## Useful Links

- [Renovate Documentation](https://docs.renovatebot.com/config-presets/)
- [Vitest Documentation](https://vitest.dev/)
