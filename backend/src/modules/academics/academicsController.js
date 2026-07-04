const pool = require('./db');

// --- Mock Data Fallbacks (Matching your 6 students and 5 cheap items exactly) ---
let mockStudents = [
  { id: 'anannya-20', name: 'Anannya sunny', branch: 'Computer Science', currentSemester: 6, email: 'anannya@campus.edu', phone: '+91 9876543210' },
  { id: 'sreehari-456', name: 'Sreehari', branch: 'Ai and datascience', currentSemester: 4, email: 'sreehari@campus.edu', phone: '+91 8765432109' },
  { id: 'astrea-789', name: 'Astrea Rose Antony', branch: 'Electrical Engineering', currentSemester: 2, email: 'astrea@campus.edu', phone: '+91 7654321098' },
  { id: 'karthik-sajan', name: 'Karthik Sajan', branch: 'Mechanical Engineering', currentSemester: 4, email: 'karthik@campus.edu', phone: '+91 6543210987' },
  { id: 'liya-martin', name: 'Liya Martin', branch: 'Computer Science', currentSemester: 6, email: 'liya@campus.edu', phone: '+91 5432109876' },
  { id: 'esther-antony', name: 'Esther Antony', branch: 'Electrical Engineering', currentSemester: 2, email: 'esther@campus.edu', phone: '+91 4321098765' }
];

let mockTextbooks = [
  {
    id: 'book-1',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen',
    description: 'Standard algorithms textbook, slightly highlighted pages.',
    price: 120,
    condition: 'Good',
    category: 'Computer Science and Engineering',
    ownerId: 'liya-martin',
    ownerName: 'Liya Martin',
    status: 'Available',
    type: 'Textbook'
  },
  {
    id: 'book-2',
    title: 'University Physics',
    author: 'Hugh D. Young',
    description: 'Volume 1, covers mechanics, waves, and thermodynamics.',
    price: 150,
    condition: 'Like New',
    category: 'Basic Science & Humanities',
    ownerId: 'karthik-sajan',
    ownerName: 'Karthik Sajan',
    status: 'Available',
    type: 'Textbook'
  },
  {
    id: 'book-3',
    title: 'Calculus: Early Transcendentals',
    author: 'James Stewart',
    description: 'Essential calculus reference for early semesters.',
    price: 80,
    condition: 'Fair',
    category: 'Basic Science & Humanities',
    ownerId: 'esther-antony',
    ownerName: 'Esther Antony',
    status: 'Available',
    type: 'Textbook'
  },
  {
    id: 'item-4',
    title: 'Engineering Graphics Drawing Sheets',
    author: 'First Year CSE',
    description: 'Standard A3 drawing sheets, containing basic projections. Ideal for reference.',
    price: 0,
    condition: 'Good',
    category: 'Mechanical Engineering',
    ownerId: 'anannya-20',
    ownerName: 'Anannya sunny',
    status: 'Available',
    type: 'Drawing Sheets'
  },
  {
    id: 'item-5',
    title: 'Digital Electronics Lab Record',
    author: 'KTU Syllabus',
    description: 'Fully completed and signed lab record with logic gates diagrams.',
    price: 50,
    condition: 'Like New',
    category: 'Electrical and Electronics Engineering',
    ownerId: 'sreehari-456',
    ownerName: 'Sreehari',
    status: 'Available',
    type: 'Notebook/Record'
  }
];

let mockResources = [];

let mockRequests = [];

// Helper to map database rows (snake_case) to frontend formats (camelCase)
function mapStudent(row) {
  return {
    id: row.id,
    name: row.name,
    branch: row.branch,
    currentSemester: row.current_semester
  };
}

function mapTextbook(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    description: row.description,
    price: row.price,
    condition: row.condition,
    category: row.category,
    ownerId: row.owner_id,
    ownerName: row.owner_name || 'Unknown Student',
    status: row.status,
    createdAt: row.created_at,
    type: row.type
  };
}

function mapResource(row) {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    subject: row.subject,
    semester: row.semester,
    link: row.link,
    uploaderId: row.uploader_id,
    uploaderName: row.uploader_name || 'Unknown Student',
    createdAt: row.created_at
  };
}

