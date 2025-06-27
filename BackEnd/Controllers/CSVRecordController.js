import CSVRecord from "../Models/CSVRecord.js";
import LeadModel from "../Models/LeadModel.js";

const getCSVRecords = async (req, res) => {
  try {
    const records = await CSVRecord.find()
      .populate("leadRefs", "status")
      .sort({ createdAt: -1 });

    const formatted = records.map((record) => {
      const total = record.leadRefs.length;
      const assigned = record.leadRefs.filter(
        (lead) => lead.status === "Ongoing"
      ).length;
      const closed = record.leadRefs.filter(
        (lead) => lead.status === "Closed"
      ).length;
      const unassigned = total - assigned - closed;

      return {
        id: record._id,
        fileName: record.fileName,
        uploadedAt: record.createdAt,
        totalLeads: total,
        assignedLeads: assigned,
        unassignedLeads: unassigned,
        closedLeads: closed,
      };
    });

    res.status(200).json({ records: formatted });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch CSV records",
      details: error.message,
    });
  }
};

const syncCSVRecords = async (req, res) => {
  try {
    // Get all leads that have a CSV reference
    const leads = await LeadModel.find({ csvRef: { $ne: null } });

    // Map: { csvRefId: { assigned: x, unassigned: y, closed: z } }
    const statsMap = {};

    leads.forEach((lead) => {
      const csvId = lead.csvRef.toString();
      if (!statsMap[csvId]) {
        statsMap[csvId] = { assigned: 0, unassigned: 0, closed: 0 };
      }

      if (lead.status === "Closed") {
        statsMap[csvId].closed += 1;
      } else if (lead.assignedTo) {
        statsMap[csvId].assigned += 1;
      } else {
        statsMap[csvId].unassigned += 1;
      }
    });

    // Update each CSVRecord
    const updatePromises = Object.entries(statsMap).map(([csvId, stats]) =>
      CSVRecord.findByIdAndUpdate(csvId, {
        assignedLeads: stats.assigned,
        unassignedLeads: stats.unassigned,
        closedLeads: stats.closed,
      })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      message: "CSV records synced successfully",
      updated: Object.keys(statsMap).length,
    });
  } catch (error) {
    console.error("Failed to sync CSV stats:", error);
    res.status(500).json({ error: "Failed to sync CSV records" });
  }
};

export { getCSVRecords, syncCSVRecords };
