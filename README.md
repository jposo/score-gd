# loggd

A web application for the Geometry Dash community.

## Features

*   **User Authentication:** OAuth sign-in.
*   **Level Browser:** Search and view details for Geometry Dash levels.
*   **levelguessr:** A fun game to guess levels.
*   **User Profiles:** View and edit user profiles.
*   **Admin Dashboard:** For managing application data.

## Built With

*   [SvelteKit](https://kit.svelte.dev/)
*   [Supabase](https://supabase.com/)
*   [Drizzle ORM](https://orm.drizzle.team/)
*   [Deno](https://deno.land/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Vite](https://vitejs.dev/)

## Getting Started

### Prerequisites

*   Node.js
*   Deno
*   A Supabase account

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/jposo/loggd.git
    ```
2.  Install Deno & NPM packages
    ```sh
    deno install
    ```
3.  Set up your environment variables. You will need to create a `.env` file in the root of the project with values in `.env.local`.

### Development

Start the development server:

```sh
deno task dev
```

### Building

To create a production version of your app:

```sh
deno task build
```

You can preview the production build with `deno task preview`.
