export type SupplierCategory =
  | 'Furniture'
  | 'Flooring'
  | 'Lighting'
  | 'Fabrics'
  | 'Masonry'
  | 'Electrical'
  | 'Plumbing'
  | 'Tiles'
  | 'Joinery'
  | 'Ironmongery'

export type SubVendorSpecialty =
  | 'Masonry'
  | 'Plumbing'
  | 'Electrical'
  | 'Plastering'
  | 'Joinery'
  | 'Tiling'
  | 'Painting'
  | 'HVAC'

export type SupplierStatus = 'Active' | 'Inactive'
export type AvailabilityStatus = 'Available' | 'Busy' | 'Unknown'
export type DeliveryStatus = 'Delivered' | 'Pending' | 'Delayed'
export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid'

export interface Supplier {
  id: number
  name: string
  category: SupplierCategory
  contactPerson: string
  phone: string
  email: string
  address: string
  website?: string
  activeProjects: number
  totalOrders: number
  avgLeadTime: string
  creditTerms: string
  status: SupplierStatus
  notes?: string
}

export interface SupplierRate {
  id: number
  item: string
  rate: string
  unit: string
  creditTerms: string
  leadTime: string
}

export interface SupplierOrder {
  id: number
  date: string
  project: string
  item: string
  quantity: string
  deliveryStatus: DeliveryStatus
  paymentStatus: PaymentStatus
  amount: string
}

export interface SubVendor {
  id: number
  name: string
  company: string
  specialty: SubVendorSpecialty
  phone: string
  email: string
  address: string
  availability: AvailabilityStatus
  pastProjects: number
  paymentRecord: 'Excellent' | 'Good' | 'Fair'
  notes?: string
}

export interface SubVendorHistory {
  id: number
  project: string
  startDate: string
  endDate: string
  scope: string
  status: 'Completed' | 'In Progress' | 'Cancelled'
}

export interface SubVendorPayment {
  id: number
  project: string
  amount: string
  date: string
  status: PaymentStatus
}

// ── Supplier data ─────────────────────────────────────────────────────────────
export const SUPPLIERS: Supplier[] = [
  {
    id: 1,
    name: 'Poliform Milano',
    category: 'Furniture',
    contactPerson: 'Andrea Colombo',
    phone: '+39 031 628 111',
    email: 'trade@poliform.it',
    address: 'Via Montesanto 28, Inverigo, Como',
    website: 'poliform.it',
    activeProjects: 4,
    totalOrders: 38,
    avgLeadTime: '8–10 weeks',
    creditTerms: 'Net 30',
    status: 'Active',
    notes: 'Preferred furniture supplier. Trade account active since 2019. Dedicated account manager assigned.',
  },
  {
    id: 2,
    name: 'Fiemme 3000',
    category: 'Flooring',
    contactPerson: 'Marco Visintin',
    phone: '+39 0462 501 500',
    email: 'm.visintin@fiemme3000.it',
    address: 'Via Sobieski 1, Predazzo, Trento',
    activeProjects: 2,
    totalOrders: 22,
    avgLeadTime: '4–6 weeks',
    creditTerms: 'Net 15',
    status: 'Active',
    notes: 'Solid wood flooring specialist. Excellent for high-end residential.',
  },
  {
    id: 3,
    name: 'Flos Architectural',
    category: 'Lighting',
    contactPerson: 'Elena Fusco',
    phone: '+39 030 329 3111',
    email: 'e.fusco@flos.com',
    address: 'Via Angelo Faini 2, Bovezzo, Brescia',
    website: 'flos.com',
    activeProjects: 5,
    totalOrders: 51,
    avgLeadTime: '6–8 weeks',
    creditTerms: 'Net 30',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Rubelli Textiles',
    category: 'Fabrics',
    contactPerson: 'Giulia Trevisan',
    phone: '+39 041 241 3111',
    email: 'contract@rubelli.com',
    address: 'Palazzo Corner Spinelli, Venice',
    website: 'rubelli.com',
    activeProjects: 3,
    totalOrders: 17,
    avgLeadTime: '3–5 weeks',
    creditTerms: 'Net 45',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Gres Ceramiche',
    category: 'Tiles',
    contactPerson: 'Roberto Mele',
    phone: '+39 0536 861 001',
    email: 'r.mele@gresceramiche.it',
    address: 'Via Statale 467, Sassuolo, Modena',
    activeProjects: 2,
    totalOrders: 14,
    avgLeadTime: '3–4 weeks',
    creditTerms: 'Net 15',
    status: 'Active',
  },
  {
    id: 6,
    name: 'Bertolotto Porte',
    category: 'Joinery',
    contactPerson: 'Stefano Bertolotto',
    phone: '+39 0131 838 011',
    email: 's.bertolotto@bertolottoportе.it',
    address: 'Viale Europa 83, Ovada, Alessandria',
    activeProjects: 1,
    totalOrders: 9,
    avgLeadTime: '10–14 weeks',
    creditTerms: 'Net 30',
    status: 'Active',
  },
  {
    id: 7,
    name: 'Cattaneo Illuminazione',
    category: 'Lighting',
    contactPerson: 'Paola Cattaneo',
    phone: '+39 031 460 555',
    email: 'trade@cattaneo.it',
    address: 'Via del Lavoro 12, Mariano Comense',
    activeProjects: 0,
    totalOrders: 6,
    avgLeadTime: '4–6 weeks',
    creditTerms: 'Net 30',
    status: 'Inactive',
  },
  {
    id: 8,
    name: 'Roccia Naturale',
    category: 'Masonry',
    contactPerson: 'Carlo Fontana',
    phone: '+39 02 4800 1234',
    email: 'c.fontana@roccia.it',
    address: 'Via Artigiani 7, Lissone, Monza',
    activeProjects: 2,
    totalOrders: 11,
    avgLeadTime: '5–8 weeks',
    creditTerms: 'Net 30',
    status: 'Active',
  },
]

