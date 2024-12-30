const express = require ('express');
const router = express.Router();
const mysql = require('mysql2');

// **Melihat stok produk**
router.get('/stok', authenticateAdmin, (req, res) => {
    db.query('SELECT * FROM produk', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

// **Menambahkan stok baru**
router.post('/stok', authenticateAdmin, (req, res) => {
    const { nama_paket, stok, harga } = req.body;
    db.query(
        'INSERT INTO produk (nama_paket, stok, harga) VALUES (?, ?, ?)',
        [nama_paket, stok, harga],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Stok baru berhasil ditambahkan', id: results.insertId });
        }
    );
});

// **Memperbarui stok produk**
router.put('/stok/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const { nama_paket, stok, harga } = req.body;

    db.query(
        'UPDATE produk SET nama_paket = ?, stok = ?, harga = ? WHERE id = ?',
        [nama_paket, stok, harga, id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Produk tidak ditemukan' });
            }
            res.status(200).json({ message: 'Stok berhasil diperbarui' });
        }
    );
});

// **Menghapus stok produk**
router.delete('/stok/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM produk WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
        res.status(200).json({ message: 'Produk berhasil dihapus' });
    });
});

// **Melihat semua pesanan**
router.get('/pesanan', authenticateAdmin, (req, res) => {
    db.query('SELECT * FROM pesanan', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

// **Menghapus pesanan**
router.delete('/pesanan/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM pesanan WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        }
        res.status(200).json({ message: 'Pesanan berhasil dihapus' });
    });
});



module.exports = router;
