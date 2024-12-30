const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// **Pelanggan: Melihat detail pesanan berdasarkan NoTelp**
router.get('/pesanan/:noTelp', (req, res) => {
    const { noTelp } = req.params;

    db.query(
        'SELECT * FROM `order` WHERE noTelp = ?',
        [noTelp],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) {
                return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
            }
            res.status(200).json(results);
        }
    );
});

// **Pelanggan: Menambahkan pesanan baru**
router.post('/pesanan', (req, res) => {
    const { nama, noTelp } = req.body;

    if (!nama || !noTelp) {
        return res.status(400).json({ message: 'Nama dan NoTelp diperlukan untuk membuat pesanan' });
    }

    db.query(
        'INSERT INTO `order` (nama, noTelp) VALUES (?, ?)',
        [nama, noTelp],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Pesanan berhasil ditambahkan', id: results.insertId });
        }
    );
});

module.exports = router;
