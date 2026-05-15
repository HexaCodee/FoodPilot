import { BuildingIcon, CalendarIcon, BagIcon, StarIcon, MapPinIcon } from '../../../shared/components/ui/Icons.jsx';

const RestaurantCard = ({ name, category, rating, location }) => (
  <div className="bg-fp-surface border border-fp-border rounded-xl p-4 hover:border-fp-gold/30 transition-colors cursor-pointer group">
    <div className="flex items-start justify-between mb-2">
      <div>
        <h4 className="text-fp-text text-sm font-medium group-hover:text-fp-gold transition-colors">{name}</h4>
        <span className="text-fp-subtle text-xs">{category}</span>
      </div>
      <div className="flex items-center gap-1">
        <StarIcon className="w-3.5 h-3.5 text-fp-gold fill-fp-gold" />
        <span className="text-fp-gold text-xs font-medium">{rating}</span>
      </div>
    </div>
    <div className="flex items-center gap-1 mt-2">
      <MapPinIcon className="w-3 h-3 text-fp-subtle" />
      <span className="text-fp-subtle text-xs">{location}</span>
    </div>
  </div>
);

export const ClientDashboard = () => (
  <div className="space-y-6 animate-fadeUp">
    <div>
      <h1 className="font-display text-2xl text-fp-text">Explorar Restaurantes</h1>
      <p className="text-fp-muted text-sm mt-0.5">Descubre los mejores restaurantes de la plataforma</p>
    </div>

    {/* Stats personales */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { Icon: CalendarIcon, label: 'Mis reservaciones', value: '—' },
        { Icon: BagIcon,      label: 'Mis pedidos',       value: '—' },
        { Icon: StarIcon,     label: 'Reseñas escritas',  value: '—' },
      ].map(({ Icon, label, value }) => (
        <div key={label} className="bg-fp-surface border border-fp-border rounded-xl p-5 hover:border-fp-gold/20 transition-colors">
          <div className="p-2.5 rounded-lg bg-fp-gold-dim w-fit mb-3">
            <Icon className="w-4.5 h-4.5 text-fp-gold" />
          </div>
          <p className="text-fp-muted text-xs uppercase tracking-wide mb-1">{label}</p>
          <p className="text-fp-text text-xl font-semibold">{value}</p>
        </div>
      ))}
    </div>

    {/* Restaurantes destacados */}
    <div className="bg-fp-surface border border-fp-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-fp-text font-medium text-sm">Restaurantes destacados</h3>
        <BuildingIcon className="w-4 h-4 text-fp-subtle" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <RestaurantCard name="La Maison Dorée"   category="FORMAL"    rating="4.8" location="Zona Viva, Guatemala" />
        <RestaurantCard name="Bistró del Puerto" category="FORMAL"    rating="4.6" location="Puerto Barrios" />
        <RestaurantCard name="Café Central"      category="CAFETERIA" rating="4.3" location="Centro Histórico" />
      </div>
      <p className="text-fp-subtle text-xs text-center mt-4">
        Los restaurantes se cargarán desde el servicio cuando esté integrado.
      </p>
    </div>
  </div>
);
