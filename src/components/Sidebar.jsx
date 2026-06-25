import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const styles = `
  :root {
    --nav-height: 64px;
    --bg: #0F0F11;
    --surface: #1A1A1F;
    --border: #2A2A2F;
    --ink: #F4F4F5;
    --ink-muted: #A1A1AA;
    --accent: #7C3AED;
    --accent-hover: #6D28D9;
    --accent-light: #A855F7;
    --transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ── Navbar ── */
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--nav-height);
    background: #111114;
    backdrop-filter: blur(18px) saturate(1.6);
    -webkit-backdrop-filter: blur(18px) saturate(1.6);
    display: flex;
    align-items: center;
    padding: 0 32px;
    font-family: 'Inter', sans-serif;
    z-index: 1000;
    border-bottom: 1px solid #2A2A2F;
    box-shadow: 0 1px 24px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3);
    box-sizing: border-box;
  }

  /* ── Brand ── */
  .navbar-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    flex-shrink: 0;
    margin-right: 40px;
    cursor: pointer;
  }

  .navbar-brand img {
    height: 38px;
    width: auto;
    object-fit: contain;
  }

  .brand-text {
    font-family: 'Inter', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
    line-height: 1;
    text-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
  }

  /* ── Nav Links ── */
  .navbar-nav {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    min-width: 0;
    justify-content: center;
  }

  .navbar-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 8px;
    text-decoration: none;
    color: #A1A1AA;
    font-size: 0.85rem;
    font-weight: 400;
    letter-spacing: 0.01em;
    transition: color var(--transition), background var(--transition), transform var(--transition);
    position: relative;
    white-space: nowrap;
  }

  .navbar-link:hover {
    color: #F4F4F5;
    background: rgba(124, 58, 237, 0.08);
    transform: translateY(-1px);
  }

  .navbar-link:hover::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 20%;
    right: 20%;
    height: 2px;
    border-radius: 2px 2px 0 0;
    background: #A855F7;
  }

  .navbar-link.active {
    color: #fff;
    background: #7C3AED;
    border-radius: 20px;
  }

  .navbar-link.active .nav-icon {
    color: #fff;
  }

  /* Remove the bottom bar on active (using pill shape instead) */
  .navbar-link.active::after {
    display: none;
  }

  @keyframes slideIn {
    from { transform: scaleX(0); opacity: 0; }
    to   { transform: scaleX(1); opacity: 1; }
  }

  .nav-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    opacity: 0.75;
    transition: color var(--transition), opacity var(--transition);
  }

  .navbar-link:hover .nav-icon { opacity: 1; }

  /* ── Left brand group ── */
  .navbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }

  /* ── Right section ── */
  .navbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .btn-logout {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid #2A2A2F;
    color: #A1A1AA;
    padding: 6px 14px;
    border-radius: 6px;
    font-family: 'Inter', sans-serif;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all var(--transition);
  }

  .btn-logout:hover {
    background: rgba(239, 68, 68, 0.08);
    color: #EF4444;
    border-color: rgba(239, 68, 68, 0.3);
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .navbar {
      padding: 0 16px;
    }
    .navbar-brand {
      margin-right: 16px;
      gap: 6px;
    }
    .navbar-brand img {
      height: 28px;
    }
    .brand-text {
      font-size: 1.2rem;
    }
    .navbar-link {
      padding: 8px 10px;
      font-size: 0;
      gap: 0;
    }
    .navbar-link .nav-icon {
      width: 18px;
      height: 18px;
    }
    .btn-logout span {
      display: none;
    }
  }
`;

const navItems = [
  {
    to: "/home",
    label: "Dashboard",
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: "/profile",
    label: "Profile",
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    to: "/messages",
    label: "Messages",
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    to: "/following",
    label: "Following",
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    to: "/followers",
    label: "Followers",
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
  to: "/project-hub",
  label: "Project Hub",
  icon: (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
}
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const ensureProfileExists = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      
      if (user) {
        // Check if profile exists
        const { error } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        // If not found, insert one using Google Auth metadata
        if (error && error.code === 'PGRST116') {
          await supabase.from("profiles").insert([{
            id: user.id,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "User",
            email: user.email
          }]);
        }
      }
    };

    ensureProfileExists();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <>
      <style>{styles}</style>
      <nav className="navbar">
        {/* Left: Brand */}
        <div className="navbar-left">
          <Link to="/home" className="navbar-brand">
            <img src={process.env.PUBLIC_URL + "/assests/logo-light.png"} alt="Brain Logo" />
            <span className="brand-text">Connect</span>
          </Link>
        </div>

        {/* Center: Nav Links */}
        <div className="navbar-nav">
          {navItems.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`navbar-link${location.pathname === to ? " active" : ""}`}
            >
              {icon}
              {label}
            </Link>
          ))}
        </div>

        {/* Right: Logout */}
        <div className="navbar-right">
          <button onClick={handleLogout} className="btn-logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width: '14px', height: '14px'}}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}