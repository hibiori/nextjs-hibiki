import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAreas = async () => {
  const areas = await prisma.area.findMany();
  return areas;
};

const createArea = async ({ code, name }) => {
  const area = await prisma.area.create({
    data: {
      code,
      name,
    },
  });
  return area;
};

const areas = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return res.status(200).json(await getAreas());
    case 'POST':
      return res.status(201).json(await createArea(req.body));
    default:
      return res.status(405).end();
  }
};

export default areas;
