import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import '../customecss/UserTasksDashboard.css'; // Import CSS for styling

// Define status options
const statusOptions = ['TODO', 'PENDING', 'INPROGRESS', 'COMPLETE'];

Modal.setAppElement('#root');

const UserTasksDashboard = () => {
  const [tasks, setTasks] = useState([]); // Initialize tasks as an empty array
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // For managing modal state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'TODO',
  });
  const [currentUser, setCurrentUser] = useState('');
  const [taskToUpdate, setTaskToUpdate] = useState(null);

  // Fetch tasks and user data when the component mounts
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:8011/api/task/get-all-tasks', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTasks(data.content || []); // Use 'content' property of the paginated response
        } else {
          console.error('Failed to fetch tasks.');
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Error fetching tasks.');
      }
    };

    // Fetch current user from localStorage
    const fetchCurrentUser = () => {
      const username = localStorage.getItem('username');
      if (username) {
        setCurrentUser(username);
      } else {
        setError('User not logged in.');
      }
    };

    fetchTasks();
    fetchCurrentUser();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8011/api/task/update/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
      } else {
        setError('Failed to update task status.');
      }
    } catch (error) {
      console.error(`Error updating task status for taskId ${taskId}:`, error);
      setError(`Error updating task status for taskId ${taskId}: ${error.message}`);
    }
  };

  const handleAddTask = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No access token found.');
        return;
      }

      // Validate new task fields
      if (!newTask.title || !newTask.description || !newTask.dueDate || !newTask.status) {
        setError('Please fill in all required fields.');
        return;
      }

      const response = await fetch('http://localhost:8011/api/task/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        const text = await response.text(); // Get response text
        let newTaskData;
        try {
          newTaskData = JSON.parse(text); // Attempt to parse JSON
        } catch (e) {
          setError('Failed to parse response as JSON.');
          console.error('Failed to parse response as JSON:', e);
          return;
        }

        if (newTaskData) {
          setTasks([...tasks, newTaskData]);
          closeModal(); // Close the modal after adding the task
          setError(''); // Clear any previous errors
        } else {
          setError('Unexpected response format.');
        }
      } else {
        const errorText = await response.text(); // Get response text for error messages
        setError(`Failed to add new task: ${errorText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding new task:', error);
      setError(`Error adding new task: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUpdateTask = async () => {
    if (!taskToUpdate) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No access token found.');
        return;
      }

      const response = await fetch(`http://localhost:8011/api/task/update/${taskToUpdate.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskToUpdate),
      });

      if (response.ok) {
        setTasks(tasks.map(task =>
          task.id === taskToUpdate.id ? taskToUpdate : task
        ));
        closeUpdateModal();
        setError('');
      } else {
        const errorText = await response.text();
        setError(`Failed to update task: ${errorText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError(`Error updating task: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8011/api/task/delete-task/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId));
      } else {
        setError('Failed to delete task.');
      }
    } catch (error) {
      console.error(`Error deleting task for taskId ${taskId}:`, error);
      setError(`Error deleting task for taskId ${taskId}: ${error.message}`);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openUpdateModal = (task) => {
    setTaskToUpdate(task);
    setIsUpdateModalOpen(true);
  };
  const closeUpdateModal = () => {
    setTaskToUpdate(null);
    setIsUpdateModalOpen(false);
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    window.location.href = '/'; // Redirect to home page or login page
  };

  return (
    <div className="tasks-dashboard">
      <h2>User Tasks Dashboard</h2>
      <h3><strong>Current User:</strong> {currentUser}</h3>
      <button className="add-task-button" onClick={openModal}>Add Task</button>
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      {error && <p className="error">{error}</p>}
      
      <table className="tasks-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Title</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <tr key={task.id}>
                <td>{index + 1}</td>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>{task.dueDate}</td>
                <td>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  >
                    {statusOptions.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="action-buttons">
                  <button onClick={() => openUpdateModal(task)}>Update</button>
                  <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No tasks available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal for adding new task */}
      <Modal 
        isOpen={isModalOpen} 
        onRequestClose={closeModal} 
        style={{ 
          content: { 
            top: '50%', left: '50%', right: 'auto', bottom: 'auto', 
            transform: 'translate(-50%, -50%)', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' 
          } 
        }}
      >
        <h2>Add New Task</h2>
        <p><strong>Current User:</strong> {currentUser}</p>
        <input 
          type="text" 
          placeholder="Title" 
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        /><br />
        <textarea 
          placeholder="Description" 
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        /><br />
        <input 
          type="date" 
          value={newTask.dueDate}
          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
        /><br />
        <select
          value={newTask.status}
          onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
        >
          {statusOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select><br />
        <button onClick={handleAddTask} style={{ marginTop: '10px' }}>Add Task</button>
        <button onClick={closeModal} style={{ marginTop: '10px' }}>Close</button>
      </Modal>

      {/* Modal for updating task */}
      <Modal 
        isOpen={isUpdateModalOpen} 
        onRequestClose={closeUpdateModal} 
        style={{ 
          content: { 
            top: '50%', left: '50%', right: 'auto', bottom: 'auto', 
            transform: 'translate(-50%, -50%)', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' 
          } 
        }}
      >
        <h2>Update Task</h2>
        <p><strong>Current User:</strong> {currentUser}</p>
        <input 
          type="text" 
          placeholder="Title" 
          value={taskToUpdate?.title || ''}
          onChange={(e) => setTaskToUpdate({ ...taskToUpdate, title: e.target.value })}
        /><br />
        <textarea 
          placeholder="Description" 
          value={taskToUpdate?.description || ''}
          onChange={(e) => setTaskToUpdate({ ...taskToUpdate, description: e.target.value })}
        /><br />
        <input 
          type="date" 
          value={taskToUpdate?.dueDate || ''}
          onChange={(e) => setTaskToUpdate({ ...taskToUpdate, dueDate: e.target.value })}
        /><br />
        <select
          value={taskToUpdate?.status || 'TODO'}
          onChange={(e) => setTaskToUpdate({ ...taskToUpdate, status: e.target.value })}
        >
          {statusOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select><br />
        <button onClick={handleUpdateTask} style={{ marginTop: '10px' }}>Update Task</button>
        <button onClick={closeUpdateModal} style={{ marginTop: '10px' }}>Close</button>
      </Modal>
    </div>
  );
};

export default UserTasksDashboard;
