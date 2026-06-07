// Mock temporário — substituir por chamada à API quando backend tiver rota de planos
export const PLANS = [
  { id: 1, name: 'Básico Diário',     price: 29.90,  type: 'DAILY',   level: 'BASIC'     },
  { id: 2, name: 'Básico Mensal',     price: 99.90,  type: 'MONTHLY', level: 'BASIC'     },
  { id: 3, name: 'Básico Anual',      price: 799.90, type: 'ANNUAL',  level: 'BASIC'     },
  { id: 4, name: 'Avançado Diário',   price: 39.90,  type: 'DAILY',   level: 'ADVANCED'  },
  { id: 5, name: 'Avançado Mensal',   price: 129.90, type: 'MONTHLY', level: 'ADVANCED'  },
  { id: 6, name: 'Avançado Anual',    price: 999.90, type: 'ANNUAL',  level: 'ADVANCED'  },
  { id: 7, name: 'Pro Diário',        price: 49.90,  type: 'DAILY',   level: 'PRO'       },
  { id: 8, name: 'Pro Mensal',        price: 149.90, type: 'MONTHLY', level: 'PRO'       },
  { id: 9, name: 'Pro Anual',         price: 1199.90,type: 'ANNUAL',  level: 'PRO'       },
];
