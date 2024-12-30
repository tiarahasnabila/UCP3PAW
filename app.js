const express = require('express');
const app = express();
const db = require('./database/db'); // Koneksi ke database
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session'); // Pastikan session diimpor
require('dotenv').config();

// Menggunakan express-ejs-layouts untuk layout
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set view engine
app.set('view engine', 'ejs');

// Route untuk halaman utama (pelanggan)
app.get('/', (req, res) => {
    res.render('index', {
        layout: 'layouts/main-layout'
    });
});

// Simulasi database pengguna
const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'user1', password: 'user123', role: 'pelanggan' }
];

// Middleware untuk sesi
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Rute Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Cari pengguna berdasarkan username dan password
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Simpan data pengguna ke sesi
        req.session.user = user;

        // Arahkan berdasarkan role
        if (user.role === 'admin') {
            res.redirect('/halamanadmin');
        } else if (user.role === 'pelanggan') {
            res.redirect('/index');
        }
    } else {
        res.send('Username atau password salah! <a href="/login">Coba lagi</a>');
    }
});

// Rute untuk halaman pelanggan
app.get('/index', (req, res) => {
    if (req.session.user && req.session.user.role === 'pelanggan') {
        res.render('index'); // Render halaman index.ejs
    } else {
        res.redirect('/login');
    }
});

// Rute untuk halaman admin
app.get('/halamanadmin', (req, res) => {
    if (req.session.user && req.session.user.role === 'admin') {
        res.render('halamanadmin'); // Render halaman halamanadmin.ejs
    } else {
        res.redirect('/login');
    }
});

// Rute untuk login form
app.get('/login', (req, res) => {
    res.render('login'); // Render halaman login.ejs
});

// Rute untuk logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Route untuk melihat stok produk (pelanggan)
app.get('/produkpelanggan', (req, res) => {
    db.query('SELECT * FROM produk', (err, produk) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.render('produkpelanggan', {
            layout: 'layouts/main-layout',
            produk: produk
        });
    });
});

// Route to display the order page (order.ejs)
app.get('/order/:productId', (req, res) => {
    const productId = req.params.productId;
    db.query('SELECT * FROM produk WHERE id = ?', [productId], (err, products) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        if (products.length === 0) {
            return res.status(404).send('Product not found');
        }
        const product = products[0];
        res.render('order', { product: product });
    });
});

// Route to handle order submission (POST request)
app.post('/api/orders', (req, res) => {
    const { productId, jumlah } = req.body;

    db.query('SELECT * FROM produk WHERE id = ?', [productId], (err, products) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        if (products.length === 0) {
            return res.status(404).send('Product not found');
        }

        const product = products[0];
        const total_harga = product.harga * jumlah;

        const orderQuery = 'INSERT INTO order (nama_paket, jumlah, total_harga) VALUES (?, ?, ?)';
        db.query(orderQuery, [product.nama_paket, jumlah, total_harga], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error placing order');
            }
            res.status(201).send('Order placed successfully');
        });
    });
});

// Route untuk melihat daftar pesanan pelanggan
app.get('/order', (req, res) => {
    db.query('SELECT * FROM `order`', (err, order) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.render('order', {
            layout: 'layouts/main-layout',
            order: order
        });
    });
});

// ADMIN ROUTES

// Route untuk melihat dan mengelola stok produk (admin)
app.get('/produk', (req, res) => {
    db.query('SELECT * FROM produk', (err, produk) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.render('produk', {
            layout: 'layouts/admin-layout',
            produk: produk
        });
    });
});

// Route untuk menambah produk baru (admin)
app.post('/produk', (req, res) => {
    const { nama_paket, stok, harga } = req.body;

    // Validasi input
    if (!nama_paket || !stok || !harga) {
        return res.status(400).send('Nama paket, stok, dan harga tidak boleh kosong');
    }

    const query = 'INSERT INTO produk (nama_paket, stok, harga) VALUES (?, ?, ?)';
    db.query(query, [nama_paket, stok, harga], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error adding product');
        }
        res.status(201).json({ id: result.insertId, nama_paket, stok, harga });
    });
});

// Route untuk mengedit produk (admin)
app.put('/produk/:id', (req, res) => {
    const { nama_paket, stok, harga } = req.body;
    const produkId = req.params.id;

    // Validasi input
    if (!nama_paket || !stok || !harga) {
        return res.status(400).send('Nama paket, stok, dan harga tidak boleh kosong');
    }

    db.query('UPDATE produk SET nama_paket = ?, stok = ?, harga = ? WHERE id = ?', [nama_paket, stok, harga, produkId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).send('Product updated');
    });
});

// Route untuk menghapus produk (admin)
app.delete('/produk/:id', (req, res) => {
    const produkId = req.params.id;
    db.query('DELETE FROM produk WHERE id = ?', [produkId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting product');
        }
        res.status(200).send('Product deleted');
    });
});

// Route untuk melihat pesanan (admin)
app.get('/admin/pesanan', (req, res) => {
    db.query('SELECT * FROM pesanan', (err, pesanan) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.render('admin/pesanan', {
            layout: 'layouts/admin-layout',
            pesanan: pesanan
        });
    });
});

// Route untuk menghapus pesanan (admin)
app.delete('/admin/pesanan/:id', (req, res) => {
    const pesananId = req.params.id;
    db.query('DELETE FROM pesanan WHERE id = ?', [pesananId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting order');
        }
        res.status(200).send('Order deleted');
    });
});

// Menjalankan server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
