import re

with open('src/pages/ProjectPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# State vars
state_add = '''  const [posts, setPosts] = useState([]);
  const PAGE_SIZE = 15;
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const sentinelRef = useRef(null);

  // Auto trigger pagination when sentinel intersects
  useEffect(() => {
    if (!hasMore || isLoadingPosts) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage(p => p + 1);
      }
    });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingPosts]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    // posts fetched below
  }, [id]);

  useEffect(() => {
    if (id) fetchPosts(page === 0);
  }, [page, id]);
'''

content = content.replace('const [posts, setPosts] = useState([]);', state_add)

# In init() we have:
# await fetchPosts();
# We should remove it or keep it? If we keep it, it fetches page 0. But useEffect handles it.
content = content.replace('await fetchPosts();', '')

# Modify fetchPosts signature
fetch_posts_old = '''  const fetchPosts = async () => {
    try {
      // Try fetching from posts table with project_id
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(name, avatar_url, username)")
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Parse content if JSON-encoded
        const formatted = (data || []).map((p) => {
          if (p.content && p.content.startsWith("{") && p.content.includes('"text"')) {
            try {
              const parsed = JSON.parse(p.content);
              return { ...p, content: parsed.text || "" };
            } catch (e) {}
          }
          return p;
        });
        setPosts(formatted);
      } else {
        // Fallback to project_messages (legacy)
        const { data: msgs } = await supabase
          .from("project_messages")
          .select("*, profiles(name, avatar_url, username)")
          .eq("project_id", id)
          .order("created_at", { ascending: false });
        // Map project_messages to a post-like shape (no real post ID for navigation)
        setPosts((msgs || []).map(m => ({
          ...m,
          content: m.message,
          _isLegacyMsg: true,
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };'''

fetch_posts_new = '''  const fetchPosts = async (isInitial = true) => {
    setIsLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(name, avatar_url, username)")
        .eq("project_id", id)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (!error && data) {
        if (data.length < PAGE_SIZE) setHasMore(false);
        else setHasMore(true);

        const formatted = (data || []).map((p) => {
          if (p.content && p.content.startsWith("{") && p.content.includes('"text"')) {
            try {
              const parsed = JSON.parse(p.content);
              return { ...p, content: parsed.text || "" };
            } catch (e) {}
          }
          return p;
        });
        setPosts(prev => isInitial ? formatted : [...prev, ...formatted]);
      } else {
        const { data: msgs } = await supabase
          .from("project_messages")
          .select("*, profiles(name, avatar_url, username)")
          .eq("project_id", id)
          .order("created_at", { ascending: false })
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
          
        if (msgs && msgs.length < PAGE_SIZE) setHasMore(false);
        else setHasMore(true);

        const formattedMsgs = (msgs || []).map(m => ({
          ...m,
          content: m.message,
          _isLegacyMsg: true,
        }));
        setPosts(prev => isInitial ? formattedMsgs : [...prev, ...formattedMsgs]);
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoadingPosts(false);
  };'''

content = content.replace(fetch_posts_old, fetch_posts_new)

# Sentinel div
content = content.replace('</div>\n                ))}\n              </div>\n            )}\n          </div>', '</div>\n                ))}\n              </div>\n            )}\n            {hasMore && <div ref={sentinelRef} style={{ height: "40px" }} />}\n          </div>')


with open('src/pages/ProjectPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
