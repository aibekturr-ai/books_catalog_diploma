import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function ensureGenres() {
  const genres = [
    {
      id: "genre_fantasy",
      name: "Fantasy",
      slug: "fantasy",
      subgenres: [
        { id: "sub_epic", name: "Epic Fantasy", slug: "epic-fantasy" },
        { id: "sub_dark", name: "Dark Fantasy", slug: "dark-fantasy" },
        { id: "sub_urban", name: "Urban Fantasy", slug: "urban-fantasy" },
      ],
    },
    {
      id: "genre_scifi",
      name: "Science Fiction",
      slug: "science-fiction",
      subgenres: [
        { id: "sub_hard_sf", name: "Hard SF", slug: "hard-sf" },
        { id: "sub_space", name: "Space Opera", slug: "space-opera" },
      ],
    },
    { id: "genre_memoir", name: "Memoir", slug: "memoir", subgenres: [] },
    { id: "genre_mystery", name: "Mystery", slug: "mystery", subgenres: [] },
    { id: "genre_romance", name: "Romance", slug: "romance", subgenres: [] },
    { id: "genre_nonfiction", name: "Nonfiction", slug: "nonfiction", subgenres: [] },
  ];

  for (const g of genres) {
    await prisma.genre.upsert({
      where: { slug: g.slug },
      update: { name: g.name },
      create: { id: g.id, name: g.name, slug: g.slug },
    });
    for (const s of g.subgenres) {
      await prisma.subgenre.upsert({
        where: { genreId_slug: { genreId: g.id, slug: s.slug } },
        update: { name: s.name },
        create: { id: s.id, name: s.name, slug: s.slug, genreId: g.id },
      });
    }
  }
}

async function main() {
  await ensureGenres();

  const passwordHash = await bcrypt.hash("password123", 10);

  const demo = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: { role: "USER" },
    create: {
      email: "demo@example.com",
      passwordHash,
      role: "USER",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: "ADMIN" },
    create: {
      email: "admin@example.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  const samples = [
    {
      title: "The Name of the Wind",
      author: "Patrick Rothfuss",
      description:
        "A gifted young man grows into a legendary magician in a richly imagined world.",
      genreId: "genre_fantasy",
      subgenreId: "sub_epic",
      coverImage: "https://picsum.photos/seed/book1/400/600",
      status: "PUBLISHED",
    },
    {
      title: "Project Hail Mary",
      author: "Andy Weir",
      description: "An astronaut alone in deep space races to save humanity.",
      genreId: "genre_scifi",
      subgenreId: "sub_hard_sf",
      coverImage: "https://picsum.photos/seed/book2/400/600",
      status: "PUBLISHED",
    },
    {
      title: "Educated",
      author: "Tara Westover",
      description: "A memoir of family, survival, and the transformative power of education.",
      genreId: "genre_memoir",
      subgenreId: null,
      coverImage: "https://picsum.photos/seed/book3/400/600",
      status: "PUBLISHED",
    },
  ];

  for (const b of samples) {
    const exists = await prisma.book.findFirst({
      where: { title: b.title, userId: demo.id },
    });
    if (!exists) {
      await prisma.book.create({
        data: { ...b, userId: demo.id },
      });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
