'use strict';

const store = require('../db');
const security = require('../security');
const { LIMITS, HttpError, sendJson, readJsonBody } = require('./http');
const { getSession, requireAdmin } = require('./session');

const { cleanString, cleanNumber, pickEnum, RateLimiter, getClientIp } = security;

const ORDER_TYPES = ['delivery_order', 'catering_quote', 'table_reservation', 'whatsapp_inquiry'];
const ORDER_BRANDS = ['catering', 'restaurant', 'delivery'];
const ORDER_STATUSES = ['new', 'confirmed', 'preparing', 'out_for_delivery', 'completed', 'cancelled'];

const orderLimiter = new RateLimiter({ windowMs: 10 * 60 * 1000, max: 60 });

const roundMoney = n => Math.round(n * 100) / 100;

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 100).map(item => ({
    id: cleanString(item && item.id, 60),
    title: cleanString(item && item.title, 200),
    qty: cleanNumber(item && item.qty, { min: 1, max: 999, integer: true }),
    priceValue: roundMoney(cleanNumber(item && item.priceValue, { min: 0, max: 100000 })),
    modifiers: Array.isArray(item && item.modifiers) ? item.modifiers.slice(0, 20).map(m => cleanString(m, 200)) : [],
    note: cleanString(item && item.note, 300)
  }));
}

function buildOrder(body, { isAdmin }) {
  const items = normalizeItems(body.items);
  const itemsTotal = items.reduce((sum, i) => sum + i.priceValue * i.qty, 0);
  // The website total includes delivery fees and promo discounts, so it is accepted as sent;
  // staff confirm every order with the customer over WhatsApp before it is fulfilled.
  const requestedTotal = roundMoney(cleanNumber(body.totalUsd, { min: 0, max: 10000000 }));
  const totalUsd = requestedTotal > 0 ? requestedTotal : roundMoney(itemsTotal);

  const seq = store.nextOrderSeq(body.id);

  return {
    id: `MK-${seq}`,
    createdAt: new Date().toISOString(),
    type: pickEnum(body.type, ORDER_TYPES, 'whatsapp_inquiry'),
    brand: pickEnum(body.brand, ORDER_BRANDS, 'delivery'),
    status: isAdmin ? pickEnum(body.status, ORDER_STATUSES, 'new') : 'new',
    customerName: cleanString(body.customerName, 120) || 'WhatsApp Customer',
    customerPhone: cleanString(body.customerPhone, 40),
    address: cleanString(body.address, 300),
    eventType: cleanString(body.eventType, 120),
    eventDate: cleanString(body.eventDate, 40),
    guests: cleanNumber(body.guests, { min: 0, max: 100000, integer: true }),
    packageSelected: cleanString(body.packageSelected, 200),
    notes: cleanString(body.notes, 2000),
    items,
    totalUsd,
    lbpRate: store.getLbpRate(),
    staffNotes: isAdmin
      ? cleanString(body.staffNotes, 500)
      : cleanString(body.staffNotes, 300) || 'Recorded automatically from website WhatsApp action',
    whatsappText: cleanString(body.whatsappText, 5000),
    source: isAdmin ? 'back-office' : 'website'
  };
}

const PATCHABLE_FIELDS = {
  status: v => pickEnum(v, ORDER_STATUSES, null),
  staffNotes: v => cleanString(v, 500),
  customerName: v => cleanString(v, 120),
  customerPhone: v => cleanString(v, 40),
  address: v => cleanString(v, 300),
  notes: v => cleanString(v, 2000),
  eventType: v => cleanString(v, 120),
  eventDate: v => cleanString(v, 40),
  packageSelected: v => cleanString(v, 200),
  guests: v => cleanNumber(v, { min: 0, max: 100000, integer: true }),
  totalUsd: v => roundMoney(cleanNumber(v, { min: 0, max: 10000000 }))
};

function listOrders(req, res) {
  requireAdmin(req);
  return sendJson(res, 200, { ok: true, orders: store.listOrders() });
}

async function createOrder(req, res) {
  const session = getSession(req);
  const isAdmin = Boolean(session);
  const ip = getClientIp(req);

  if (!isAdmin) {
    const state = orderLimiter.hit(ip);
    if (!state.allowed) {
      throw new HttpError(429, 'Too many requests. Please try again shortly.', {
        retryAfter: state.retryAfterSec
      });
    }
  }

  const body = await readJsonBody(req, LIMITS.order);
  // Honeypot fields: bots fill them, humans never see them.
  if (body.website || body.company_url) return sendJson(res, 201, { ok: true });

  const order = buildOrder(body, { isAdmin });
  const saved = store.insertOrder(order);
  store.logAudit(
    isAdmin ? session.username : 'customer',
    'order.created',
    `${saved.id} (${saved.type}) - ${saved.customerName} ($${saved.totalUsd})`,
    ip
  );
  return sendJson(res, 201, { ok: true, order: saved });
}

async function patchOrder(req, res, { id }) {
  const session = requireAdmin(req);
  const body = await readJsonBody(req, LIMITS.order);
  if (!store.getOrderById(id)) throw new HttpError(404, 'Order not found.');

  const patch = {};
  for (const [field, normalise] of Object.entries(PATCHABLE_FIELDS)) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      const value = normalise(body[field]);
      if (value !== null) patch[field] = value;
    }
  }
  const updated = store.updateOrder(id, patch);
  store.logAudit(session.username, 'order.updated', `${id} -> ${JSON.stringify(patch)}`, getClientIp(req));
  return sendJson(res, 200, { ok: true, order: updated });
}

function deleteOrder(req, res, { id }) {
  const session = requireAdmin(req);
  if (!store.deleteOrder(id)) throw new HttpError(404, 'Order not found.');
  store.logAudit(session.username, 'order.deleted', `Deleted order ${id}`, getClientIp(req));
  return sendJson(res, 200, { ok: true });
}

function trackOrder(req, res, { id: rawId }) {
  const normalizedId = String(rawId || '')
    .trim()
    .replace(/^#/, '')
    .toUpperCase();
  const order = store.getOrderById(normalizedId);
  if (!order) {
    throw new HttpError(404, `Order reference #${normalizedId} was not found. Please check your Order Reference ID.`);
  }
  const firstName = String(order.customerName || 'Valued Guest').split(' ')[0];
  return sendJson(res, 200, {
    ok: true,
    order: {
      id: order.id,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt || order.createdAt,
      type: order.type,
      brand: order.brand,
      status: order.status,
      customerFirstName: firstName,
      eventType: order.eventType,
      eventDate: order.eventDate,
      guests: order.guests,
      packageSelected: order.packageSelected,
      items: (order.items || []).map(i => ({
        title: i.title,
        qty: i.qty,
        priceValue: i.priceValue,
        modifiers: i.modifiers || []
      })),
      totalUsd: order.totalUsd,
      lbpRate: order.lbpRate || store.getLbpRate()
    }
  });
}

module.exports = { listOrders, createOrder, patchOrder, deleteOrder, trackOrder };
