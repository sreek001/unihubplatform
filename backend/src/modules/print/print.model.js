const db = require('../booking/db'); // Pulling your project's DB connection (PostgreSQL Pool)

// 💾 In-memory fallback database when PostgreSQL is offline or connection is refused
let memoryStore = [];
let useMemoryFallback = false;

// 🚀 Table initialization sequence
const initializeTable = async () => {
    try {
        // Safe PostgreSQL table creation query
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS print_jobs (
                id SERIAL PRIMARY KEY,
                student_name VARCHAR(255) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_url TEXT NOT NULL,
                page_count INT NOT NULL,
                copies INT NOT NULL,
                print_type VARCHAR(50) NOT NULL,
                layout VARCHAR(50) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `;
        await db.query(createTableQuery);
        console.log("📦 Database check: 'print_jobs' table is ready (PostgreSQL).");
        useMemoryFallback = false;
    } catch (error) {
        console.warn("⚠️ Database connection failed. Falling back to safe in-memory storage. Error:", error.message);
        useMemoryFallback = true;
    }
};

initializeTable();

const PrintModel = {
    insertJob: async (studentName, fileName, fileUrl, pageCount, copies, printType, layout, price) => {
        if (useMemoryFallback) {
            const newJob = {
                id: memoryStore.length + 1,
                studentName,
                fileName,
                fileUrl,
                pageCount,
                copies,
                printType,
                layout,
                price: Number(price),
                status: 'Pending',
                createdAt: new Date().toISOString()
            };
            memoryStore.unshift(newJob);
            return newJob;
        }

        try {
            const query = `
                INSERT INTO print_jobs (student_name, file_name, file_url, page_count, copies, print_type, layout, price, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending')
                RETURNING 
                    id, 
                    student_name AS "studentName", 
                    file_name AS "fileName", 
                    file_url AS "fileUrl", 
                    page_count AS "pageCount", 
                    copies, 
                    print_type AS "printType", 
                    layout, 
                    price, 
                    status, 
                    created_at AS "createdAt"
            `;
            const { rows } = await db.query(query, [
                studentName,
                fileName,
                fileUrl,
                pageCount,
                copies,
                printType,
                layout,
                price
            ]);
            return rows[0];
        } catch (dbErr) {
            console.error("❌ DB insert failed, falling back to memory:", dbErr.message);
            useMemoryFallback = true;
            // Recursively execute with memory fallback enabled
            return await PrintModel.insertJob(studentName, fileName, fileUrl, pageCount, copies, printType, layout, price);
        }
    },
    getAllJobs: async () => {
        if (useMemoryFallback) {
            return memoryStore;
        }

        try {
            const query = `
                SELECT 
                    id, 
                    student_name AS "studentName", 
                    file_name AS "fileName", 
                    file_url AS "fileUrl", 
                    page_count AS "pageCount", 
                    copies, 
                    print_type AS "printType", 
                    layout, 
                    price, 
                    status, 
                    created_at AS "createdAt"
                FROM print_jobs
                ORDER BY created_at DESC
            `;
            const { rows } = await db.query(query);
            return rows;
        } catch (dbErr) {
            console.error("❌ DB select failed, falling back to memory:", dbErr.message);
            useMemoryFallback = true;
            return memoryStore;
        }
    },
    updateJobStatus: async (id, status) => {
        const jobId = parseInt(id, 10);
        if (useMemoryFallback) {
            const jobIndex = memoryStore.findIndex(j => j.id === jobId);
            if (jobIndex === -1) return null;
            memoryStore[jobIndex].status = status;
            return memoryStore[jobIndex];
        }

        try {
            const query = `
                UPDATE print_jobs
                SET status = $1
                WHERE id = $2
                RETURNING 
                    id, 
                    student_name AS "studentName", 
                    file_name AS "fileName", 
                    file_url AS "fileUrl", 
                    page_count AS "pageCount", 
                    copies, 
                    print_type AS "printType", 
                    layout, 
                    price, 
                    status, 
                    created_at AS "createdAt"
            `;
            const { rows } = await db.query(query, [status, jobId]);
            if (rows.length === 0) return null;
            return rows[0];
        } catch (dbErr) {
            console.error("❌ DB update failed, falling back to memory:", dbErr.message);
            useMemoryFallback = true;
            const jobIndex = memoryStore.findIndex(j => j.id === jobId);
            if (jobIndex === -1) return null;
            memoryStore[jobIndex].status = status;
            return memoryStore[jobIndex];
        }
    }
};

module.exports = PrintModel;

