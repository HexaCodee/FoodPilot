import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore';
import imgLogo from '../../../assets/img/avatarDefault.png';

export const Navbar = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className='bg-white shadow-md px-4 py-2 flex items-center justify-between sticky top-0 z-50'>
      <div className='flex items-center gap-3'>
        <img src={imgLogo} alt='Logo' className='h-10 w-10 rounded-full object-cover' />
        <span className='font-bold text-xl text-main-blue'>FoodPilot</span>
      </div>
      <div className='hidden md:flex gap-6 items-center'>
        <Link to='/home' className='hover:text-main-blue font-medium transition-colors'>
          Inicio
        </Link>
        <Link to='/restaurants' className='hover:text-main-blue font-medium transition-colors'>
          Restaurantes
        </Link>
        <Link to='/tables' className='hover:text-main-blue font-medium transition-colors'>
          Mesas
        </Link>
        <Link to='/menus' className='hover:text-main-blue font-medium transition-colors'>
          Menús
        </Link>
        <Link to='/orders' className='hover:text-main-blue font-medium transition-colors'>
          Pedidos
        </Link>
        <Link to='/events' className='hover:text-main-blue font-medium transition-colors'>
          Eventos
        </Link>
        <Link to='/reports' className='hover:text-main-blue font-medium transition-colors'>
          Reportes
        </Link>
      </div>
      <div className='flex items-center gap-4'>
        {user && (
          <span className='text-gray-700 font-semibold max-w-[120px] truncate'>{user.name}</span>
        )}
        <button
          onClick={handleLogout}
          className='bg-main-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium'
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
};
