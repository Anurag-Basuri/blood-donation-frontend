import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import User from "../models/user.models.js";
import NGO from "../models/ngo.models.js";
import Hospital from "../models/hospital.models.js";
import { Center, BloodBank, DonationCamp } from "../models/center.models.js";
import BloodDonation from "../models/blood.models.js";
import BloodRequest from "../models/bloodrequest.models.js";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.models.js";

// Admin model reference (you might need to create this model)
// import Admin from "../models/admin.models.js";

/**
 * Generate admin access and refresh tokens
 */
const generateAdminTokens = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId);

    const accessToken = jwt.sign(
      {
        _id: admin._id,
        email: admin.email,
        role: "admin",
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { _id: admin._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};

/**
 * Admin login
 */
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const admin = await Admin.findOne({ email });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const isPasswordValid = await admin.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAdminTokens(admin._id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Admin logged in successfully"
      )
    );
});

/**
 * Admin logout
 */
const adminLogout = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(req.admin._id, { $unset: { refreshToken: 1 } });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Admin logged out successfully"));
});

/**
 * Get dashboard overview with key statistics
 */
const getDashboardOverview = asyncHandler(async (req, res) => {
  // System-wide counts
  const totalUsers = await User.countDocuments();
  const totalNGOs = await NGO.countDocuments();
  const totalHospitals = await Hospital.countDocuments();
  const totalCenters = await Center.countDocuments();
  const totalBloodBanks = await BloodBank.countDocuments();
  const totalDonationCamps = await DonationCamp.countDocuments();

  // Donation statistics
  const totalDonations = await BloodDonation.countDocuments();
  const availableDonations = await BloodDonation.countDocuments({
    status: "available",
  });

  // Request statistics
  const totalRequests = await BloodRequest.countDocuments();
  const pendingRequests = await BloodRequest.countDocuments({
    status: "Pending",
  });
  const completedRequests = await BloodRequest.countDocuments({
    status: "Completed",
  });

  // Blood group distribution for available blood
  const bloodGroupDistribution = await BloodDonation.aggregate([
    { $match: { status: "available" } },
    { $group: { _id: "$bloodGroup", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  // Blood expiring within 7 days
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

  const expiringBlood = await BloodDonation.countDocuments({
    status: "available",
    expiryDate: { $lte: sevenDaysLater },
  });

  // Recent activity
  const recentDonations = await BloodDonation.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("userId", "fullName")
    .populate("ngoId", "name")
    .populate("centerId", "name type");

  const recentRequests = await BloodRequest.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("hospitalId", "name")
    .populate("ngoId", "name");

  // New users, NGOs, and hospitals in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newUsers = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });
  const newNGOs = await NGO.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });
  const newHospitals = await Hospital.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        counts: {
          users: totalUsers,
          ngos: totalNGOs,
          hospitals: totalHospitals,
          centers: totalCenters,
          bloodBanks: totalBloodBanks,
          donationCamps: totalDonationCamps,
          totalDonations,
          availableDonations,
          totalRequests,
          pendingRequests,
          completedRequests,
        },
        growth: {
          newUsers,
          newNGOs,
          newHospitals,
        },
        bloodGroupDistribution,
        expiringBlood,
        recentActivity: {
          donations: recentDonations,
          requests: recentRequests,
        },
      },
      "Dashboard overview fetched successfully"
    )
  );
});

/**
 * Get blood inventory analytics with sorting by different parameters
 */
