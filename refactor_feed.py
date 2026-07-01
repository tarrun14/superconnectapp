import re

with open('src/components/Feed.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useRef
content = content.replace('import { useEffect, useState } from "react";', 'import { useEffect, useState, useRef } from "react";')

# State vars
state_add = '''
  const PAGE_SIZE = 15;
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);

  // Auto trigger pagination when sentinel intersects
  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage(p => p + 1);
      }
    });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    setPosts([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, feedType, currentUser, search, category, topic, sort, globalMode]);

  useEffect(() => {
    fetchPosts(page === 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, refresh, feedType, currentUser, search, category, topic, sort, globalMode]);
'''

content = re.sub(
    r'useEffect\(\(\) => \{\s*fetchPosts\(\);\s*// eslint-disable-next-line react-hooks/exhaustive-deps\s*\}, \[refresh, feedType, currentUser, search, category, topic, sort, globalMode\]\);',
    state_add,
    content
)

# Modify fetchPosts signature
content = content.replace('const fetchPosts = async () => {', 'const fetchPosts = async (isInitial = true) => {')
content = content.replace('await _fetchPostsInner();', 'await _fetchPostsInner(isInitial);')
content = content.replace('setLoading(true);', 'if (isInitial) setLoading(true);')
content = content.replace('setLoading(false);', 'if (isInitial) setLoading(false);')

content = content.replace('const _fetchPostsInner = async () => {', 'const _fetchPostsInner = async (isInitial) => {')

# Find instances of postQuery and add pagination
content = content.replace('.order("created_at", { ascending: false });', '.order("created_at", { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);')

# Now handle the merging for feedType === 'All'
# Around line 146
# let combined = [...posts, ...mergedProjects].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
# setPosts(combined);
def repl_all_posts(m):
    return """
        if (postData.length < PAGE_SIZE) setHasMore(false);
        else setHasMore(true);

        let combined = posts;
        if (isInitial) {
          // fetch projects only on page 0
""" + m.group(0)

# Replace the fetching of projects with isInitial wrapper
content = re.sub(r'// fetch projects \(source 2\).*?const mergedProjects = Array\.from\(allProjectsMap\.values\(\)\);', 
lambda m: f'let mergedProjects = [];\nif (isInitial) {{\n{m.group(0)}\n}}', content, flags=re.DOTALL)

content = content.replace('let combined = [...posts, ...mergedProjects].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));',
'let combined = isInitial ? [...posts, ...mergedProjects].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : posts;')

content = content.replace('setPosts(combined);', 'setPosts(prev => isInitial ? combined : [...prev, ...combined]);')

# Posts Tab
content = re.sub(r'// --- POSTS TAB ---.*?setPosts\(result\);', 
lambda m: m.group(0).replace('setPosts(result);', 'if (postData.length < PAGE_SIZE) setHasMore(false); else setHasMore(true); setPosts(prev => isInitial ? result : [...prev, ...result]);'), 
content, flags=re.DOTALL)

# Projects Tab
content = re.sub(r'// --- PROJECTS TAB ---.*?setPosts\(combined\);', 
lambda m: m.group(0).replace('setPosts(combined);', 'if (isInitial) setPosts(combined); setHasMore(false);'), 
content, flags=re.DOTALL)


# Sentinel div
content = content.replace('</div>\n      )}', '</div>\n          {hasMore && <div ref={sentinelRef} style={{ height: "40px" }} />}\n      )}')


with open('src/components/Feed.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
