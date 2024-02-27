import getConfig from 'next/config';
import { PrismaClient } from '@prisma/client';

const getGenres = async () => {
  const prisma = new PrismaClient();
  const genres = await prisma.genres.findMany();

  return genres;
};

const createGenre = async ({ code, name }) => {
    const prisma = new PrismaClient();
    const genre = await prisma.genres.create({
    data: {
        code,
        name,
        },
    });

    return genre;
};
   
const genres = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return res.status(200).json(await getGenres());
    case 'POST':
      return res.status(201).json(await createGenre(req.body));
    default:
      return res.status(405).end();
  }
};

export default genres;