const getBloodInventoryAnalytics = asyncHandler(async (req, res) => {
  // Get query parameters
  const { groupBy = "bloodGroup", status } = req.query;

  // Build match criteria
  const matchCriteria = {};
  if (status) {
    matchCriteria.status = status;
  }

  // Validate groupBy parameter
  const validGroupBy = ["bloodGroup", "ngo", "center", "state", "city"];
  if (!validGroupBy.includes(groupBy)) {
    throw new ApiError(
      400,
      `Invalid groupBy parameter. Must be one of: ${validGroupBy.join(", ")}`
    );
  }

  // Build aggregation pipeline based on groupBy
  let pipeline = [];

  // Add match stage if filters are provided
  if (Object.keys(matchCriteria).length > 0) {
    pipeline.push({ $match: matchCriteria });
  }

  // Add lookup stages for referenced documents
  if (["ngo", "center", "state", "city"].includes(groupBy)) {
    if (groupBy === "ngo") {
      pipeline.push(
        {
          $lookup: {
            from: "ngos",
            localField: "ngoId",
            foreignField: "_id",
            as: "ngoInfo",
          },
        },
        { $unwind: "$ngoInfo" }
      );
    } else if (groupBy === "center") {
      pipeline.push(
        {
          $lookup: {
            from: "centers",
            localField: "centerId",
            foreignField: "_id",
            as: "centerInfo",
          },
        },
        { $unwind: "$centerInfo" }
      );
    }
  }

  // Add group stage based on groupBy parameter
  let groupStage = {};

  switch (groupBy) {
    case "bloodGroup":
      groupStage = {
        $group: {
          _id: "$bloodGroup",
          total: { $sum: 1 },
          available: {
            $sum: {
              $cond: [{ $eq: ["$status", "available"] }, 1, 0],
            },
          },
          used: {
            $sum: {
              $cond: [{ $eq: ["$status", "used"] }, 1, 0],
            },
          },
          expired: {
            $sum: {
              $cond: [{ $eq: ["$status", "expired"] }, 1, 0],
            },
          },
        },
      };
      break;

    case "ngo":
      groupStage = {
        $group: {
          _id: "$ngoId",
          ngoName: { $first: "$ngoInfo.name" },
          total: { $sum: 1 },
          available: {
            $sum: {
              $cond: [{ $eq: ["$status", "available"] }, 1, 0],
            },
          },
          bloodGroups: {
            $addToSet: "$bloodGroup",
          },
        },
      };
      break;

    case "center":
      groupStage = {
        $group: {
          _id: "$centerId",
          centerName: { $first: "$centerInfo.name" },
          centerType: { $first: "$centerInfo.type" },
          total: { $sum: 1 },
          available: {
            $sum: {
              $cond: [{ $eq: ["$status", "available"] }, 1, 0],
            },
          },
          bloodGroups: {
            $addToSet: "$bloodGroup",
          },
        },
      };
      break;

    case "state":
      groupStage = {
        $group: {
          _id: "$centerInfo.location.state",
          total: { $sum: 1 },
          available: {
            $sum: {
              $cond: [{ $eq: ["$status", "available"] }, 1, 0],
            },
          },
          centers: {
            $addToSet: {
              id: "$centerId",
              name: "$centerInfo.name",
            },
          },
        },
      };
      break;

    case "city":
      groupStage = {
        $group: {
          _id: "$centerInfo.location.city",
          state: { $first: "$centerInfo.location.state" },
          total: { $sum: 1 },
          available: {
            $sum: {
              $cond: [{ $eq: ["$status", "available"] }, 1, 0],
            },
          },
          centers: {
            $addToSet: {
              id: "$centerId",
              name: "$centerInfo.name",
            },
          },
        },
      };
      break;
  }

  pipeline.push(groupStage);

  // Add sort stage - sort by total units in descending order
  pipeline.push({ $sort: { total: -1 } });

  // Execute aggregation
  const result = await BloodDonation.aggregate(pipeline);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        groupedBy: groupBy,
        data: result,
      },
      "Blood inventory analytics fetched successfully"
    )
  );
});

/**
 * Get geo-based analytics for blood availability
 */
