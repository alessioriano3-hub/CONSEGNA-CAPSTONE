// Popola il database con utenti e dati di esempio. Uso: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const { User, Customer, Product, Order } = require('./src/models');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  if ((await User.exists({})) && !process.argv.includes('--reset')) {
    console.log('Il database contiene già dati. Per cancellarli e ripartire: npm run seed -- --reset');
    return process.exit(0);
  }
  await Promise.all([User, Customer, Product, Order].map((M) => M.deleteMany({})));
  await User.create([
    { name: 'Admin', email: 'admin@azienda.it', password: 'admin123', role: 'admin' },
    { name: 'Operatore', email: 'operatore@azienda.it', password: 'operatore123', role: 'operator' },
  ]);
  const cities = ['Napoli', 'Salerno', 'Caserta', 'Avellino', 'Benevento', 'Napoli'];
  const customers = await Customer.insertMany(
    ['Rossi Costruzioni', 'Bianchi Srl', 'Ferramenta Verdi', 'Studio Neri', 'Caffè Gallo', 'Officina Conti']
      .map((name, i) => ({ name, email: `contatto${i + 1}@esempio.it`, phone: `081 555010${i}`, city: cities[i] })));
  const products = await Product.insertMany([
    ['Viti inox 4x40 (conf.)', 'VI-440', 6.5, 120], ['Trapano a batteria 18V', 'TR-018', 89, 14],
    ['Casco da cantiere', 'CA-001', 12.9, 40], ['Guanti da lavoro', 'GU-010', 4.5, 3],
    ['Livella laser', 'LI-200', 54, 8], ['Cacciavite set 12 pz', 'CC-012', 18, 25],
    ['Tassello universale (conf.)', 'TA-100', 3.2, 4], ['Metro a nastro 5 m', 'ME-005', 7.9, 60],
  ].map(([name, sku, price, stock]) => ({ name, sku, price, stock })));
  const statuses = ['consegnato', 'consegnato', 'spedito', 'lavorazione', 'nuovo', 'annullato'];
  for (let i = 0; i < 24; i++) {
    const items = [0, 1, 2].slice(0, 1 + (i % 3)).map((k) => {
      const p = products[(i + k * 3) % products.length];
      return { product: p._id, name: p.name, price: p.price, qty: 1 + ((i + k) % 4) };
    });
    await Order.create({
      customer: customers[i % customers.length]._id, items,
      total: Math.round(items.reduce((s, l) => s + l.price * l.qty, 0) * 100) / 100,
      status: i < 14 ? 'consegnato' : statuses[i % statuses.length],
      createdAt: new Date(Date.now() - (23 - i) * 6.5 * 86400000),
    });
  }
  console.log('Dati di esempio creati.\n  admin@azienda.it / admin123\n  operatore@azienda.it / operatore123');
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
