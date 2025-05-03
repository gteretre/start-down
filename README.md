![1](https://github.com/user-attachments/assets/25e7517a-5943-44a2-8168-9ae894907627)<p align="center">
  <img src="https://github.com/user-attachments/assets/6e591165-4fa8-4999-a54d-d18780f2ce25" alt="StartDown Main Page" width="600" style="border-radius: 12px; box-shadow: 0 4px 24px #0002; margin-bottom: 1em;" />
</p>

<h1 align="center">🚀 StartDown <span style="font-size:1.2em;">✨</span></h1>

StartDown is a playful web platform built with Next.js and React, designed for sharing, browsing, and voting on unconventional startup ideas. Whether you want feedback, inspiration, or just a laugh, StartDown is the place to unleash your creativity.

## ✨ Features

- 💡 Submit, browse, and vote on unique startup ideas
- 📱 Modern, responsive UI with mobile and desktop support
- 🔒 Secure authentication with GitHub and Google (NextAuth.js)
- 🗄️ MongoDB-backed data storage and querying
- 👀 Real-time view tracking and search functionality
- 🧩 Modular, reusable React components
- 👨‍💻 Developer-friendly codebase and structure

![1](https://github.com/user-attachments/assets/c487fb68-7956-4346-96b2-e489f7578be2)

<img src="https://github.com/user-attachments/assets/693cf2ee-55ee-497c-bde0-782f4c433eb0" alt="StartDown Main Page" width="600" style="border-radius: 12px; box-shadow: 0 4px 24px #0002; margin-bottom: 1em;" />

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/) (App Router, SSR, API routes)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) (utility-first styling)
- [MongoDB](https://www.mongodb.com/) (database)
- [NextAuth.js](https://next-auth.js.org/) (authentication)
- [Lucide React](https://lucide.dev/) (icons)

## 🗂️ Project Structure
![1](https://github.com/user-attachments/assets/c80a9ac8-26c2-473a-9b77-72760afa7a04)

- `app/` — Main application code (routing, pages, layouts, API endpoints)
  - `(root)/` — Home page and main entry point
  - `api/` — API routes (authentication, data)
- `components/` — Reusable UI components (forms, navigation, cards, tooltips, etc.)
- `lib/` — Utility functions, database queries, mutations, and type definitions
- `public/` — Static assets (images, icons)

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gteretre/startdown.git
   cd startdown
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure environment variables:**
   Create a `.env.local` file in the root directory with the following:
   ```env
   NEXTAUTH_SECRET=your_random_secret # Generate with: openssl rand -base64 32
   AUTH_GITHUB_ID=your_github_client_id
   AUTH_GITHUB_SECRET=your_github_client_secret
   AUTH_GOOGLE_ID=your_google_client_id
   AUTH_GOOGLE_SECRET=your_google_client_secret
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB=startdown
   ```
4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. **Open [http://localhost:3000](http://localhost:3000) to view the app.**

## 🧪 Demo Data

Demo data is available in [`/demo-data/startdown.startups.json`](./demo-data/startdown.startups.json) and [`/demo-data/startdown.authors.json`](./demo-data/startdown.authors.json).

To import the demo data into your local MongoDB instance, run:

```bash
mongoimport --uri="your_local_connection_string" --collection=authors --file=demo-data/startdown.authors.json --jsonArray
mongoimport --uri="your_local_connection_string" --collection=startups --file=demo-data/startdown.startups.json --jsonArray
```

This will populate your database with sample authors and startup ideas for testing and development.

## 🚢 Deployment

To run in Docker:

```bash
docker build -t startdown .
docker run -p 3000:3000 --env-file [.env.local](http://_vscodecontentref_/0) startdown
```

## 🤝 Contribution & Feedback

Contributions, bug reports, and feature suggestions are welcome! Please open an issue or submit a pull request.

## 💡 About

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