// --- Controller Methods ---

async function getStudents(req, res) {
  try {
    const { rows } = await pool.query('SELECT id, name, branch, current_semester FROM students ORDER BY name');
    return res.json(rows.map(mapStudent));
  } catch (err) {
    console.warn('[Academics DB] query failed, using in-memory fallback:', err.message);
    return res.json(mockStudents);
  }
}

async function updateStudent(req, res) {
  const { id } = req.params;
  const { name, branch, currentSemester } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE students SET name = $1, branch = $2, current_semester = $3 WHERE id = $4 RETURNING *',
      [name, branch, currentSemester, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
    return res.json(mapStudent(rows[0]));
  } catch (err) {
    console.warn('[Academics DB] update failed, updating in-memory:', err.message);
    const idx = mockStudents.findIndex(s => s.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Student not found' });
    mockStudents[idx] = { id, name, branch, currentSemester };
    return res.json(mockStudents[idx]);
  }
}

async function getTextbooks(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT t.*, s.name as owner_name 
      FROM textbooks t
      JOIN students s ON t.owner_id = s.id
      ORDER BY t.created_at DESC
    `);
    return res.json(rows.map(mapTextbook));
  } catch (err) {
    console.warn('[Academics DB] query failed, using in-memory:', err.message);
    return res.json(mockTextbooks);
  }
}

async function createTextbook(req, res) {
  const { id, title, author, description, price, condition, category, ownerId, type } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO textbooks (id, title, author, description, price, condition, category, owner_id, status, type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Available', $9) RETURNING *`,
      [id, title, author, description, price, condition, category, ownerId, type || 'Textbook']
    );
    const newBook = rows[0];
    const studentRes = await pool.query('SELECT name FROM students WHERE id = $1', [ownerId]);
    newBook.owner_name = studentRes.rows[0]?.name || 'Unknown Student';
    return res.json(mapTextbook(newBook));
  } catch (err) {
    console.warn('[Academics DB] insert failed, saving in-memory:', err.message);
    const ownerName = mockStudents.find(s => s.id === ownerId)?.name || 'Unknown Student';
    const newBook = { id, title, author, description, price, condition, category, ownerId, ownerName, status: 'Available', type };
    mockTextbooks.push(newBook);
    return res.json(newBook);
  }
}

async function requestHandover(req, res) {
  const { id, textbookId, buyerId } = req.body;
  try {
    await pool.query('BEGIN');
    await pool.query(
      'INSERT INTO handover_requests (id, textbook_id, buyer_id, status) VALUES ($1, $2, $3, \'Pending\')',
      [id, textbookId, buyerId]
    );
    await pool.query('UPDATE textbooks SET status = \'Requested\' WHERE id = $1', [textbookId]);
    await pool.query('COMMIT');
    return res.json({ success: true });
  } catch (err) {
    if (pool.query) await pool.query('ROLLBACK').catch(() => {});
    console.warn('[Academics DB] request transaction failed, in-memory:', err.message);
    const bookIdx = mockTextbooks.findIndex(b => b.id === textbookId);
    if (bookIdx !== -1) mockTextbooks[bookIdx].status = 'Requested';
    mockRequests.push({ id, textbookId, buyerId, status: 'Pending' });
    return res.json({ success: true });
  }
}