const getGeoAnalytics = asyncHandler(async (req, res) => {
  // Get state-wise distribution of centers
  const stateWiseDistribution = await Center.aggregate([
    {
      $group: {
        _id: "$location.state",
        centers: { $sum: 1 },
        bloodBanks: {
          $sum: {
            $cond: [{ $eq: ["$type", "BloodBank"] }, 1, 0],
          },
        },
        donationCamps: {
          $sum: {
            $cond: [{ $eq: ["$type", "DonationCamp"] }, 1, 0],
          },
        },
        cities: { $addToSet: "$location.city" },
      },
    },
    {
      $project: {
        _id: 0,
        state: "$_id",
        centers: 1,
        bloodBanks: 1,
        donationCamps: 1,
        cityCount: { $size: "$cities" },
      },
    },
    { $sort: { centers: -1 } },
  ]);

  // Get cities with the most blood availability
  const topCities = await BloodDonation.aggregate([
    { $match: { status: "available" } },
    {
      $lookup: {
        from: "centers",
        localField: "centerId",
        foreignField: "_id",
        as: "centerInfo",
      },
    },
    { $unwind: "$centerInfo" },
    {
      $group: {
        _id: "$centerInfo.location.city",
        state: { $first: "$centerInfo.location.state" },
        totalUnits: { $sum: 1 },
        bloodGroups: {
          $push: "$bloodGroup",
        },
      },
    },
    {
      $project: {
        _id: 0,
        city: "$_id",
        state: 1,
        totalUnits: 1,
        bloodGroupCounts: {
          $reduce: {
            input: "$bloodGroups",
            initialValue: {
              "A+": 0,
              "A-": 0,
              "B+": 0,
              "B-": 0,
              "AB+": 0,
              "AB-": 0,
              "O+": 0,
              "O-": 0,
            },
            in: {
              "A+": {
                $add: [
                  "$$value.A+",
                  { $cond: [{ $eq: ["$$this", "A+"] }, 1, 0] },
                ],
              },
              "A-": {
                $add: [
                  "$$value.A-",
                  { $cond: [{ $eq: ["$$this", "A-"] }, 1, 0] },
                ],
              },
              "B+": {
                $add: [
                  "$$value.B+",
                  { $cond: [{ $eq: ["$$this", "B+"] }, 1, 0] },
                ],
              },
              "B-": {
                $add: [
                  "$$value.B-",
                  { $cond: [{ $eq: ["$$this", "B-"] }, 1, 0] },
                ],
              },
              "AB+": {
                $add: [
                  "$$value.AB+",
                  { $cond: [{ $eq: ["$$this", "AB+"] }, 1, 0] },
                ],
              },
              "AB-": {
                $add: [
                  "$$value.AB-",
                  { $cond: [{ $eq: ["$$this", "AB-"] }, 1, 0] },
                ],
              },
              "O+": {
                $add: [
                  "$$value.O+",
                  { $cond: [{ $eq: ["$$this", "O+"] }, 1, 0] },
                ],
              },
              "O-": {
                $add: [
                  "$$value.O-",
                  { $cond: [{ $eq: ["$$this", "O-"] }, 1, 0] },
                ],
              },
            },
          },
        },
      },
    },
    { $sort: { totalUnits: -1 } },
    { $limit: 10 },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stateWiseDistribution,
        topCities,
      },
      "Geo analytics fetched successfully"
    )
  );
});

/**
 * Get donor analytics
 */
