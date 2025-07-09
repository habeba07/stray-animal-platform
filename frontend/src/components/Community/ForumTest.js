// Create this file: src/components/Community/ForumTest.js
import React, { useState, useEffect } from 'react';
import api from '../../redux/api';

function ForumTest() {
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchForumData();
  }, []);

  const fetchForumData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, topicsRes] = await Promise.all([
        api.get('/forum-categories/'),
        api.get('/forum-topics/')
      ]);
      
      setCategories(categoriesRes.data);
      setTopics(topicsRes.data);
      setError('');
    } catch (err) {
      setError('Failed to load forum data: ' + err.message);
      console.error('Forum API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading forum data...</div>;
  if (error) return <div style={{color: 'red'}}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>🎉 Forum API Test - SUCCESS!</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>📂 Categories ({categories.length})</h3>
        {categories.map(category => (
          <div key={category.id} style={{ 
            border: '1px solid #ddd', 
            padding: '10px', 
            margin: '5px 0',
            borderRadius: '5px'
          }}>
            <strong>{category.name}</strong>
            <p>{category.description}</p>
            <small>Topics: {category.topic_count} | Posts: {category.post_count}</small>
          </div>
        ))}
      </div>

      <div>
        <h3>💬 Recent Topics ({topics.length})</h3>
        {topics.map(topic => (
          <div key={topic.id} style={{ 
            border: '1px solid #ddd', 
            padding: '10px', 
            margin: '5px 0',
            borderRadius: '5px'
          }}>
            <strong>{topic.title}</strong>
            <p>By: {topic.created_by_username} | Views: {topic.views} | Posts: {topic.post_count}</p>
            <small>Created: {new Date(topic.created_at).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ForumTest;