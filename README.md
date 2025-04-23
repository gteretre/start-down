# StartDown

StartDown is a quirky web platform built with Next.js and React. It’s a playful tribute to the world of startups, where users can share their wildest, funniest, or most outlandish startup ideas. Whether you’re looking for feedback, inspiration, or just a laugh, StartDown is the place to let your creativity run wild.

## Features

- Submit and browse unconventional startup ideas
- Community feedback and interaction
- Clean, modern UI
- Built as part of a developer portfolio

## Tech Stack

- [Next.js](https://nextjs.org/) (React framework)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/) (if applicable)
- [Tailwind CSS](https://tailwindcss.com/) or other CSS framework (if used)

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/startdown.git
   cd startdown
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. **Open [http://localhost:3000](http://localhost:3000) to view the app.**

## Demo Database

Demo data is included in the [`/demo-data/demo_startups.json`](./demo-data/demo_startups.json) file.

To import it into your local MongoDB instance, run:

```bash
mongoimport --uri="your_local_connection_string" --collection=startups --file=demo-data/demo_startups.json --jsonArray
```

## Project Structure

- `/pages` – Next.js pages/routes
- `/components` – Reusable React components
- `/styles` – Global and component styles
- `/public` – Static assets

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

_This project is part of my developer portfolio. Feel free to explore, contribute, or just enjoy the fun!_
