import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getArea = async (id) => {
  const area = await prisma.area.findUnique({
    where: {
      id,
    },
  });

  return area;
};

const updateArea = async (id, { code, name }) => {
  const data = {};
  if (code) data.code = code;
  if (name) data.name = name;

  const area = await prisma.area.update({
    where: {
      id,
    },
    data,
  });

  return area;
};

const deleteArea = async (id) => {
  await prisma.area.delete({
    where: {
      id,
    },
  });
};

const areaHandler = async (req, res) => {
  switch (req.method) {
    case 'GET':
      return res.status(200).json(await getArea(parseInt(req.query.id, 10)));
    case 'PATCH':
      return res.status(200).json(await updateArea(parseInt(req.query.id, 10), req.body));
    case 'DELETE':
      await deleteArea(parseInt(req.query.id, 10));
      return res.status(204).end();
    default:
      return res.status(405).end();
  }
};

export default areaHandler;
