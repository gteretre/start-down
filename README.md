![1](https://github.com/user-attachments/assets/25e7517a-5943-44a2-8168-9ae894907627)<p align="center">
<img src="https://github.com/user-attachments/assets/6e591165-4fa8-4999-a54d-d18780f2ce25" alt="StartDown Main Page" width="600" style="border-radius: 12px; box-shadow: 0 4px 24px #0002; margin-bottom: 1em;" />

</p>

<h1 align="center">StartDown <span style="font-size:1.2em;">✨</span></h1>

StartDown is a playful web platform built with Next.js and React, designed for sharing, browsing, and voting on unconventional startup ideas. Whether you want feedback, inspiration, or just a laugh, StartDown is the place to unleash your creativity.

## Features

- Submit, browse, and vote on unique startup ideas
- Modern, responsive UI with mobile and desktop support
- Secure authentication with GitHub and Google (NextAuth.js)
- MongoDB-backed data storage and querying
- Real-time view tracking and search functionality
- Modular, reusable React components
- Developer-friendly codebase and structure

![1](https://github.com/user-attachments/assets/c487fb68-7956-4346-96b2-e489f7578be2)

<img src="https://github.com/user-attachments/assets/693cf2ee-55ee-497c-bde0-782f4c433eb0" alt="StartDown Main Page" width="600" style="border-radius: 12px; box-shadow: 0 4px 24px #0002; margin-bottom: 1em;" />

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router, SSR, API routes)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) (utility-first styling)
- [MongoDB](https://www.mongodb.com/) (database)
- [NextAuth.js](https://next-auth.js.org/) (authentication)
- [Lucide React](https://lucide.dev/) (icons)

## Project Structure

- `app/` — Main application code (routing, pages, layouts, API endpoints)
  - `(root)/` — Home page and main entry point
  - `api/` — API routes (authentication, data)
- `components/` — Reusable UI components (forms, navigation, cards, tooltips, etc.)
- `lib/` — Utility functions, database queries, mutations, and type definitions
- `public/` — Static assets (images, icons)

## Getting Started

### Docker Quickstart

1. Ensure `.env.local` contains all test credentials. Look below for required variables.
2. Build and launch the stack: `npm run docker`. This starts the Next.js app, Mongo, and Localstack.
3. When you are done, stop everything with `npm run docker:down`.

Optionally to import the database, fill the demo-data folder with JSON files matching your collections, then run

```
.\scripts\import-demo-data.ps1 -MongoUri "mongodb://mongo:27017" -Database "startdown"
```

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gteretre/startdown.git
   cd startdown
   ```
2. **Install dependencies:**
   ```bash
   npm install (recommended)
   # or
   yarn install
   ```
3. **Configure environment variables:**
   Create a `.env.local` file in the root directory with the following:

   ```env
   NEXTAUTH_SECRET =
   NEXTAUTH_URL = "http://localhost:3000"
   AUTH_GITHUB_ID =
   AUTH_GITHUB_SECRET =
   AUTH_GOOGLE_ID_PREV =
   AUTH_GOOGLE_SECRET_PREV =
   AUTH_GOOGLE_ID =
   AUTH_GOOGLE_SECRET =
   AUTH_AZURE_AD_ID =
   AUTH_AZURE_AD_SECRET =
   AUTH_AZURE_AD_TENANT_TEST =
   AUTH_AZURE_AD_TENANT = common

   MONGODB_URI = mongodb://localhost:27017
   MONGODB_DB = startdown
   BASE_URL=http://localhost:3000
   ```

   fill the empty values with your own credentials.

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. **Open [http://localhost:3000](http://localhost:3000) to view the app.**

## About

<img src="https://github.com/user-attachments/assets/d354ed3d-ec0f-4574-b80a-20e27d9dda05" alt="StartDown Main Page" width="600" style="border-radius: 12px; box-shadow: 0 4px 24px #0002; margin-bottom: 1em;" />

In the world of tech, everyone's chasing that mythical "unicorn" — the billion-dollar startup idea. So, I thought, why not have a little fun with it? StartDown is my tongue-in-cheek tribute to those wild ideas that might just be brilliant... or totally bonkers. It’s a space where people can throw their craziest concepts into the void (or the internet) and maybe, just maybe, get some feedback. It's also part of my portfolio. A functional joke with real code behind it.

## 📬 License

**Copyright © 2025 Michał Kowalski. All Rights Reserved.**

This project and its contents are protected under copyright law. While the code is publicly visible for portfolio and educational purposes, no permission is granted for:

1. Commercial use of this software
2. Modification or creation of derivative works
3. Distribution of any part of this codebase
4. Use of this software in any environment without explicit written permission

This software is provided for demonstration and review purposes only. For licensing inquiries, please contact the author.
