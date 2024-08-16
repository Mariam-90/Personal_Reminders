import React from 'react';

function NavBar({ onNavClick, activeView }) {
  return (
    <nav className="navbar">
      <ul>
        <li className={activeView === 'add' ? 'active' : ''} onClick={() => onNavClick('add')}>הוספת תזכורת</li>
        <li className={activeView === 'view' ? 'active' : ''} onClick={() => onNavClick('view')}>הצג תזכורות</li>
        <li className={activeView === 'status' ? 'active' : ''} onClick={() => onNavClick('status')}>סטָטוּס</li>
        <li className={activeView === 'completed' ? 'active' : ''} onClick={() => onNavClick('completed')}>משימות שהושלמו</li>
        <li className={activeView === 'logout' ? 'active' : ''} onClick={() => onNavClick('logout')}>התנתק</li>
      </ul>
    </nav>
  );
}

export default NavBar;
