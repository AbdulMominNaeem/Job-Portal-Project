const parsePagination = (q) => {
  const page = Math.max(parseInt(q.page || '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(q.pageSize || '20', 10), 1), 100);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
};

const paginated = (items, total, { page, pageSize }) => ({
  items,
  page,
  pageSize,
  total,
  totalPages: Math.max(Math.ceil(total / pageSize), 1),
});

module.exports = { parsePagination, paginated };
