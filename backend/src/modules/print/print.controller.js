const PrintModel = require('./print.model');

// 📄 Submit a new print job
const createPrintJob = async (req, res) => {
    try {
        const { studentName, copies, printType, layout } = req.body;

        if (!req.file || !studentName || !copies || !printType || !layout) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields."
            });
        }

        const fileName = req.file.originalname;

        // Demo values
        const fileUrl = `/uploads/${fileName}`;
        const pageCount = 1;

        // Pricing
        const ratePerCopy = printType === "Color" ? 5 : 2;
        const price = Number(copies) * ratePerCopy;

        // Save job
        const savedJob = await PrintModel.insertJob(
            studentName,
            fileName,
            fileUrl,
            pageCount,
            Number(copies),
            printType,
            layout,
            price
        );

        return res.status(201).json({
            success: true,
            message: "Print job submitted successfully!",
            order: savedJob
        });

    } catch (error) {
        console.error("❌ CREATE PRINT JOB ERROR:", error);

        return res.status(500).json({
            success: false,
            error: error.message || error.toString()
        });
    }
};

// 📋 Fetch all print jobs
const getPrintHistory = async (req, res) => {
    try {
        const jobs = await PrintModel.getAllJobs();

        return res.status(200).json({
            success: true,
            message: "Print history fetched successfully.",
            jobs
        });

    } catch (error) {
        console.error("❌ GET HISTORY ERROR:", error);

        return res.status(500).json({
            success: false,
            error: error.message || error.toString()
        });
    }
};

// 🔄 Update print job status
const updatePrintJobStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required."
            });
        }

        const updatedJob = await PrintModel.updateJobStatus(id, status);

        if (!updatedJob) {
            return res.status(404).json({
                success: false,
                message: "Print job not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Print job status updated successfully.",
            job: updatedJob
        });

    } catch (error) {
        console.error("❌ UPDATE STATUS ERROR:", error);

        return res.status(500).json({
            success: false,
            error: error.message || error.toString()
        });
    }
};

module.exports = {
    createPrintJob,
    getPrintHistory,
    updatePrintJobStatus
};