const getDonorAnalytics = asyncHandler(async (req, res) => {
  // Total donors
  const totalDonors = await BloodDonation.distinct("userId").length;

  // Donations per donor
  const donationsPerDonor = await BloodDonation.aggregate([
    {
      $group: {
        _id: "$userId",
        donationCount: { $sum: 1 },
        firstDonation: { $min: "$donationDate" },
        lastDonation: { $max: "$donationDate" },
        bloodGroups: { $addToSet: "$bloodGroup" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
    {
      $project: {
        _id: 0,
        userId: "$_id",
        name: "$userInfo.fullName",
        donationCount: 1,
        firstDonation: 1,
        lastDonation: 1,
        bloodGroup: { $arrayElemAt: ["$bloodGroups", 0] },
      },
    },
    { $sort: { donationCount: -1 } },
    { $limit: 20 },
  ]);

  // Blood group distribution among donors
  const donorBloodGroups = await BloodDonation.aggregate([
    {
      $group: {
        _id: "$bloodGroup",
        donorCount: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        _id: 0,
        bloodGroup: "$_id",
        donorCount: { $size: "$donorCount" },
      },
    },
    { $sort: { bloodGroup: 1 } },
  ]);

  // Monthly donation trends
  const monthlyDonations = await BloodDonation.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$donationDate" },
          month: { $month: "$donationDate" },
        },
        count: { $sum: 1 },
        uniqueDonors: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        donations: "$count",
        uniqueDonors: { $size: "$uniqueDonors" },
      },
    },
    { $sort: { year: 1, month: 1 } },
    { $limit: 12 },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalDonors,
        topDonors: donationsPerDonor,
        donorBloodGroups,
        monthlyDonations,
      },
      "Donor analytics fetched successfully"
    )
  );
});

/**
 * Get hospital analytics
 */