export const SUPPLIER_RATES: Record<number, SupplierRate[]> = {
  1: [
    { id: 1, item: 'Varenna Kitchen System',       rate: '€ 12,500', unit: 'per linear metre', creditTerms: 'Net 30', leadTime: '10 weeks' },
    { id: 2, item: 'Poliform Wardrobe (Senzafine)', rate: '€ 8,200',  unit: 'per module',       creditTerms: 'Net 30', leadTime: '8 weeks'  },
    { id: 3, item: 'Custom Cabinet Unit',            rate: '€ 3,800',  unit: 'per unit',         creditTerms: 'Net 30', leadTime: '10 weeks' },
    { id: 4, item: 'Bed Frame (upholstered)',         rate: '€ 6,400',  unit: 'per piece',        creditTerms: 'Net 30', leadTime: '8 weeks'  },
  ],
  2: [
    { id: 1, item: 'Solid Oak Flooring (15mm)',      rate: '€ 185',    unit: 'per m²',           creditTerms: 'Net 15', leadTime: '4 weeks'  },
    { id: 2, item: 'Herringbone Oak (20mm)',          rate: '€ 240',    unit: 'per m²',           creditTerms: 'Net 15', leadTime: '5 weeks'  },
    { id: 3, item: 'Installation & Finish',           rate: '€ 45',     unit: 'per m²',           creditTerms: 'Due on completion', leadTime: '1 week' },
  ],
  3: [
    { id: 1, item: '2097 Pendant (large)',           rate: '€ 3,200',  unit: 'per fixture',      creditTerms: 'Net 30', leadTime: '6 weeks'  },
    { id: 2, item: 'IC Lights S2',                   rate: '€ 980',    unit: 'per fixture',      creditTerms: 'Net 30', leadTime: '4 weeks'  },
    { id: 3, item: 'Architectural LED Strips',        rate: '€ 220',    unit: 'per running metre',creditTerms: 'Net 30', leadTime: '3 weeks'  },
  ],
}

export const SUPPLIER_ORDERS: Record<number, SupplierOrder[]> = {
  1: [
    { id: 1, date: 'Jul 14, 2025', project: 'Marchetti Residence', item: 'Varenna Kitchen',         quantity: '6 LM',  deliveryStatus: 'Pending',   paymentStatus: 'Partial', amount: '€ 75,000' },
    { id: 2, date: 'May 20, 2025', project: 'Ferretti Villa',       item: 'Senzafine Wardrobe ×3',  quantity: '3 units', deliveryStatus: 'Delivered', paymentStatus: 'Paid',    amount: '€ 24,600' },
    { id: 3, date: 'Apr 3, 2025',  project: 'Bianchi Penthouse',    item: 'Custom Bed Frames ×2',   quantity: '2 units', deliveryStatus: 'Delivered', paymentStatus: 'Paid',    amount: '€ 12,800' },
    { id: 4, date: 'Jan 15, 2025', project: 'Romano Gallery',       item: 'Display Cabinet Units',  quantity: '4 units', deliveryStatus: 'Delivered', paymentStatus: 'Paid',    amount: '€ 15,200' },
    { id: 5, date: 'Nov 8, 2024',  project: 'Visconti Loft',        item: 'Poliform Wardrobe',      quantity: '2 units', deliveryStatus: 'Delayed',   paymentStatus: 'Unpaid',  amount: '€ 16,400' },
  ],
}

