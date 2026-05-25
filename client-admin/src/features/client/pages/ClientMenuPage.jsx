import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getRestaurants } from '../../../shared/apis/restaurants.js';
import { getMenus } from '../../../shared/apis/menus.js';
import { UtensilsIcon, SearchIcon, BuildingIcon } from '../../../shared/components/ui/Icons.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />
);

const fmtMoney = (n) =>
  typeof n === 'number' ? `$${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })}` : '—';

const CATEGORY_LABEL = {
  ENTRADA: 'Entrada',
  PLATO_FUERTE: 'Plato fuerte',
  POSTRE: 'Postre',
  BEBIDA: 'Bebida',
  DESAYUNO: 'Desayuno',
  COMBO: 'Combo',
};

const BADGE = {
  ENTRADA: 'bg-green-400/10 text-green-400',
  PLATO_FUERTE: 'bg-fp-gold-dim text-fp-gold',
  POSTRE: 'bg-pink-400/10 text-pink-400',
  BEBIDA: 'bg-blue-400/10 text-blue-400',
  DESAYUNO: 'bg-orange-400/10 text-orange-400',
  COMBO: 'bg-purple-400/10 text-purple-400',
};

// ── Menu card ─────────────────────────────────────────────────────────────────
const MenuCard = ({ item }) => (
  <div className='bg-fp-surface border border-fp-border rounded-xl overflow-hidden hover:border-fp-gold/30 transition-colors flex flex-col'>
    {item.image && (
      <div className='h-40 w-full overflow-hidden bg-fp-elevated flex-shrink-0'>
        <img src={item.image} alt={item.name} className='w-full h-full object-cover' />
      </div>
    )}
    <div className='p-4 flex flex-col flex-1'>
      <div className='flex items-start justify-between gap-3 mb-2'>
        <div className='flex-1 min-w-0'>
          <h4 className='text-fp-text text-sm font-medium truncate'>{item.name}</h4>
          {item.description && (
            <p className='text-fp-subtle text-xs mt-0.5 line-clamp-2'>{item.description}</p>
          )}
        </div>
        <span
          className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${BADGE[item.category] ?? 'bg-fp-elevated text-fp-muted'}`}
        >
          {CATEGORY_LABEL[item.category] ?? item.category}
        </span>
      </div>
      <div className='flex items-center justify-between mt-auto pt-2'>
        <span className='text-fp-gold font-semibold text-base'>{fmtMoney(item.price)}</span>
        <div className='flex gap-1 flex-wrap justify-end'>
          {item.isVegetarian && (
            <span className='text-xs bg-green-400/10 text-green-400 px-1.5 py-0.5 rounded'>
              Veg
            </span>
          )}
          {item.isVegan && (
            <span className='text-xs bg-green-400/10 text-green-500 px-1.5 py-0.5 rounded'>
              Vegano
            </span>
          )}
          {item.isGlutenFree && (
            <span className='text-xs bg-yellow-400/10 text-yellow-400 px-1.5 py-0.5 rounded'>
              Sin gluten
            </span>
          )}
        </div>
      </div>
      {item.preparationTime && (
        <p className='text-fp-subtle text-xs mt-1.5'>⏱ {item.preparationTime} min</p>
      )}
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const CATEGORIES = ['all', 'ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA', 'DESAYUNO', 'COMBO'];

export const ClientMenuPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestId, setSelectedRestId] = useState('');
  const [menus, setMenus] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loadingRest, setLoadingRest] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(false);

  // Load restaurants
  useEffect(() => {
    getRestaurants({ isActive: true, limit: 100 })
      .then((r) => setRestaurants(r.data?.data ?? []))
      .catch(() => toast.error('Error al cargar restaurantes'))
      .finally(() => setLoadingRest(false));
  }, []);

  // Load menu when restaurant changes
  const loadMenu = useCallback(async () => {
    if (!selectedRestId) {
      setMenus([]);
      return;
    }
    setLoadingMenu(true);
    try {
      const r = await getMenus({ restaurant: selectedRestId, isAvailable: true, limit: 200 });
      setMenus(r.data?.data ?? []);
    } catch {
      toast.error('Error al cargar el menú');
    } finally {
      setLoadingMenu(false);
    }
  }, [selectedRestId]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  // Filter client-side
  const filtered = menus.filter((m) => {
    const matchCat = category === 'all' || m.category === category;
    const matchName = !search || m.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchName;
  });

  return (
    <div className='space-y-6 animate-fadeUp'>
      <div>
        <h1 className='font-display text-2xl text-fp-text'>Menú</h1>
        <p className='text-fp-muted text-sm mt-0.5'>Explora los platos disponibles</p>
      </div>

      {/* Restaurant picker */}
      <div className='bg-fp-surface border border-fp-border rounded-xl p-4'>
        <label className='block text-fp-subtle text-xs mb-2 uppercase tracking-wide'>
          Restaurante
        </label>
        {loadingRest ? (
          <Skeleton className='h-10 w-full' />
        ) : (
          <select
            value={selectedRestId}
            onChange={(e) => {
              setSelectedRestId(e.target.value);
              setSearch('');
              setCategory('all');
            }}
            className='w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm focus:outline-none focus:border-fp-gold/50 transition-colors'
          >
            <option value=''>Selecciona un restaurante…</option>
            {restaurants.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name} — {r.category}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedRestId && (
        <>
          {/* Search + filter row */}
          <div className='flex flex-col sm:flex-row gap-3'>
            <div className='relative flex-1'>
              <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fp-subtle' />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Buscar plato…'
                className='w-full pl-9 pr-3 py-2 bg-fp-surface border border-fp-border rounded-lg text-fp-text text-sm placeholder-fp-subtle focus:outline-none focus:border-fp-gold/50 transition-colors'
              />
            </div>
            <div className='flex gap-1 bg-fp-elevated p-1 rounded-lg overflow-x-auto flex-shrink-0'>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    category === c
                      ? 'bg-fp-surface text-fp-text shadow-sm'
                      : 'text-fp-muted hover:text-fp-text'
                  }`}
                >
                  {c === 'all' ? 'Todos' : CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </div>

          {/* Menu grid */}
          {loadingMenu ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className='h-32 w-full' />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <UtensilsIcon className='w-10 h-10 text-fp-muted mb-3' />
              <p className='text-fp-text font-medium'>Sin platos disponibles</p>
              <p className='text-fp-subtle text-sm mt-1'>
                {search || category !== 'all'
                  ? 'Intenta otro filtro'
                  : 'Este restaurante no tiene menú disponible'}
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {filtered.map((m) => (
                <MenuCard key={m._id} item={m} />
              ))}
            </div>
          )}

          <p className='text-fp-subtle text-xs text-right'>
            {filtered.length} plato{filtered.length !== 1 ? 's' : ''} mostrado
            {filtered.length !== 1 ? 's' : ''}
          </p>
        </>
      )}

      {!selectedRestId && !loadingRest && (
        <div className='flex flex-col items-center justify-center py-20 text-center'>
          <div className='p-4 rounded-xl bg-fp-gold-dim mb-4'>
            <BuildingIcon className='w-8 h-8 text-fp-gold' />
          </div>
          <p className='text-fp-text font-medium text-lg'>Selecciona un restaurante</p>
          <p className='text-fp-subtle text-sm mt-2 max-w-xs'>
            Elige un restaurante arriba para ver su menú completo.
          </p>
        </div>
      )}
    </div>
  );
};
