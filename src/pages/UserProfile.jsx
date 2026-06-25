import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
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

  /* ── User Profile Area ── */
  .profile-info-section {
    margin-bottom: 48px;
  }
  .profile-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 28px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 24px;
  }
  .profile-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .profile-details {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .profile-details h3 {
    font-family: 'Inter', sans-serif;
    font-size: 1.5rem;
    color: var(--ink);
    margin-bottom: 2px;
  }
  .profile-email {
    font-size: 0.95rem;
    color: var(--ink-muted);
  }
  .profile-meta {
    font-size: 0.9rem;
    color: var(--ink-muted);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .project-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 12px;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }

  .project-card:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
  }

  .project-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--ink);
    cursor: pointer;
    margin-bottom: 6px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .project-title:hover {
    color: var(--accent);
  }

  .project-desc {
    font-size: 0.9rem;
    color: var(--ink-muted);
    margin-bottom: 16px;
    line-height: 1.5;
  }

  .btn-follow {
    background: transparent;
    border: 1.5px solid var(--accent);
    color: var(--accent);
    padding: 6px 14px;
    border-radius: 6px;
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-follow:hover {
    background: var(--accent);
    color: #fff;
  }

  .btn-follow.active {
    background: var(--accent);
    color: #fff;
  }

  .empty-msg {
    color: var(--ink-muted);
    font-size: 0.9rem;
    font-style: italic;
  }
`;

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const init = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

    setCurrentUser(user);

    fetchUser();
    await fetchProjects();
    setLoading(false);
    } catch(err) {
      console.error(err);
      setLoading(false);
    }
  };

  // 🔥 fetch user
  const fetchUser = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    setUserProfile(data);
  };

  // 🔥 fetch projects
  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    setProjects(data || []);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="page-root">
        <div className="page-inner">
          <div className="page-header">
            <h2>{userProfile?.name || "User Profile"}</h2>
            <div className="dot" />
          </div>

          {!loading && userProfile && (
            <div className="profile-info-section">
              <div className="profile-card">
                 <div className="profile-avatar" style={{ overflow: 'hidden' }}>
                   {userProfile?.avatar_url ? (
                     <img src={userProfile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   ) : (
                     userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : "U"
                   )}
                 </div>
                 <div className="profile-details">
                   <h3>{userProfile?.name || "User"}</h3>
                   {userProfile?.email && <p className="profile-email">{userProfile.email}</p>}
                   {userProfile?.occupation && <p className="profile-meta">💼 {userProfile.occupation}</p>}
                   {userProfile?.age && <p className="profile-meta">🎂 {userProfile.age} years old</p>}
                 </div>
              </div>
            </div>
          )}

          <div className="section-label">Projects</div>

          {loading ? (
             <SkeletonLoader type="page" />
          ) : projects.length === 0 ? (
            <p className="empty-msg">No projects yet</p>
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                currentUser={currentUser}
                navigate={navigate}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

// 🔥 Separate component for each project
function ProjectCard({ project, currentUser, navigate }) {
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (currentUser) checkFollow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const checkFollow = async () => {
    const { data } = await supabase
      .from("project_followers")
      .select("*")
      .eq("user_id", currentUser.id)
      .eq("project_id", project.id);

    setFollowing(data?.length > 0);
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    if (following) {
      await supabase
        .from("project_followers")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("project_id", project.id);

      setFollowing(false);
    } else {
      await supabase.from("project_followers").insert([
        {
          user_id: currentUser.id,
          project_id: project.id,
        },
      ]);

      setFollowing(true);
    }
  };

  return (
    <div className="project-card">
      <div
        className="project-title"
        onClick={() => navigate(`/project/${project.id}`)}
      >
        🚀 {project.title}
      </div>

      <p className="project-desc">{project.description}</p>

      {project.user_id !== currentUser?.id && (
        <button
          className={`btn-follow ${following ? "active" : ""}`}
          onClick={handleFollow}
        >
          {following ? "Unfollow" : "Follow Project"}
        </button>
      )}
    </div>
  );
}