const getHospitalAnalytics = asyncHandler(async (req, res) => {
  // Hospitals with most blood requests
  const topRequestingHospitals = await BloodRequest.aggregate([
    {
      $group: {
        _id: "$hospitalId",
        requestCount: { $sum: 1 },
        pendingRequests: {
          $sum: {
            $cond: [{ $eq: ["$status", "Pending"] }, 1, 0],
          },
        },
        completedRequests: {
          $sum: {
            $cond: [{ $eq: ["$status", "Completed"] }, 1, 0],
          },
        },
        bloodGroups: {
          $push: "$bloodGroups.bloodGroup",
        },
      },
    },
    {
      $lookup: {
        from: "hospitals",
        localField: "_id",
        foreignField: "_id",
        as: "hospitalInfo",
      },
    },
    { $unwind: "$hospitalInfo" },
    {
      $project: {
        _id: 0,
        hospitalId: "$_id",
        name: "$hospitalInfo.name",
        city: "$hospitalInfo.address.city",
        state: "$hospitalInfo.address.state",
        requestCount: 1,
        pendingRequests: 1,
        completedRequests: 1,
        successRate: {
          $cond: [
            { $eq: ["$requestCount", 0] },
            0,
            {
              $multiply: [
                { $divide: ["$completedRequests", "$requestCount"] },
                100,
              ],
            },
          ],
        },
        bloodGroups: {
          $reduce: {
            input: "$bloodGroups",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
    },
    { $sort: { requestCount: -1 } },
    { $limit: 10 },
  ]);

  // Hospital connections with NGOs
  const hospitalNGOConnections = await Hospital.aggregate([
    { $unwind: "$connectedNGOs" },
    { $match: { "connectedNGOs.status": "Approved" } },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        city: { $first: "$address.city" },
        state: { $first: "$address.state" },
        connectedNGOs: { $sum: 1 },
      },
    },
    { $sort: { connectedNGOs: -1 } },
    { $limit: 10 },
  ]);

  // Blood group demand analysis
  const bloodGroupDemand = await BloodRequest.aggregate([
    { $unwind: "$bloodGroups" },
    {
      $group: {
        _id: "$bloodGroups.bloodGroup",
        totalUnits: { $sum: "$bloodGroups.units" },
        requestCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        bloodGroup: "$_id",
        totalUnits: 1,
        requestCount: 1,
        avgUnitsPerRequest: { $divide: ["$totalUnits", "$requestCount"] },
      },
    },
    { $sort: { totalUnits: -1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        topRequestingHospitals,
        hospitalNGOConnections,
        bloodGroupDemand,
      },
      "Hospital analytics fetched successfully"
    )
  );
});

/**
 * Get NGO analytics
 */
const getNGOAnalytics = asyncHandler(async (req, res) => {
  // NGOs with most blood collections
  const topNGOsByCollection = await BloodDonation.aggregate([
    {
      $group: {
        _id: "$ngoId",
        totalCollections: { $sum: 1 },
        uniqueDonors: { $addToSet: "$userId" },
        bloodGroups: { $addToSet: "$bloodGroup" },
      },
    },
    {
      $lookup: {
        from: "ngos",
        localField: "_id",
        foreignField: "_id",
        as: "ngoInfo",
      },
    },
    { $unwind: "$ngoInfo" },
    {
      $project: {
        _id: 0,
        ngoId: "$_id",
        name: "$ngoInfo.name",
        city: "$ngoInfo.address.city",
        state: "$ngoInfo.address.state",
        totalCollections: 1,
        uniqueDonorCount: { $size: "$uniqueDonors" },
        bloodGroups: 1,
      },
    },
    { $sort: { totalCollections: -1 } },
    { $limit: 10 },
  ]);

  // NGOs with most centers
  const topNGOsByCenters = await Center.aggregate([
    {
      $group: {
        _id: "$ngoId",
        totalCenters: { $sum: 1 },
        bloodBanks: {
          $sum: {
            $cond: [{ $eq: ["$type", "BloodBank"] }, 1, 0],
          },
        },
        donationCamps: {
          $sum: {
            $cond: [{ $eq: ["$type", "DonationCamp"] }, 1, 0],
          },
        },
        cities: { $addToSet: "$location.city" },
      },
    },
    {
      $lookup: {
        from: "ngos",
        localField: "_id",
        foreignField: "_id",
        as: "ngoInfo",
      },
    },
    { $unwind: "$ngoInfo" },
    {
      $project: {
        _id: 0,
        ngoId: "$_id",
        name: "$ngoInfo.name",
        totalCenters: 1,
        bloodBanks: 1,
        donationCamps: 1,
        cityCount: { $size: "$cities" },
      },
    },
    { $sort: { totalCenters: -1 } },
    { $limit: 10 },
  ]);

  // NGO fulfillment rate for hospital requests
  const ngoFulfillmentRate = await BloodRequest.aggregate([
    {
      $group: {
        _id: "$ngoId",
        totalRequests: { $sum: 1 },
        completedRequests: {
          $sum: {
            $cond: [{ $eq: ["$status", "Completed"] }, 1, 0],
          },
        },
        rejectedRequests: {
          $sum: {
            $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0],
          },
        },
      },
    },
    {
      $lookup: {
        from: "ngos",
        localField: "_id",
        foreignField: "_id",
        as: "ngoInfo",
      },
    },
    { $unwind: "$ngoInfo" },
    {
      $project: {
        _id: 0,
        ngoId: "$_id",
        name: "$ngoInfo.name",
        totalRequests: 1,
        completedRequests: 1,
        rejectedRequests: 1,
        fulfillmentRate: {
          $cond: [
            { $eq: ["$totalRequests", 0] },
            0,
            {
              $multiply: [
                { $divide: ["$completedRequests", "$totalRequests"] },
                100,
              ],
            },
          ],
        },
      },
    },
    { $sort: { fulfillmentRate: -1 } },
    { $limit: 10 },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        topNGOsByCollection,
        topNGOsByCenters,
        ngoFulfillmentRate,
      },
      "NGO analytics fetched successfully"
    )
  );
});

/**
 * Get system-wide time-based analytics (trends)
 */
