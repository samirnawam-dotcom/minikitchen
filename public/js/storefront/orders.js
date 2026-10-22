// Website order / inquiry recording: reference numbers (#MK-XXXX), the local copy used by the
// order tracker when offline, and POST /api/orders so the Back Office sees every WhatsApp lead.

import { loadJson, saveJson, getItem, setItem } from '../shared/storage.js';
import { postOrder } from './api.js';
import { content } from './config.js';

const SEQ_KEY = 'mk_next_order_seq_v1';
const ORDERS_KEY = 'mk_backoffice_orders_v1';
const LAST_ORDER_KEY = 'mk_last_order_id';

let nextOrderSeqHint = Number(getItem(SEQ_KEY)) || 1005;

/** Reserves the next reference number shown to the customer (the server may renumber on collision). */
export function allocateOrderId() {
  const seq = nextOrderSeqHint;
  nextOrderSeqHint = seq + 1;
  setItem(SEQ_KEY, nextOrderSeqHint);
  return `MK-${seq}`;
}

export function setNextOrderSeqHint(seq) {
  if (Number(seq) >= 1000) {
    nextOrderSeqHint = Number(seq);
    setItem(SEQ_KEY, nextOrderSeqHint);
  }
}

export const loadLocalOrders = () => {
  const list = loadJson(ORDERS_KEY, []);
  return Array.isArray(list) ? list : [];
};

export const saveLocalOrders = list => saveJson(ORDERS_KEY, list);

export const rememberLastOrderId = id => setItem(LAST_ORDER_KEY, id);
export const getLastOrderId = () => getItem(LAST_ORDER_KEY);

/** Stores the order locally (instant, works offline) and sends it to the server in the background. */
export function recordOrder(payload) {
  const entry = {
    id: payload.id || allocateOrderId(),
    createdAt: new Date().toISOString(),
    status: 'new',
    lbpRate: content.lbpRate,
    ...payload
  };

  saveLocalOrders([entry, ...loadLocalOrders()]);

  postOrder(entry).then(saved => {
    if (!saved) return;
    const list = loadLocalOrders();
    const idx = list.findIndex(o => o.id === entry.id || o.id === saved.id);
    if (idx !== -1) list[idx] = saved;
    else list.unshift(saved);
    saveLocalOrders(list);
  });

  return entry;
}
