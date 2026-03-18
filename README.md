# Story Genie (React + Vite)

Personalized bedtime story generator for kids.

## What you built

- Landing page (`/`)
- Sign up / sign in (`/auth`)
- Story input form (`/new`)
- Loading + generation (`/loading`)
- Storybook reader (`/story/:id`) with Read Aloud
- Saved stories grid (`/saved`)

## 1) Prerequisites (install once)

- Node.js **16+ recommended** (your current Node 14 can work for this repo, but newer Node is smoother)
- A Supabase project
- An Anthropic API key (Claude)
- An OpenAI API key (DALL·E 3)
- Supabase CLI (for edge functions)

Install Supabase CLI (macOS via Homebrew):

```bash
brew install supabase/tap/supabase
```

If Homebrew is not installed, install it first:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/homebrew/install/HEAD/install.sh)"
```

Then install the CLI:

```bash
brew install supabase/tap/supabase
```

## 2) Set environment variables (frontend)

1. Copy the example env file:

```bash
cp .env.example .env
```

2. Edit `.env` and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 3) Set up Supabase database

1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Paste and run the file `supabase/schema.sql`

## 4) Create the Storage bucket

In Supabase dashboard:

- Go to **Storage**
- Create a bucket named **`storybook`**
- Set it to **Public** (so the app can display images by URL)

## 5) Add Supabase Edge Function secrets

In Supabase dashboard:

- Go to **Project Settings → Edge Functions → Secrets**
- Add:
  - `ANTHROPIC_API_KEY`
  - `OPENAI_API_KEY`

## 6) Deploy Edge Functions

Login + link your project (run once):

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Deploy the functions:

```bash
supabase functions deploy generate-story
supabase functions deploy generate-illustrations
```

## 7) Run locally

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## 8) Deploy to Vercel

1. Push this folder to a GitHub repo
2. In Vercel: **New Project → Import**
3. Framework preset: **Vite**
4. Add Environment Variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy

That’s it — Vercel will run `npm run build` automatically.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