const getTimeBasedAnalytics = asyncHandler(async (req, res) => {
  const { period = "month", count = 12 } = req.query;

  // Validate period
  const validPeriods = ["day", "week", "month", "year"];
  if (!validPeriods.includes(period)) {
    throw new ApiError(
      400,
      `Invalid period. Must be one of: ${validPeriods.join(", ")}`
    );
  }

  // Set up date grouping based on period
  let dateGroup;
  if (period === "day") {
    dateGroup = {
      year: { $year: "$createdAt" },
      month: { $month: "$createdAt" },
      day: { $dayOfMonth: "$createdAt" },
    };
  } else if (period === "week") {
    dateGroup = {
      year: { $year: "$createdAt" },
      week: { $week: "$createdAt" },
    };
  } else if (period === "month") {
    dateGroup = {
      year: { $year: "$createdAt" },
      month: { $month: "$createdAt" },
    };
  } else {
    dateGroup = {
      year: { $year: "$createdAt" },
    };
  }

  // Get donation trends
  const donationTrends = await BloodDonation.aggregate([
    {
      $group: {
        _id: dateGroup,
        donations: { $sum: 1 },
        donors: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        _id: 0,
        period: "$_id",
        donations: 1,
        donors: { $size: "$donors" },
      },
    },
    { $sort: { "period.year": -1, "period.month": -1, "period.day": -1 } },
    { $limit: parseInt(count) },
  ]);

  // Get request trends
  const requestTrends = await BloodRequest.aggregate([
    {
      $group: {
        _id: dateGroup,
        requests: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $eq: ["$status", "Completed"] }, 1, 0],
          },
        },
        rejected: {
          $sum: {
            $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        period: "$_id",
        requests: 1,
        completed: 1,
        rejected: 1,
        acceptance: {
          $multiply: [
            {
              $cond: [
                { $eq: ["$requests", 0] },
                0,
                { $divide: ["$completed", "$requests"] },
              ],
            },
            100,
          ],
        },
      },
    },
    { $sort: { "period.year": -1, "period.month": -1, "period.day": -1 } },
    { $limit: parseInt(count) },
  ]);

  // Get user registration trends
  const userTrends = await User.aggregate([
    {
      $group: {
        _id: dateGroup,
        registrations: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        period: "$_id",
        registrations: 1,
      },
    },
    { $sort: { "period.year": -1, "period.month": -1, "period.day": -1 } },
    { $limit: parseInt(count) },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        period,
        donationTrends: donationTrends.reverse(), // Reverse to show oldest first
        requestTrends: requestTrends.reverse(),
        userTrends: userTrends.reverse(),
      },
      "Time-based analytics fetched successfully"
    )
  );
});

/**
 * Get list of all users with pagination and filtering
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const {
    search,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query
  const query = {};
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Execute query
  const users = await User.find(query)
    .select("-password -refreshToken")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const totalUsers = await User.countDocuments(query);

  // Get donation stats for each user
  const userIds = users.map((user) => user._id);
  const donationStats = await BloodDonation.aggregate([
    { $match: { userId: { $in: userIds } } },
    {
      $group: {
        _id: "$userId",
        totalDonations: { $sum: 1 },
        lastDonation: { $max: "$donationDate" },
      },
    },
  ]);

  // Map donation stats to users
  const usersWithStats = users.map((user) => {
    const userObj = user.toObject();
    const stats = donationStats.find(
      (stat) => stat._id.toString() === user._id.toString()
    );
    userObj.donationStats = stats
      ? {
          totalDonations: stats.totalDonations,
          lastDonation: stats.lastDonation,
        }
      : {
          totalDonations: 0,
          lastDonation: null,
        };
    return userObj;
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users: usersWithStats,
        pagination: {
          totalUsers,
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          currentPage: parseInt(page),
          hasNextPage: skip + users.length < totalUsers,
          hasPrevPage: parseInt(page) > 1,
        },
      },
      "Users fetched successfully"
    )
  );
});

/**
 * Get list of all NGOs with pagination and filtering
 */
