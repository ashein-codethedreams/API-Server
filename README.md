## Setup

1. Install dependencies with `npm install`.
2. Create `.env` from `.env.example`, set the PostgreSQL credentials, and replace
   `JWT_SECRET=change-me` with a private, randomly generated secret of at least
   32 characters. On macOS, generate one with `openssl rand -base64 32`.
3. Start the local PostgreSQL database with `docker compose up -d db`.
4. Apply the existing schema and auth migrations in order. If the original todo
   table has not been created yet, apply its migration first:

   ```sh
   docker compose exec -T db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < src/db/migrations/20260926160710_equal_mongoose/migration.sql
   ```

   Then apply the authentication migration:

   ```sh
   docker compose exec -T db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < src/db/migrations/20261010230200_jwt_auth/migration.sql
   ```

   Do not reapply a migration to a database where its tables/columns already
   exist.
5. Start the API with `npm run dev` and open http://localhost:3000.

## Register and sign in

1. On the home page, enter an email address and a password between 12 and 128
   characters.
2. Select **Create account** to register. You will be signed in automatically.
3. To return later, enter the same credentials and select **Sign in**.
4. Add and remove todos in **Your workspace**. Todos are private to the account.

The browser keeps the access token in memory only. Reloading the page signs you
out; sign in again to continue.

## Authentication

Register with `POST /auth/register` or sign in with `POST /auth/login`, using
JSON containing an email and a password of 12–128 characters. Both endpoints
return a one-hour HS256 bearer access token. Send it as
`Authorization: Bearer <accessToken>` when calling `/todos`.

Todo records belong to the authenticated user. Existing todos are left with a
null owner by the migration and are not returned by the authenticated API.
The home page provides a sign-in/registration form and a private todo manager;
its access token stays in memory and is cleared when signing out or reloading.
