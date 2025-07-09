// Fixed InteractiveLearning.js - Replace your existing file completely

import React, { useState, useEffect } from 'react';
import api from '../../redux/api';

const InteractiveLearning = ({ resourceSlug, onComplete }) => {
  const [resource, setResource] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Content phase states
  const [currentPhase, setCurrentPhase] = useState('content'); // 'content', 'quiz', 'results'
  const [contentProgress, setContentProgress] = useState(0);
  const [readingStartTime, setReadingStartTime] = useState(null);
  
  // Quiz phase states
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  
  // Checklist states
  const [checklistProgress, setChecklistProgress] = useState({});

  useEffect(() => {
    fetchResource();
  }, [resourceSlug]);

  useEffect(() => {
    // Start reading timer when content phase begins
    if (currentPhase === 'content' && !readingStartTime) {
      setReadingStartTime(new Date());
    }
  }, [currentPhase]);

  const fetchResource = async () => {
    try {
      const response = await api.get(`/resources/${resourceSlug}/`);
      setResource(response.data);
      setProgress(response.data.user_progress);
      
      // Determine initial phase based on progress
      if (response.data.user_progress?.completion_percentage >= 100) {
        setCurrentPhase('quiz'); // Allow direct access to quiz if already completed content
      } else {
        setCurrentPhase('content'); // Start with content for new users
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching resource:', error);
      setLoading(false);
    }
  };

  const startLearning = async () => {
    try {
      const response = await api.post(`/resources/${resourceSlug}/start_learning/`);
      setProgress(response.data);
    } catch (error) {
      console.error('Error starting learning:', error);
    }
  };

  const completeContentReading = async () => {
    try {
      // Mark content as read and update progress
      await api.post(`/resources/${resourceSlug}/update_progress/`, {
        completion_percentage: 100,
        time_spent: readingStartTime ? Math.round((new Date() - readingStartTime) / 60000) : 5
      });
      
      setProgress(prev => ({
        ...prev,
        completion_percentage: 100
      }));
      
      setCurrentPhase('quiz');
    } catch (error) {
      console.error('Error updating progress:', error);
      setCurrentPhase('quiz'); // Continue anyway
    }
  };

  const startQuiz = async () => {
    try {
      if (!progress) {
        await startLearning();
      }
      setQuizStartTime(new Date());
      setCurrentPhase('quiz');
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitQuiz = async () => {
    try {
      const response = await api.post(`/resources/${resourceSlug}/submit_quiz/`, {
        answers: answers,
        started_at: quizStartTime.toISOString()
      });
      
      setQuizResults(response.data);
      setCurrentPhase('results');
      setProgress(response.data.progress);
      
      // Call completion callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const handleChecklistItemChange = (itemId, checked) => {
    const newProgress = {
      ...checklistProgress,
      [itemId]: checked
    };
    setChecklistProgress(newProgress);

    const totalItems = resource.interactive_module?.content_data?.checklist_items?.length || 0;
    const completedItems = Object.values(newProgress).filter(Boolean).length;
    const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    updateProgress(completionPercentage);
  };

  const updateProgress = async (completionPercentage) => {
    try {
      await api.post(`/resources/${resourceSlug}/update_progress/`, {
        completion_percentage: completionPercentage,
        time_spent: 5
      });
      
      setProgress(prev => ({
        ...prev,
        completion_percentage: completionPercentage
      }));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const resetQuiz = () => {
    setCurrentPhase('quiz');
    setCurrentQuestion(0);
    setAnswers({});
    setQuizResults(null);
  };

  const backToContent = () => {
    setCurrentPhase('content');
    setCurrentQuestion(0);
    setAnswers({});
    setQuizResults(null);
  };

  // ===== RENDER FUNCTIONS =====

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading course...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Course not found</p>
      </div>
    );
  }

  // ===== CONTENT DISPLAY PHASE =====
  if (currentPhase === 'content') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        {/* Course Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '15px', color: '#1976d2' }}>
            📚 {resource.title}
          </h1>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
            {resource.summary}
          </p>
          
          {progress && (
            <div style={{ 
              backgroundColor: '#e3f2fd', 
              padding: '15px', 
              borderRadius: '8px', 
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Your Progress</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{progress.completion_percentage || 0}%</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#bbdefb', 
                borderRadius: '4px' 
              }}>
                <div style={{ 
                  width: `${progress.completion_percentage || 0}%`, 
                  height: '100%', 
                  backgroundColor: '#2196f3', 
                  borderRadius: '4px' 
                }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Learning Content */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '10px', 
          marginBottom: '30px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          {/* Content Display */}
          <div style={{ 
            fontSize: '16px', 
            lineHeight: '1.6', 
            color: '#333',
            marginBottom: '30px'
          }}>
            {/* Simple markdown-like rendering */}
            {resource.content.split('\n').map((line, index) => {
              const trimmedLine = line.trim();
              
              // Headers
              if (trimmedLine.startsWith('# ')) {
                return (
                  <h1 key={index} style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    color: '#1976d2', 
                    marginTop: '30px',
                    marginBottom: '15px' 
                  }}>
                    {trimmedLine.substring(2)}
                  </h1>
                );
              }
              if (trimmedLine.startsWith('## ')) {
                return (
                  <h2 key={index} style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: '#1976d2', 
                    marginTop: '25px',
                    marginBottom: '10px' 
                  }}>
                    {trimmedLine.substring(3)}
                  </h2>
                );
              }
              if (trimmedLine.startsWith('### ')) {
                return (
                  <h3 key={index} style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: '#424242', 
                    marginTop: '20px',
                    marginBottom: '8px' 
                  }}>
                    {trimmedLine.substring(4)}
                  </h3>
                );
              }
              
              // Bold text **text**
              if (trimmedLine.includes('**')) {
                const parts = trimmedLine.split('**');
                return (
                  <p key={index} style={{ marginBottom: '10px' }}>
                    {parts.map((part, i) => 
                      i % 2 === 1 ? 
                        <strong key={i} style={{ fontWeight: 'bold', color: '#1976d2' }}>{part}</strong> : 
                        part
                    )}
                  </p>
                );
              }
              
              // List items
              if (trimmedLine.startsWith('- ')) {
                return (
                  <li key={index} style={{ 
                    marginBottom: '8px', 
                    marginLeft: '20px',
                    listStyleType: 'disc'
                  }}>
                    {trimmedLine.substring(2)}
                  </li>
                );
              }
              
              // Numbered lists
              if (/^\d+\./.test(trimmedLine)) {
                return (
                  <li key={index} style={{ 
                    marginBottom: '8px', 
                    marginLeft: '20px',
                    listStyleType: 'decimal'
                  }}>
                    {trimmedLine.replace(/^\d+\.\s*/, '')}
                  </li>
                );
              }
              
              // Regular paragraphs
              if (trimmedLine && !trimmedLine.startsWith('#')) {
                return (
                  <p key={index} style={{ 
                    marginBottom: '15px', 
                    textAlign: 'justify' 
                  }}>
                    {trimmedLine}
                  </p>
                );
              }
              
              // Empty lines
              return <br key={index} />;
            })}
          </div>

          {/* Call-to-Action */}
          <div style={{ 
            backgroundColor: '#f0f8ff', 
            padding: '25px', 
            borderRadius: '8px', 
            textAlign: 'center',
            border: '2px dashed #2196f3'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '15px' }}>🎯</div>
            <h3 style={{ marginBottom: '10px', color: '#1976d2' }}>
              Ready to Test Your Knowledge?
            </h3>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              You've completed the training content. Time to prove your expertise with our assessment quiz!
            </p>
            
            {resource.interactive_module?.module_type === 'QUIZ' && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                gap: '15px', 
                marginBottom: '25px',
                maxWidth: '400px',
                margin: '0 auto 25px'
              }}>
                <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2196f3' }}>
                    {resource.interactive_module.quiz_questions?.length || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Questions</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>
                    {resource.interactive_module.estimated_duration}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Minutes</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#9c27b0' }}>
                    {resource.interactive_module.passing_score}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>To Pass</div>
                </div>
              </div>
            )}

            <button
              onClick={completeContentReading}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
              }}
            >
              🚀 Start Assessment Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== QUIZ RESULTS PHASE =====
  if (currentPhase === 'results') {
    const attempt = quizResults.attempt;
    const passed = quizResults.passed;

    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ 
          backgroundColor: passed ? '#e8f5e8' : '#fff3cd', 
          padding: '40px', 
          borderRadius: '10px',
          maxWidth: '500px',
          margin: '0 auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>
            {passed ? '🎉' : '📚'}
          </div>
          <h2 style={{ color: passed ? '#2e7d2e' : '#856404', marginBottom: '20px' }}>
            {passed ? 'Congratulations!' : 'Good Effort!'}
          </h2>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
            You scored {attempt.score_percentage}%
          </div>
          
          {passed && (
            <div style={{ 
              backgroundColor: 'rgba(76, 175, 80, 0.1)', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px' 
            }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#2e7d2e' }}>
                🏆 You've earned certification in {resource.title}!
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
                Points awarded for your achievement
              </p>
            </div>
          )}
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr', 
            gap: '15px', 
            marginBottom: '30px' 
          }}>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{attempt.correct_answers}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Correct</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{attempt.total_questions}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Total</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{attempt.time_spent_minutes}m</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Time</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={backToContent}
              style={{
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              📚 Review Content
            </button>
            
            {!passed && (
              <button
                onClick={resetQuiz}
                style={{
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                🔄 Try Quiz Again
              </button>
            )}
            
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ← Back to Training
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== QUIZ PHASE =====
  if (currentPhase === 'quiz') {
    const questions = resource.interactive_module?.quiz_questions || [];
    
    // Quiz start screen
    if (!quizStartTime) {
      return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          {/* Course Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '28px', marginBottom: '15px' }}>{resource.title}</h1>
            <p style={{ fontSize: '16px', color: '#666' }}>{resource.summary}</p>
          </div>

          {/* Quiz Info */}
          <div style={{ 
            backgroundColor: '#f0f8ff', 
            padding: '30px', 
            borderRadius: '10px', 
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🧠</div>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Knowledge Assessment</h3>
            <p style={{ marginBottom: '30px', color: '#666' }}>Test your understanding of the rescue protocols you just learned!</p>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr 1fr', 
              gap: '15px', 
              marginBottom: '30px' 
            }}>
              <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2196f3' }}>
                  {questions.length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Questions</div>
              </div>
              <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>
                  {resource.interactive_module.estimated_duration}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Minutes</div>
              </div>
              <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#9c27b0' }}>
                  {resource.interactive_module.passing_score}%
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>To Pass</div>
              </div>
            </div>
            
            {progress && progress.attempts_count > 0 && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: '20px' 
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Your Previous Attempts</div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Attempts: {progress.attempts_count}
                  {progress.best_score && ` | Best Score: ${progress.best_score}%`}
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={backToContent}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                ← Review Content
              </button>
              
              <button
                onClick={startQuiz}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🚀 Begin Quiz
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Quiz questions
    const question = questions[currentQuestion];
    if (!question) {
      return <div style={{ textAlign: 'center', padding: '40px' }}>No questions available</div>;
    }

    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Progress */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{question.points} points</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e0e0e0', 
            borderRadius: '4px' 
          }}>
            <div style={{ 
              width: `${((currentQuestion + 1) / questions.length) * 100}%`, 
              height: '100%', 
              backgroundColor: '#4CAF50', 
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>

        {/* Question */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '10px', 
          marginBottom: '30px',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ marginBottom: '25px', fontSize: '18px' }}>{question.question_text}</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {question.question_type === 'MULTIPLE_CHOICE' && 
              question.question_data.options?.map((option, index) => (
                <label 
                  key={index} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '15px',
                    border: `2px solid ${answers[question.id] === index ? '#4CAF50' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: answers[question.id] === index ? '#f0f8f0' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={index}
                    checked={answers[question.id] === index}
                    onChange={() => handleAnswerChange(question.id, index)}
                    style={{ marginRight: '15px' }}
                  />
                  <span>{option}</span>
                </label>
              ))
            }

            {question.question_type === 'TRUE_FALSE' && (
              <>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px',
                  border: `2px solid ${answers[question.id] === true ? '#4CAF50' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: answers[question.id] === true ? '#f0f8f0' : 'white'
                }}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answers[question.id] === true}
                    onChange={() => handleAnswerChange(question.id, true)}
                    style={{ marginRight: '15px' }}
                  />
                  <span>✅ True</span>
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px',
                  border: `2px solid ${answers[question.id] === false ? '#f44336' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: answers[question.id] === false ? '#fdf0f0' : 'white'
                }}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answers[question.id] === false}
                    onChange={() => handleAnswerChange(question.id, false)}
                    style={{ marginRight: '15px' }}
                  />
                  <span>❌ False</span>
                </label>
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            style={{
              padding: '12px 24px',
              backgroundColor: currentQuestion === 0 ? '#ccc' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            ← Previous
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={submitQuiz}
              disabled={Object.keys(answers).length !== questions.length}
              style={{
                padding: '12px 24px',
                backgroundColor: Object.keys(answers).length !== questions.length ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: Object.keys(answers).length !== questions.length ? 'not-allowed' : 'pointer'
              }}
            >
              Submit Quiz ✅
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ===== CHECKLIST MODULE =====
  if (resource.interactive_module?.module_type === 'CHECKLIST') {
    const items = resource.interactive_module.content_data?.checklist_items || [];

    return (
      <div>
        {/* Course Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '15px' }}>{resource.title}</h1>
          <p style={{ fontSize: '16px', color: '#666' }}>{resource.summary}</p>
        </div>

        <div style={{ 
          backgroundColor: '#f0f8f0', 
          padding: '30px', 
          borderRadius: '10px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>✅</div>
            <h3 style={{ marginBottom: '10px' }}>Interactive Checklist</h3>
            <p style={{ color: '#666' }}>Check off each item as you complete it</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {items.map((item) => (
              <div 
                key={item.id} 
                style={{
                  backgroundColor: checklistProgress[item.id] ? '#e8f5e8' : 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  border: `2px solid ${checklistProgress[item.id] ? '#4CAF50' : '#e0e0e0'}`
                }}
              >
                <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checklistProgress[item.id] || false}
                    onChange={(e) => handleChecklistItemChange(item.id, e.target.checked)}
                    style={{ marginRight: '15px', marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ 
                      fontWeight: 'bold', 
                      marginBottom: '8px',
                      textDecoration: checklistProgress[item.id] ? 'line-through' : 'none',
                      color: checklistProgress[item.id] ? '#4CAF50' : '#333'
                    }}>
                      {item.text}
                    </div>
                    <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                      {item.description}
                    </p>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===== FALLBACK =====
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚧</div>
      <h3>Interactive features coming soon!</h3>
      <p style={{ color: '#666' }}>This course will have interactive features soon.</p>
    </div>
  );
};

export default InteractiveLearning;