const getAllNGOs = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { "address.city": { $regex: search, $options: "i" } },
      { "address.state": { $regex: search, $options: "i" } },
    ];
  }

  if (status === "verified") {
    query.isVerified = true;
  } else if (status === "unverified") {
    query.isVerified = false;
  }

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Execute query
  const ngos = await NGO.find(query)
    .select("-password -refreshToken -verificationOTP")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const totalNGOs = await NGO.countDocuments(query);

  // Get additional stats for each NGO
  const ngoIds = ngos.map((ngo) => ngo._id);

  // Get center counts
  const centerCounts = await Center.aggregate([
    { $match: { ngoId: { $in: ngoIds } } },
    {
      $group: {
        _id: "$ngoId",
        totalCenters: { $sum: 1 },
        bloodBanks: {
          $sum: {
            $cond: [{ $eq: ["$type", "BloodBank"] }, 1, 0],
          },
        },
        donationCamps: {
          $sum: {
            $cond: [{ $eq: ["$type", "DonationCamp"] }, 1, 0],
          },
        },
      },
    },
  ]);

  // Get blood donation counts
  const donationCounts = await BloodDonation.aggregate([
    { $match: { ngoId: { $in: ngoIds } } },
    {
      $group: {
        _id: "$ngoId",
        totalDonations: { $sum: 1 },
        availableDonations: {
          $sum: {
            $cond: [{ $eq: ["$status", "available"] }, 1, 0],
          },
        },
      },
    },
  ]);

  // Map stats to NGOs
  const ngosWithStats = ngos.map((ngo) => {
    const ngoObj = ngo.toObject();

    // Add center stats
    const centerStat = centerCounts.find(
      (stat) => stat._id.toString() === ngo._id.toString()
    );
    ngoObj.centerStats = centerStat
      ? {
          totalCenters: centerStat.totalCenters,
          bloodBanks: centerStat.bloodBanks,
          donationCamps: centerStat.donationCamps,
        }
      : {
          totalCenters: 0,
          bloodBanks: 0,
          donationCamps: 0,
        };

    // Add donation stats
    const donationStat = donationCounts.find(
      (stat) => stat._id.toString() === ngo._id.toString()
    );
    ngoObj.donationStats = donationStat
      ? {
          totalDonations: donationStat.totalDonations,
          availableDonations: donationStat.availableDonations,
        }
      : {
          totalDonations: 0,
          availableDonations: 0,
        };

    return ngoObj;
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ngos: ngosWithStats,
        pagination: {
          totalNGOs,
          totalPages: Math.ceil(totalNGOs / parseInt(limit)),
          currentPage: parseInt(page),
          hasNextPage: skip + ngos.length < totalNGOs,
          hasPrevPage: parseInt(page) > 1,
        },
      },
      "NGOs fetched successfully"
    )
  );
});

/**
 * Get list of all hospitals with pagination and filtering
 */
const getAllHospitals = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { "address.city": { $regex: search, $options: "i" } },
      { "address.state": { $regex: search, $options: "i" } },
    ];
  }

  if (status === "verified") {
    query.isVerified = true;
  } else if (status === "unverified") {
    query.isVerified = false;
  }

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Execute query
  const hospitals = await Hospital.find(query)
    .select("-password -refreshToken -verificationOTP")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const totalHospitals = await Hospital.countDocuments(query);

  // Get blood request stats for each hospital
  const hospitalIds = hospitals.map((hospital) => hospital._id);
  const requestStats = await BloodRequest.aggregate([
    { $match: { hospitalId: { $in: hospitalIds } } },
    {
      $group: {
        _id: "$hospitalId",
        totalRequests: { $sum: 1 },
        pendingRequests: {
          $sum: {
            $cond: [{ $eq: ["$status", "Pending"] }, 1, 0],
          },
        },
        completedRequests: {
          $sum: {
            $cond: [{ $eq: ["$status", "Completed"] }, 1, 0],
          },
        },
      },
    },
  ]);

  // Map stats to hospitals
  const hospitalsWithStats = hospitals.map((hospital) => {
    const hospitalObj = hospital.toObject();

    // Add connected NGO count
    hospitalObj.connectedNGOCount = hospital.connectedNGOs.filter(
      (conn) => conn.status === "Approved"
    ).length;

    // Add request stats
    const requestStat = requestStats.find(
      (stat) => stat._id.toString() === hospital._id.toString()
    );
    hospitalObj.requestStats = requestStat
      ? {
          totalRequests: requestStat.totalRequests,
          pendingRequests: requestStat.pendingRequests,
          completedRequests: requestStat.completedRequests,
          fulfillmentRate:
            requestStat.totalRequests > 0
              ? (requestStat.completedRequests / requestStat.totalRequests) *
                100
              : 0,
        }
      : {
          totalRequests: 0,
          pendingRequests: 0,
          completedRequests: 0,
          fulfillmentRate: 0,
        };

    return hospitalObj;
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        hospitals: hospitalsWithStats,
        pagination: {
          totalHospitals,
          totalPages: Math.ceil(totalHospitals / parseInt(limit)),
          currentPage: parseInt(page),
          hasNextPage: skip + hospitals.length < totalHospitals,
          hasPrevPage: parseInt(page) > 1,
        },
      },
      "Hospitals fetched successfully"
    )
  );
});

