import React from 'react';

function NavBar({ onNavClick, activeView }) {
  return (
    <nav className="navbar">
      <ul>
        <li className={activeView === 'add' ? 'active' : ''} onClick={() => onNavClick('add')}>Add Reminder</li>
        <li className={activeView === 'view' ? 'active' : ''} onClick={() => onNavClick('view')}>View Reminders</li>
        <li className={activeView === 'status' ? 'active' : ''} onClick={() => onNavClick('status')}>Status</li>
        <li className={activeView === 'completed' ? 'active' : ''} onClick={() => onNavClick('completed')}>Completed Tasks</li>
        <li className={activeView === 'logout' ? 'active' : ''} onClick={() => onNavClick('logout')}>Logout</li>
      </ul>
    </nav>
  );
}

export default NavBar;
