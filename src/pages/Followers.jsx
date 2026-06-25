import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import SkeletonLoader from "../components/SkeletonLoader";

const styles = `
  :root {
    --bg: #0F0F11;
    --surface: #1A1A1F;
    --border: #2A2A2F;
    --ink: #F4F4F5;
    --ink-muted: #A1A1AA;
    --accent: #7C3AED;
  }

  .page-root {
    min-height: 100vh;
    background: var(--bg);
    font-family: 'Inter', sans-serif;
    color: var(--ink);
    padding: 80px 24px 80px;
  }

  .page-inner {
    max-width: 1000px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
  }

  .page-header h2 {
    font-family: 'Inter', sans-serif;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;
    color: var(--ink);
  }

  .page-header .dot {
    display: none;
  }

  .section-label {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin: 32px 0 16px;
  }

  .list-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.05rem;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
  }

  .list-card:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
  }

  .empty-msg {
    color: var(--ink-muted);
    font-size: 0.9rem;
    font-style: italic;
  }
`;

export default function Followers() {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFollowers();
  }, []);

  const fetchFollowers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

    if (!user) return;

    const { data } = await supabase
      .from("follows")
      .select("*")
      .eq("following_id", user.id); // 🔥 IMPORTANT

    const ids = (data || []).map((f) => f.follower_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", ids);

    const merged = (data || []).map((f) => ({
      ...f,
      profiles: (profiles || []).find((p) => p.id === f.follower_id),
    }));

    setFollowers(merged);
    setLoading(false);
    } catch(err) {
      console.error("Session error:", err);
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="page-root">
        <div className="page-inner">
          <div className="page-header">
            <h2>Followers</h2>
            <div className="dot" />
          </div>

          <div className="section-label">Your Followers</div>

          {loading ? (
             <>
               <SkeletonLoader type="block" />
               <SkeletonLoader type="block" />
             </>
          ) : followers.length === 0 ? (
            <p className="empty-msg">No followers</p>
          ) : (
            followers.map((f, i) => (
              <div 
                key={i} 
                className="list-card"
                onClick={() => navigate(`/user/${f.follower_id}`)}
              >
                {f.profiles?.avatar_url ? (
                  <img src={f.profiles.avatar_url} alt="avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                    {f.profiles?.name ? f.profiles.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                {f.profiles?.name || "User"}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}