// ── Sub-vendor data ───────────────────────────────────────────────────────────
export const SUB_VENDORS: SubVendor[] = [
  {
    id: 101,
    name: 'Luca Benedetti',
    company: 'Benedetti Costruzioni',
    specialty: 'Masonry',
    phone: '+39 02 3344 5566',
    email: 'l.benedetti@benedetticostruzioni.it',
    address: 'Via Artigiani 12, Sesto S. Giovanni, Milan',
    availability: 'Busy',
    pastProjects: 8,
    paymentRecord: 'Excellent',
    notes: 'Highly reliable. Specialises in feature walls, marble installation, restoration. Preferred for high-spec residential.',
  },
  {
    id: 102,
    name: 'Fratelli Caruso',
    company: 'Caruso Impianti Srl',
    specialty: 'Plumbing',
    phone: '+39 02 5567 8899',
    email: 'info@carusoimpianti.it',
    address: 'Via dell\'Industria 34, Rozzano, Milan',
    availability: 'Available',
    pastProjects: 12,
    paymentRecord: 'Good',
  },
  {
    id: 103,
    name: 'Davide Rizzo',
    company: 'Rizzo Elettroimpianti',
    specialty: 'Electrical',
    phone: '+39 02 7788 0011',
    email: 'd.rizzo@rizzoelettro.it',
    address: 'Via Volta 8, Cinisello Balsamo, Milan',
    availability: 'Available',
    pastProjects: 15,
    paymentRecord: 'Excellent',
    notes: 'Certified for smart home systems. Works regularly with us on all Milan projects.',
  },
  {
    id: 104,
    name: 'Giuseppe Marini',
    company: 'Marini Intonaci',
    specialty: 'Plastering',
    phone: '+39 335 123 4567',
    email: 'g.marini@marinitessile.it',
    address: 'Via Torino 22, Segrate, Milan',
    availability: 'Available',
    pastProjects: 6,
    paymentRecord: 'Good',
    notes: 'Decorative plasterwork and Venetian lime finishes.',
  },
  {
    id: 105,
    name: 'Antonio Ferrara',
    company: 'Ferrara Falegnameria',
    specialty: 'Joinery',
    phone: '+39 02 4455 6677',
    email: 'a.ferrara@ferrarafale.it',
    address: 'Via Brembo 41, Bergamo',
    availability: 'Busy',
    pastProjects: 10,
    paymentRecord: 'Excellent',
  },
  {
    id: 106,
    name: 'Marco Testa',
    company: 'Testa Piastrelle',
    specialty: 'Tiling',
    phone: '+39 0131 998 877',
    email: 'm.testa@testapiastrelle.com',
    address: 'Corso Alessandria 14, Tortona, AL',
    availability: 'Unknown',
    pastProjects: 5,
    paymentRecord: 'Fair',
  },
  {
    id: 107,
    name: 'Roberto Conti',
    company: 'Conti Verniciature',
    specialty: 'Painting',
    phone: '+39 02 9966 3344',
    email: 'r.conti@contiverniciature.it',
    address: 'Via Lampedusa 6, Milan',
    availability: 'Available',
    pastProjects: 18,
    paymentRecord: 'Good',
  },
]

