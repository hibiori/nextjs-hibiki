import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const deleteFavorite = async (id) => {
  await prisma.favorite.delete({
    where: {
      id,
    },
  });
};

const favoriteHandler = async (req, res) => {
  switch (req.method) {
    case 'DELETE':
      await deleteFavorite(parseInt(req.query.id, 10));
      return res.status(204).end();
    default:
      return res.status(405).end();
  }
};

export default favoriteHandler;
