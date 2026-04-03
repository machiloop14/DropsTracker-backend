import { success } from "zod";
import { prisma } from "../db.js";

export const handleAddAirdrop = async (req, res) => {
  let savedAirdrop;

  //fetch zod-validated data
  const airdropDetails = req.validatedData;

  //fetch current user(from isAuth middleware using jwt)
  const userId = req.user.id;

  //if no current user, return error
  if (!userId)
    return res
      .status(400)
      .json({ success: false, message: "No user in current request" });

  //save the airdrop in database
  try {
    savedAirdrop = await prisma.airdrop.create({
      data: { ...airdropDetails, userId },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error });
  }

  //return a success response
  res.status(200).json({
    success: true,
    message: "drops route reached",
    data: savedAirdrop,
  });
};

export const handleFetchAirdrops = async (req, res) => {
  //fetch current user(from isAuth middleware using jwt)
  try {
    const userId = req.user.id;

    //if no current user, return error
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "No user in current request" });

    //fetch all drops of current user
    const fetchedAirdrops = await prisma.airdrop.findMany({
      where: { userId: userId },
    });

    return res.status(200).json({
      success: true,
      message: "All airdrops fetched successfully",
      data: fetchedAirdrops,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message ? error.message : "Error. Try again later",
    });
  }
};
