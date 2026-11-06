export const ok = (res, data, meta = null) =>
  res.status(200).json({ success: true, data, ...(meta && { meta }) });

export const created = (res, data) =>
  res.status(201).json({ success: true, data });

export const noContent = (res) => res.status(204).end();

export const paginated = (res, data, { page, limit, total }) =>
  res.status(200).json({
    success: true,
    data,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });