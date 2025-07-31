import React from 'react';

// Tipagem para as props do NavLink
interface NavLinkProps {
  icon: React.ReactNode;
  text: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, text, isActive = false, onClick }) => (
  <li>
    <a
      href="#"
      onClick={onClick}
      className={`flex items-center space-x-3 p-3 rounded-lg ${
        isActive
          ? 'text-slate-700 bg-blue-50 border-r-4 border-blue-600 font-bold'
          : 'text-slate-600 hover:bg-slate-200'
      }`}
    >
      {icon}
      <span>{text}</span>
    </a>
  </li>
);

// Tipagem para as props do Sidebar
interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <aside
        className={`bg-white w-64 fixed inset-y-0 left-0 z-30 p-4 flex flex-col space-y-4 shadow-lg transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-200">
          <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Finanças</h1>
        </div>

        <nav className="flex-grow">
          <ul className="space-y-2">
            <NavLink 
              text="Dashboard" 
              isActive={true} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M2 7h20M2 17h20"/></svg>} 
              onClick={() => { /* Ação do link aqui */ }}
            />
            {/* Outros links podem ser adicionados aqui */}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;