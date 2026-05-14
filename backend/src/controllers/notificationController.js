const prisma = require('../config/prisma');
const { parsePagination, paginated } = require('../utils/pagination');
const { notFound } = require('../utils/httpError');

async function list(req, res) {
  const { page, pageSize, skip, take } = parsePagination(req.query);
  const where = { userId: req.user.id };
  if (req.query.unread === 'true') where.read = false;
  const [items, total] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.notification.count({ where }),
  ]);
  res.json(paginated(items, total, { page, pageSize }));
}

async function unreadCount(req, res) {
  const count = await prisma.notification.count({
    where: { userId: req.user.id, read: false },
  });
  res.json({ count });
}

async function markRead(req, res) {
  const id = parseInt(req.params.id, 10);
  const n = await prisma.notification.findUnique({ where: { id } });
  if (!n || n.userId !== req.user.id) throw notFound();
  const updated = await prisma.notification.update({ where: { id }, data: { read: true } });
  res.json(updated);
}

async function markAllRead(req, res) {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, read: false },
    data: { read: true },
  });
  res.json({ ok: true });
}

module.exports = { list, unreadCount, markRead, markAllRead };
