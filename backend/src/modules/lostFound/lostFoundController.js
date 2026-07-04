const pool = require('./db');
const { cleanupLostFoundPosts } = require('../../cron/cleanupLostFound');

// --- Fallback In-Memory Datastore ---
let inMemoryLocations = [
  { id: 1, name: 'Library Commons' },
  { id: 2, name: 'Student Center' },
  { id: 3, name: 'Chemistry Building' },
  { id: 4, name: 'Engineering Quad' },
  { id: 5, name: 'Campus Canteen' },
  { id: 6, name: 'Sports Complex' },
  { id: 7, name: 'Other Area' },
]

let inMemoryPosts = [
  {
    id: 1,
    category: 'Found',
    itemName: 'Blue commuter backpack',
    description: 'Black and blue backpack with a silver water bottle sleeve and campus ID badge attached.',
    location: 'Library Commons',
    contactEmail: 'backpack-owner@campus.edu',
    contactPhone: '+18005551234',
    contactInfo: 'Email or text. Located in Library Room 204.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
    status: 'Available',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    category: 'Lost',
    itemName: 'Silver key ring',
    description: 'Metal key ring with three keys, one red plastic tag, and a handwritten name label inside.',
    location: 'Chemistry Building',
    contactEmail: 'chemkeys@campus.edu',
    contactPhone: '+18005559876',
    contactInfo: 'Call if found. Reward offered.',
    image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&q=80',
    status: 'Claim pending',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    category: 'Found',
    itemName: 'Student ID wallet',
    description: 'Brown leather wallet with student ID, library card, and a few receipts inside.',
    location: 'Student Center',
    contactEmail: 'id-wallet@campus.edu',
    contactPhone: '+18005553421',
    contactInfo: 'Can pick up at front desk.',
    image: 'https://images.unsplash.com/photo-1627124089633-8fc6d5d05aa2?w=500&q=80',
    status: 'Ready for pickup',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    category: 'Lost',
    itemName: 'Noise-cancelling earphones',
    description: 'Black over-ear earphones in a branded carrying pouch with a zipper pull.',
    location: 'Engineering Quad',
    contactEmail: 'earphones-owner@campus.edu',
    contactPhone: '+18005555678',
    contactInfo: 'Lost near the benches.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    status: 'Available',
    postedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

/**
 * GET /api/lostfound/locations
 */
async function getLocations(req, res) {
  try {
    const { rows } = await pool.query('SELECT id, name FROM campus_locations ORDER BY name');
    return res.json({ success: true, locations: rows });
  } catch (err) {
    console.warn('[LostFound DB] query failed, using in-memory locations fallback:', err.message);
    return res.json({ success: true, locations: inMemoryLocations });
  }
}

/**
 * GET /api/lostfound/posts
 */
async function getPosts(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.category, p.item_name AS "itemName", p.description, l.name AS location, 
              p.contact_email AS "contactEmail", p.contact_phone AS "contactPhone", 
              p.contact_info AS "contactInfo", p.image, p.status, p.posted_at AS "postedAt"
         FROM lost_found_posts p
         JOIN campus_locations l ON p.location_id = l.id
        ORDER BY p.posted_at DESC`
    );
    return res.json({ success: true, posts: rows });
  } catch (err) {
    console.warn('[LostFound DB] query failed, using in-memory posts fallback:', err.message);
    return res.json({ success: true, posts: inMemoryPosts });
  }
}

/**
 * POST /api/lostfound/posts
 */
async function createPost(req, res) {
  const { category, itemName, description, location, contactEmail, contactPhone, contactInfo, image } = req.body;
  if (!category || !itemName || !description || !location || !contactEmail) {
    return res.status(400).json({ success: false, message: 'category, itemName, description, location, and contactEmail are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Resolve or create location ID
    let locationId;
    const { rows: locRows } = await client.query('SELECT id FROM campus_locations WHERE name = $1 LIMIT 1', [location]);
    if (locRows.length > 0) {
      locationId = locRows[0].id;
    } else {
      const insertLoc = await client.query('INSERT INTO campus_locations(name) VALUES ($1) RETURNING id', [location]);
      locationId = insertLoc.rows[0].id;
    }

    // 2. Insert post (including image)
    const { rows } = await client.query(
      `INSERT INTO lost_found_posts(category, item_name, description, location_id, contact_email, contact_phone, contact_info, image, status, posted_at, expires_at, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Available',NOW(),NOW() + INTERVAL '14 days',NOW())
       RETURNING id`,
      [category, itemName, description, locationId, contactEmail, contactPhone || null, contactInfo || null, image || null]
    );

    await client.query('COMMIT');
    return res.status(201).json({ success: true, createdId: rows[0].id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.warn('[LostFound DB] insert transaction failed, using in-memory fallback:', err.message);
  } finally {
    client.release();
  }

  // Fallback to memory
  let locExists = inMemoryLocations.find(l => l.name.toLowerCase() === location.toLowerCase());
  if (!locExists) {
    locExists = { id: Date.now(), name: location };
    inMemoryLocations.push(locExists);
  }

  const newPost = {
    id: Date.now(),
    category,
    itemName,
    description,
    location: locExists.name,
    contactEmail,
    contactPhone: contactPhone || '',
    contactInfo: contactInfo || '',
    image: image || '',
    status: 'Available',
    postedAt: new Date().toISOString()
  };
  inMemoryPosts.unshift(newPost);
  res.status(201).json({ success: true, createdId: newPost.id });
}

/**
 * PATCH /api/lostfound/posts/:id/status
 */
async function updateStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'status is required' });
  }

  try {
    const { rows } = await pool.query(
      'UPDATE lost_found_posts SET status = $1 WHERE id = $2 RETURNING id',
      [status, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    return res.json({ success: true, updatedId: rows[0].id });
  } catch (err) {
    console.warn('[LostFound DB] update failed, using in-memory fallback:', err.message);
    const post = inMemoryPosts.find(p => p.id === Number(id) || p.id === id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    post.status = status;
    return res.json({ success: true, updatedId: post.id });
  }
}

/**
 * DELETE /api/lostfound/posts/:id
 */
async function deletePost(req, res) {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('DELETE FROM lost_found_posts WHERE id = $1 RETURNING id', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    return res.json({ success: true, deletedId: rows[0].id });
  } catch (err) {
    console.warn('[LostFound DB] delete failed, using in-memory fallback:', err.message);
    const index = inMemoryPosts.findIndex(p => p.id === Number(id) || p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    const deleted = inMemoryPosts.splice(index, 1)[0];
    return res.json({ success: true, deletedId: deleted.id });
  }
}

/**
 * DELETE /api/lostfound/cleanup
 */
async function cleanupExpired(req, res) {
  try {
    const count = await cleanupLostFoundPosts();
    return res.json({ success: true, removed: count });
  } catch (err) {
    console.warn('[LostFound DB] cleanup failed, using in-memory fallback:', err.message);
    const originalLength = inMemoryPosts.length;
    const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
    inMemoryPosts = inMemoryPosts.filter(p => new Date(p.postedAt).getTime() >= cutoff);
    return res.json({ success: true, removed: originalLength - inMemoryPosts.length });
  }
}

module.exports = {
  getLocations,
  getPosts,
  createPost,
  updateStatus,
  deletePost,
  cleanupExpired,
};
