import { prisma } from "../db.js";

export const paginateAirdropResults = async (req, userId) => {
  //pagination
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;
  let offset = (page - 1) * limit;

  //fetch all drops of current user
  const [fetchedAirdrops, total] = await Promise.all([
    prisma.airdrop.findMany({
      where: { userId },
      skip: offset,
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.airdrop.count({ where: { userId: userId } }),
  ]);

  return { fetchedAirdrops, total, page, limit };
};
