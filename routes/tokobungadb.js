const express = require('express');
const router = express.Router();
const db = require('../database/db'); // Mengimpor koneksi database


// Fungsi untuk menambahkan stok produk baru
const addStok = (nama_paket, stok, harga, callback) => {
    db.query(
        'INSERT INTO produk (nama_paket, stok, harga) VALUES (?, ?, ?)',
        [nama_paket, stok, harga],
        (err, results) => {
            if (err) {
                console.error(err);
                return callback(err, null);
            }
            callback(null, results.insertId);  // Mengembalikan ID dari stok yang baru ditambahkan
        }
    );
};

// Fungsi untuk melihat semua stok produk
const getStok = (callback) => {
    db.query('SELECT * FROM produk', (err, results) => {
        if (err) {
            console.error(err);
            return callback(err, null);
        }
        callback(null, results);
    });
};

// Fungsi untuk memperbarui stok produk
const updateStok = (id, nama_paket, stok, harga, callback) => {
    db.query(
        'UPDATE produk SET nama_paket = ?, stok = ?, harga = ? WHERE id = ?',
        [nama_paket, stok, harga, id],
        (err, results) => {
            if (err) {
                console.error(err);
                return callback(err, null);
            }
            if (results.affectedRows === 0) {
                return callback(new Error('Produk tidak ditemukan'), null);
            }
            callback(null, results);
        }
    );
};

// Fungsi untuk menghapus stok produk
const deleteStok = (id, callback) => {
    db.query('DELETE FROM produk WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            return callback(err, null);
        }
        if (results.affectedRows === 0) {
            return callback(new Error('Produk tidak ditemukan'), null);
        }
        callback(null, results);
    });
};

// Fungsi untuk melihat semua pesanan
const getPesanan = (callback) => {
    db.query('SELECT * FROM pesanan', (err, results) => {
        if (err) {
            console.error(err);
            return callback(err, null);
        }
        callback(null, results);
    });
};

// Fungsi untuk menghapus pesanan berdasarkan ID
const deletePesanan = (id, callback) => {
    db.query('DELETE FROM pesanan WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            return callback(err, null);
        }
        if (results.affectedRows === 0) {
            return callback(new Error('Pesanan tidak ditemukan'), null);
        }
        callback(null, results);
    });
};

module.exports = {
    addStok,
    getStok,
    updateStok,
    deleteStok,
    getPesanan,
    deletePesanan
};
