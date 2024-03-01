import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getFavorites = async () => {
  const favorites = await prisma.favorite.findMany();
  return favorites;
};

const createfavorite = async ({ shop_id }) => {
  const favorite = await prisma.favorite.create({
    data: {
      shop_id,
    },
  });
  return favorite;
};

const favorites = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return res.status(200).json(await getFavorites());
    case 'POST':
      return res.status(201).json(await createfavorite(req.body));
    default:
      return res.status(405).end();
  }
};

export default favorites;