async function getHandoverRequests(req, res) {
  const { studentId } = req.query;
  try {
    const incomingRes = await pool.query(`
      SELECT r.id, r.status, r.created_at, t.title as "textbookTitle", t.id as "textbookId", b.name as "buyerName"
      FROM handover_requests r
      JOIN textbooks t ON r.textbook_id = t.id
      JOIN students b ON r.buyer_id = b.id
      WHERE t.owner_id = $1
    `, [studentId]);

    const outgoingRes = await pool.query(`
      SELECT r.id, r.status, r.created_at, t.title as "textbookTitle", t.id as "textbookId", t.price as "textbookPrice", 
             o.name as "ownerName", o.email as "ownerEmail", o.phone as "ownerPhone"
      FROM handover_requests r
      JOIN textbooks t ON r.textbook_id = t.id
      JOIN students o ON t.owner_id = o.id
      WHERE r.buyer_id = $1
    `, [studentId]);

    return res.json({
      incoming: incomingRes.rows,
      outgoing: outgoingRes.rows
    });
  } catch (err) {
    console.warn('[Academics DB] query requests failed, using in-memory:', err.message);
    
    const incoming = mockRequests
      .filter(r => {
        const book = mockTextbooks.find(b => b.id === r.textbookId);
        return book && book.ownerId === studentId;
      })
      .map(r => {
        const book = mockTextbooks.find(b => b.id === r.textbookId);
        const buyer = mockStudents.find(s => s.id === r.buyerId);
        return { id: r.id, status: r.status, textbookTitle: book?.title, textbookId: r.textbookId, buyerName: buyer?.name };
      });

    const outgoing = mockRequests
      .filter(r => r.buyerId === studentId)
      .map(r => {
        const book = mockTextbooks.find(b => b.id === r.textbookId);
        const owner = mockStudents.find(s => s.id === book?.ownerId);
        return { 
          id: r.id, 
          status: r.status, 
          textbookTitle: book?.title, 
          textbookId: r.textbookId, 
          textbookPrice: book?.price,
          ownerName: owner?.name, 
          ownerEmail: owner?.email, 
          ownerPhone: owner?.phone 
        };
      });

    return res.json({ incoming, outgoing });
  }
}

async function updateHandoverRequest(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('BEGIN');
    const { rows } = await pool.query(
      'UPDATE handover_requests SET status = $1 WHERE id = $2 RETURNING textbook_id',
      [status, id]
    );
    if (rows.length > 0) {
      const bookId = rows[0].textbook_id;
      if (status === 'Accepted') {
        await pool.query('UPDATE textbooks SET status = \'Accepted\' WHERE id = $1', [bookId]);
      } else if (status === 'Completed') {
        await pool.query('UPDATE textbooks SET status = \'Handed Over\' WHERE id = $1', [bookId]);
      }
    }
    await pool.query('COMMIT');
    return res.json({ success: true });
  } catch (err) {
    if (pool.query) await pool.query('ROLLBACK').catch(() => {});
    console.warn('[Academics DB] update request failed, in-memory:', err.message);
    const reqIdx = mockRequests.findIndex(r => r.id === id);
    if (reqIdx !== -1) {
      mockRequests[reqIdx].status = status;
      const bookIdx = mockTextbooks.findIndex(b => b.id === mockRequests[reqIdx].textbookId);
      if (bookIdx !== -1) {
        if (status === 'Accepted') mockTextbooks[bookIdx].status = 'Accepted';
        if (status === 'Completed') mockTextbooks[bookIdx].status = 'Handed Over';
      }
    }
    return res.json({ success: true });
  }
}

async function getDigitalResources(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT r.*, s.name as uploader_name 
      FROM digital_resources r
      JOIN students s ON r.uploader_id = s.id
      ORDER BY r.created_at DESC
    `);
    return res.json(rows.map(mapResource));
  } catch (err) {
    console.warn('[Academics DB] query resources failed, in-memory:', err.message);
    return res.json(mockResources);
  }
}

async function createDigitalResource(req, res) {
  const { id, title, type, subject, semester, link, uploaderId } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO digital_resources (id, title, type, subject, semester, link, uploader_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, title, type, subject, semester, link, uploaderId]
    );
    const newRes = rows[0];
    const studentRes = await pool.query('SELECT name FROM students WHERE id = $1', [uploaderId]);
    newRes.uploader_name = studentRes.rows[0]?.name || 'Unknown Student';
    return res.json(mapResource(newRes));
  } catch (err) {
    console.warn('[Academics DB] insert resource failed, in-memory:', err.message);
    const uploaderName = mockStudents.find(s => s.id === uploaderId)?.name || 'Unknown Student';
    const newRes = { id, title, type, subject, semester, link, uploaderId, uploaderName };
    mockResources.push(newRes);
    return res.json(newRes);
  }
}

module.exports = {
  getStudents,
  updateStudent,
  getTextbooks,
  createTextbook,
  requestHandover,
  getHandoverRequests,
  updateHandoverRequest,
  getDigitalResources,
  createDigitalResource
};