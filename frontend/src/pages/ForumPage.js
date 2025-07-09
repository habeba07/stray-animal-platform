import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../redux/api';

function ForumPage() {
  const { user } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentView, setCurrentView] = useState('categories'); // categories, topics, posts
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Categories are now automatically filtered by user type on the backend
      const response = await api.get('/forum-categories/');
      setCategories(response.data);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Forum categories error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (categoryId = null) => {
    try {
      setLoading(true);
      const url = categoryId ? `/forum-topics/?category=${categoryId}` : '/forum-topics/';
      const response = await api.get(url);
      setTopics(response.data);
      setSelectedCategory(categoryId);
      setCurrentView('topics');
    } catch (err) {
      setError('Failed to load topics');
      console.error('Forum topics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (topicId) => {
    try {
      setLoading(true);
      const response = await api.get(`/forum-posts/?topic=${topicId}`);
      setPosts(response.data);
      setSelectedTopic(topicId);
      setCurrentView('posts');
    } catch (err) {
      setError('Failed to load posts');
      console.error('Forum posts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTopic = async () => {
    if (!newTopicTitle.trim()) {
      setError('Please enter a topic title');
      return;
    }

    try {
      await api.post('/forum-topics/', {
        title: newTopicTitle,
        category: selectedCategory
      });
      setNewTopicTitle('');
      setShowNewTopicForm(false);
      fetchTopics(selectedCategory);
      setError('');
    } catch (err) {
      setError('Failed to create topic');
      console.error('Create topic error:', err);
    }
  };

  const createPost = async () => {
    if (!newPostContent.trim()) {
      setError('Please enter post content');
      return;
    }

    try {
      await api.post('/forum-posts/', {
        topic: selectedTopic,
        content: newPostContent
      });
      setNewPostContent('');
      setShowNewPostForm(false);
      fetchPosts(selectedTopic);
      setError('');
    } catch (err) {
      setError('Failed to create post');
      console.error('Create post error:', err);
    }
  };

  const likePost = async (postId) => {
    try {
      await api.post(`/forum-posts/${postId}/like/`);
      fetchPosts(selectedTopic);
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getUserTypeDisplayName = (userType) => {
    const names = {
      'SHELTER': 'Shelter Manager',
      'STAFF': 'Shelter Staff',
      'VOLUNTEER': 'Volunteer',
      'PUBLIC': 'Community Member',
      'AUTHORITY': 'Policy Maker'
    };
    return names[userType] || userType;
  };

  const getCategoryColor = (categoryName) => {
    const colors = {
      'Operational Coordination': '#1976d2',
      'Emergency Response': '#f44336',
      'Health & Veterinary': '#d32f2f',
      'Resource Management': '#9c27b0',
      'Staff Wellness & Support': '#00bcd4',
      'Volunteer Coordination': '#607d8b',
      'Policy & Advocacy': '#3f51b5',
      'Adoption Success Stories': '#4caf50',
      'Pet Care Basics': '#ff9800',
      'Training & Behavior': '#795548',
      'General Discussion': '#757575'
    };
    return colors[categoryName] || '#666666';
  };

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    title: {
      fontSize: '2.5rem',
      color: '#1976d2',
      margin: '0 0 10px 0',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '15px'
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#666',
      margin: '0 0 15px 0'
    },
    userBadge: {
      display: 'inline-block',
      backgroundColor: '#e3f2fd',
      color: '#1976d2',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: '500'
    },
    navigation: {
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'wrap'
    },
    navButton: {
      background: '#1976d2',
      color: 'white',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.3s ease'
    },
    navButtonSecondary: {
      background: '#e3f2fd',
      color: '#1976d2',
      border: '1px solid #1976d2'
    },
    filterInfo: {
      backgroundColor: '#e8f5e8',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #c8e6c8'
    },
    filterTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#2e7d32',
      marginBottom: '5px'
    },
    filterText: {
      fontSize: '0.9rem',
      color: '#37474f',
      lineHeight: '1.4'
    },
    categoriesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    categoryCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '25px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    categoryHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '15px'
    },
    categoryIcon: {
      fontSize: '2rem',
      marginRight: '15px',
      padding: '10px',
      borderRadius: '50%',
      backgroundColor: '#f5f5f5'
    },
    categoryTitle: {
      fontSize: '1.3rem',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '5px'
    },
    categoryDescription: {
      fontSize: '0.95rem',
      color: '#666',
      lineHeight: '1.5',
      marginBottom: '20px'
    },
    categoryStats: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '15px',
      marginBottom: '15px'
    },
    statItem: {
      textAlign: 'center',
      padding: '10px',
      backgroundColor: '#f8f9fa',
      borderRadius: '6px'
    },
    statValue: {
      fontSize: '1.2rem',
      fontWeight: '700',
      color: '#1976d2',
      marginBottom: '2px'
    },
    statLabel: {
      fontSize: '0.8rem',
      color: '#666',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    topicCard: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      margin: '10px 0',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'transform 0.2s'
    },
    topicHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'start'
    },
    topicTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '8px'
    },
    topicMeta: {
      fontSize: '0.9rem',
      color: '#666',
      marginBottom: '5px'
    },
    pinnedBadge: {
      backgroundColor: '#fff3e0',
      color: '#f57c00',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      marginLeft: '8px'
    },
    topicStats: {
      textAlign: 'right',
      color: '#666',
      fontSize: '0.9rem'
    },
    form: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      margin: '20px 0',
      backgroundColor: '#f9f9f9'
    },
    formTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '15px'
    },
    input: {
      width: '100%',
      padding: '12px',
      margin: '10px 0',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      margin: '10px 0',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
      minHeight: '100px',
      resize: 'vertical',
      boxSizing: 'border-box'
    },
    button: {
      background: '#1976d2',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '4px',
      cursor: 'pointer',
      margin: '5px 5px 5px 0',
      fontSize: '14px',
      fontWeight: '500'
    },
    buttonSecondary: {
      background: '#666',
      color: 'white'
    },
    post: {
      border: '1px solid #eee',
      borderRadius: '8px',
      padding: '20px',
      margin: '15px 0',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    postHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
      borderBottom: '1px solid #eee',
      paddingBottom: '10px'
    },
    postAuthor: {
      fontWeight: '600',
      color: '#2c3e50'
    },
    postDate: {
      fontSize: '12px',
      color: '#666',
      marginTop: '5px'
    },
    postActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    likeButton: {
      background: 'none',
      border: '1px solid #ddd',
      borderRadius: '20px',
      padding: '6px 12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '14px',
      transition: 'all 0.3s ease'
    },
    likeButtonActive: {
      borderColor: '#1976d2',
      color: '#1976d2',
      backgroundColor: '#e3f2fd'
    },
    solutionBadge: {
      backgroundColor: '#e8f5e8',
      color: '#2e7d32',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      marginLeft: '10px'
    },
    postContent: {
      marginTop: '15px',
      lineHeight: '1.6',
      color: '#333'
    },
    error: {
      color: '#d32f2f',
      backgroundColor: '#ffebee',
      padding: '12px',
      borderRadius: '4px',
      margin: '10px 0',
      border: '1px solid #f44336'
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      fontSize: '18px',
      color: '#666'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      color: '#666'
    }
  };

  if (loading && categories.length === 0 && currentView === 'categories') {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={{fontSize: '3rem', marginBottom: '15px'}}>💬</div>
          Loading forum...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <span>💬</span>
          Community Forum
        </h1>
        <p style={styles.subtitle}>
          Connect, share knowledge, and collaborate with the community
        </p>
        <div style={styles.userBadge}>
          {getUserTypeDisplayName(user?.user_type)} Access
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          ⚠️ {error}
          <button 
            onClick={() => setError('')} 
            style={{float: 'right', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer'}}
          >
            ×
          </button>
        </div>
      )}

      {/* Role-based filter explanation */}
      <div style={styles.filterInfo}>
        <div style={styles.filterTitle}>
          🎯 Personalized Categories
        </div>
        <div style={styles.filterText}>
          {user?.user_type === 'SHELTER' && 
            "As a Shelter Manager, you see operational, staff coordination, and professional categories relevant to shelter management."
          }
          {user?.user_type === 'STAFF' && 
            "As Shelter Staff, you have access to operational, medical, and staff wellness categories for day-to-day work."
          }
          {user?.user_type === 'VOLUNTEER' && 
            "As a Volunteer, you can access emergency response, coordination, and community discussion categories."
          }
          {user?.user_type === 'PUBLIC' && 
            "As a Community Member, you can access pet care, training tips, and general discussion categories."
          }
          {user?.user_type === 'AUTHORITY' && 
            "As a Policy Maker, you have access to strategic, policy, and operational oversight categories."
          }
        </div>
      </div>

      <div style={styles.navigation}>
        <button 
          style={currentView === 'categories' ? styles.navButton : {...styles.navButton, ...styles.navButtonSecondary}}
          onClick={() => setCurrentView('categories')}
        >
          📂 Categories
        </button>
        {selectedCategory && (
          <button 
            style={currentView === 'topics' ? styles.navButton : {...styles.navButton, ...styles.navButtonSecondary}}
            onClick={() => fetchTopics(selectedCategory)}
          >
            💬 Topics
          </button>
        )}
        {selectedTopic && (
          <button 
            style={currentView === 'posts' ? styles.navButton : {...styles.navButton, ...styles.navButtonSecondary}}
            onClick={() => fetchPosts(selectedTopic)}
          >
            📝 Discussion
          </button>
        )}
      </div>

      {/* Categories View */}
      {currentView === 'categories' && (
        <div>
          <h2 style={{fontSize: '1.8rem', fontWeight: '600', color: '#2c3e50', marginBottom: '25px'}}>
            Forum Categories
          </h2>
          
          {categories.length > 0 ? (
            <div style={styles.categoriesGrid}>
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  style={{
                    ...styles.categoryCard,
                    borderLeft: `4px solid ${getCategoryColor(category.name)}`
                  }}
                  onClick={() => fetchTopics(category.id)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={styles.categoryHeader}>
                    <span style={styles.categoryIcon}>{category.icon}</span>
                    <div>
                      <div style={{
                        ...styles.categoryTitle,
                        color: getCategoryColor(category.name)
                      }}>
                        {category.name}
                      </div>
                    </div>
                  </div>
                  <div style={styles.categoryDescription}>
                    {category.description}
                  </div>
                  <div style={styles.categoryStats}>
                    <div style={styles.statItem}>
                      <div style={styles.statValue}>{category.topic_count}</div>
                      <div style={styles.statLabel}>Topics</div>
                    </div>
                    <div style={styles.statItem}>
                      <div style={styles.statValue}>{category.post_count}</div>
                      <div style={styles.statLabel}>Posts</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={{fontSize: '3rem', marginBottom: '15px'}}>📂</div>
              <h3>No Categories Available</h3>
              <p>No forum categories are available for your user type at this time.</p>
            </div>
          )}
        </div>
      )}

      {/* Topics View */}
      {currentView === 'topics' && (
        <div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '600', color: '#2c3e50', margin: 0}}>
              Forum Topics
            </h2>
            <button 
              style={styles.button}
              onClick={() => setShowNewTopicForm(!showNewTopicForm)}
            >
              ➕ New Topic
            </button>
          </div>

          {showNewTopicForm && (
            <div style={styles.form}>
              <div style={styles.formTitle}>Create New Topic</div>
              <input
                type="text"
                placeholder="Topic title..."
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                style={styles.input}
              />
              <div>
                <button style={styles.button} onClick={createTopic}>Create Topic</button>
                <button 
                  style={{...styles.button, ...styles.buttonSecondary}} 
                  onClick={() => setShowNewTopicForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {topics.length > 0 ? (
            topics.map((topic) => (
              <div 
                key={topic.id} 
                style={styles.topicCard}
                onClick={() => fetchPosts(topic.id)}
              >
                <div style={styles.topicHeader}>
                  <div style={{flex: 1}}>
                    <div style={styles.topicTitle}>
                      💬 {topic.title}
                      {topic.is_pinned && (
                        <span style={styles.pinnedBadge}>📌 Pinned</span>
                      )}
                    </div>
                    <div style={styles.topicMeta}>
                      By {topic.created_by_username} • {formatDate(topic.created_at)}
                    </div>
                  </div>
                  <div style={styles.topicStats}>
                    <div>👁️ {topic.views} views</div>
                    <div>💬 {topic.post_count} posts</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={styles.emptyState}>
              <div style={{fontSize: '3rem', marginBottom: '15px'}}>💬</div>
              <h3>No topics found</h3>
              <p>Be the first to start a discussion!</p>
            </div>
          )}
        </div>
      )}

      {/* Posts View */}
      {currentView === 'posts' && (
        <div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '600', color: '#2c3e50', margin: 0}}>
              Discussion
            </h2>
            <button 
              style={styles.button}
              onClick={() => setShowNewPostForm(!showNewPostForm)}
            >
              💬 Reply
            </button>
          </div>

          {showNewPostForm && (
            <div style={styles.form}>
              <div style={styles.formTitle}>Add Your Reply</div>
              <textarea
                placeholder="Write your message..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                style={styles.textarea}
              />
              <div>
                <button style={styles.button} onClick={createPost}>Post Reply</button>
                <button 
                  style={{...styles.button, ...styles.buttonSecondary}} 
                  onClick={() => setShowNewPostForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} style={styles.post}>
                <div style={styles.postHeader}>
                  <div>
                    <div style={styles.postAuthor}>👤 {post.author_username}</div>
                    <div style={styles.postDate}>
                      {formatDate(post.created_at)}
                    </div>
                  </div>
                  <div style={styles.postActions}>
                    <button 
                      style={{
                        ...styles.likeButton,
                        ...(post.user_has_liked ? styles.likeButtonActive : {})
                      }}
                      onClick={() => likePost(post.id)}
                    >
                      <span>👍</span>
                      <span>{post.likes_count}</span>
                    </button>
                    {post.is_solution && (
                      <span style={styles.solutionBadge}>
                        ✅ Solution
                      </span>
                    )}
                  </div>
                </div>
                <div style={styles.postContent}>
                  {post.content}
                </div>
              </div>
            ))
          ) : (
            <div style={styles.emptyState}>
              <div style={{fontSize: '3rem', marginBottom: '15px'}}>📝</div>
              <h3>No posts yet</h3>
              <p>Be the first to contribute to this discussion!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ForumPage;