/**
 * Get list of all blood donations with pagination and filtering
 */
const getAllBloodDonations = asyncHandler(async (req, res) => {
  const {
    status,
    bloodGroup,
    ngoId,
    centerId,
    userId,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query
  const query = {};
  if (status) query.status = status;
  if (bloodGroup) query.bloodGroup = bloodGroup;
  if (ngoId) query.ngoId = ngoId;
  if (centerId) query.centerId = centerId;
  if (userId) query.userId = userId;

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Execute query
  const donations = await BloodDonation.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("userId", "fullName email")
    .populate("ngoId", "name")
    .populate("centerId", "name type")
    .populate("currentLocation.entityId", "name");

  // Get total count
  const totalDonations = await BloodDonation.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        donations,
        pagination: {
          totalDonations,
          totalPages: Math.ceil(totalDonations / parseInt(limit)),
          currentPage: parseInt(page),
          hasNextPage: skip + donations.length < totalDonations,
          hasPrevPage: parseInt(page) > 1,
        },
      },
      "Blood donations fetched successfully"
    )
  );
});

/**
 * Verify an NGO (or reject verification)
 */
const verifyNGO = asyncHandler(async (req, res) => {
  const { ngoId } = req.params;
  const { isVerified, notes } = req.body;

  if (typeof isVerified !== "boolean") {
    throw new ApiError(400, "isVerified must be a boolean value");
  }

  const ngo = await NGO.findById(ngoId);

  if (!ngo) {
    throw new ApiError(404, "NGO not found");
  }

  ngo.isVerified = isVerified;
  if (notes) {
    ngo.adminNotes = notes;
  }

  await ngo.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        ngo,
        `NGO ${isVerified ? "verified" : "rejected"} successfully`
      )
    );
});

/**
 * Verify a hospital (or reject verification)
 */
const verifyHospital = asyncHandler(async (req, res) => {
  const { hospitalId } = req.params;
  const { isVerified, notes } = req.body;

  if (typeof isVerified !== "boolean") {
    throw new ApiError(400, "isVerified must be a boolean value");
  }

  const hospital = await Hospital.findById(hospitalId);

  if (!hospital) {
    throw new ApiError(404, "Hospital not found");
  }

  hospital.isVerified = isVerified;
  if (notes) {
    hospital.adminNotes = notes;
  }

  await hospital.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        hospital,
        `Hospital ${isVerified ? "verified" : "rejected"} successfully`
      )
    );
});

export {
  adminLogin,
  adminLogout,
  getDashboardOverview,
  getBloodInventoryAnalytics,
  getGeoAnalytics,
  getDonorAnalytics,
  getHospitalAnalytics,
  getNGOAnalytics,
  getTimeBasedAnalytics,
  getAllUsers,
  getAllNGOs,
  getAllHospitals,
  getAllBloodDonations,
  verifyNGO,
  verifyHospital,
};
