import { prisma } from "../db.js";

export const handleAddAirdrop = async (req, res) => {
  let savedAirdrop;
  const airdropDetails = req.validatedData;

  const userId = req.user.id;
  if (!userId)
    return res
      .status(400)
      .json({ success: false, message: "No user in current request" });

  try {
    savedAirdrop = await prisma.airdrop.create({
      data: { ...airdropDetails, userId },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error });
  }

  res.status(200).json({
    success: true,
    message: "drops route reached",
    data: savedAirdrop,
  });
};
