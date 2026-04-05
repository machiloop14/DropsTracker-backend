import { success } from "zod";
import { prisma } from "../db.js";
import { paginateAirdropResults } from "../utils/paginateAirdropResults.js";

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

    const { fetchedAirdrops, total, page, limit } =
      await paginateAirdropResults(req, userId);

    res.status(200).json({
      success: true,
      message: "All airdrops fetched successfully",
      data: fetchedAirdrops,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message ? error.message : "Server Error. Retry Later!",
    });
  }
};

export const handleDeleteAirdrop = async (req, res) => {
  try {
    const drop = await prisma.airdrop.findFirst({
      where: {
        userId: req.user.id,
        id: req.params.id,
      },
    });

    if (!drop)
      return res
        .status(404)
        .json({ success: false, message: "Drop not found!" });

    await prisma.airdrop.delete({
      where: {
        id: drop.id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Drop deleted successfully!",
      data: { id: drop.id },
    });
  } catch (error) {
    return res.status(500).jsom({
      success: false,
      message: error.message ? error.message : "Server Error. Retry Later!",
    });
  }
};

export const handleUpdateAirdrop = async (req, res) => {
  try {
    const { id } = req.params;

    const drop = await prisma.airdrop.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!drop) {
      return res.status(404).json({
        success: false,
        message: "Drop not found",
      });
    }

    const updatedDrop = await prisma.airdrop.update({
      where: { id },
      data: req.validatedData,
    });

    res.json({
      success: true,
      message: "Drop updated successfully",
      data: updatedDrop,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleFetchAirdrop = async (req, res) => {
  try {
    const { id } = req.params;

    const airdropDetails = await prisma.airdrop.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!airdropDetails)
      return res
        .status(404)
        .json({ success: false, message: "Airdop not found!" });

    res.status(200).json({
      success: true,
      message: "Fetched Airdrop Details Successful",
      data: airdropDetails,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