export const SUBVENDOR_HISTORY: Record<number, SubVendorHistory[]> = {
  101: [
    { id: 1, project: 'Marchetti Residence', startDate: 'Jun 2025', endDate: 'Sep 2025',  scope: 'Feature wall installation, marble flooring, kitchen splashback', status: 'In Progress' },
    { id: 2, project: 'Ferretti Villa',      startDate: 'Jan 2025', endDate: 'Mar 2025',  scope: 'Travertine feature wall, terrace paving', status: 'Completed' },
    { id: 3, project: 'Bianchi Penthouse',   startDate: 'Aug 2024', endDate: 'Nov 2024',  scope: 'Marble kitchen island, bathroom tiling', status: 'Completed' },
    { id: 4, project: 'Visconti Loft',       startDate: 'Mar 2024', endDate: 'Jun 2024',  scope: 'Exposed brick wall restoration', status: 'Completed' },
  ],
  103: [
    { id: 1, project: 'Romano Gallery',      startDate: 'May 2025', endDate: 'Aug 2025',  scope: 'Full smart lighting system, distribution board', status: 'In Progress' },
    { id: 2, project: 'Marchetti Residence', startDate: 'Mar 2025', endDate: 'Jul 2025',  scope: 'Smart home wiring, underfloor heating controls', status: 'In Progress' },
    { id: 3, project: 'Ferretti Villa',      startDate: 'Oct 2024', endDate: 'Jan 2025',  scope: 'Full electrical installation, outdoor lighting', status: 'Completed' },
  ],
}

export const SUBVENDOR_PAYMENTS: Record<number, SubVendorPayment[]> = {
  101: [
    { id: 1, project: 'Marchetti Residence', amount: '€ 28,000', date: 'Jul 2025', status: 'Partial' },
    { id: 2, project: 'Ferretti Villa',      amount: '€ 14,500', date: 'Apr 2025', status: 'Paid' },
    { id: 3, project: 'Bianchi Penthouse',   amount: '€ 19,200', date: 'Dec 2024', status: 'Paid' },
    { id: 4, project: 'Visconti Loft',       amount: '€ 8,400',  date: 'Jul 2024', status: 'Paid' },
  ],
  103: [
    { id: 1, project: 'Romano Gallery',      amount: '€ 22,500', date: 'Jun 2025', status: 'Partial' },
    { id: 2, project: 'Marchetti Residence', amount: '€ 31,000', date: 'May 2025', status: 'Partial' },
    { id: 3, project: 'Ferretti Villa',      amount: '€ 18,800', date: 'Jan 2025', status: 'Paid' },
  ],
}

// ── Category/specialty color palette ─────────────────────────────────────────
export const CATEGORY_CFG: Record<string, { color: string; bg: string }> = {
  Furniture:   { color: '#1B2A4A', bg: 'rgba(27,42,74,0.10)'    },
  Flooring:    { color: '#0E7C86', bg: 'rgba(14,124,134,0.10)'  },
  Lighting:    { color: '#F5A623', bg: 'rgba(245,166,35,0.10)'  },
  Fabrics:     { color: '#9B59B6', bg: 'rgba(155,89,182,0.10)'  },
  Masonry:     { color: '#7F5539', bg: 'rgba(127,85,57,0.10)'   },
  Electrical:  { color: '#F26D6D', bg: 'rgba(242,109,109,0.10)' },
  Plumbing:    { color: '#3FA66B', bg: 'rgba(63,166,107,0.10)'  },
  Tiles:       { color: '#2C7BB6', bg: 'rgba(44,123,182,0.10)'  },
  Joinery:     { color: '#6B7280', bg: 'rgba(107,114,128,0.10)' },
  Ironmongery: { color: '#374151', bg: 'rgba(55,65,81,0.10)'    },
  Plastering:  { color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)'  },
  Painting:    { color: '#059669', bg: 'rgba(5,150,105,0.10)'   },
  HVAC:        { color: '#0284C7', bg: 'rgba(2,132,199,0.10)'   },
}

export const AVAILABILITY_CFG: Record<AvailabilityStatus, { color: string; label: string }> = {
  Available: { color: '#3FA66B', label: 'Available' },
  Busy:      { color: '#F26D6D', label: 'Busy'      },
  Unknown:   { color: '#9CA3AF', label: 'Unknown'   },
}

export const PAYMENT_STATUS_CFG: Record<PaymentStatus, { color: string; bg: string }> = {
  Paid:    { color: '#3FA66B', bg: 'rgba(63,166,107,0.10)'   },
  Partial: { color: '#1B2A4A', bg: 'rgba(27,42,74,0.09)'    },
  Unpaid:  { color: '#F26D6D', bg: 'rgba(242,109,109,0.10)' },
}

export const DELIVERY_STATUS_CFG: Record<DeliveryStatus, { color: string; bg: string }> = {
  Delivered: { color: '#3FA66B', bg: 'rgba(63,166,107,0.10)'   },
  Pending:   { color: '#1B2A4A', bg: 'rgba(27,42,74,0.09)'    },
  Delayed:   { color: '#F26D6D', bg: 'rgba(242,109,109,0.10)' },
}
