import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import '../customecss/AdminDashboard.css'; // Import the CSS file for styling

Modal.setAppElement('#root');

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsersAndTasks = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userResponse = await fetch('http://localhost:8011/api/admin/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUsers(userData);
        } else {
          setError('Failed to fetch users.');
        }

        const taskResponse = await fetch('http://localhost:8011/api/admin/tasks', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (taskResponse.ok) {
          const taskData = await taskResponse.json();
          setTasks(taskData);
        } else {
          setError('Failed to fetch tasks.');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred. Please try again later.');
      }
    };

    fetchUsersAndTasks();
  }, []);

  const openUserModal = (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => setIsUserModalOpen(false);

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => setIsTaskModalOpen(false);

  const handleUserUpdate = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8011/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedUser),
      });

      if (response.ok) {
        setUsers(users.map(user => user.id === selectedUser.id ? selectedUser : user));
        closeUserModal();
      } else {
        setError('Failed to update user.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again later.');
    }
  };

  const handleTaskUpdate = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8011/api/admin/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedTask),
      });

      if (response.ok) {
        setTasks(tasks.map(task => task.id === selectedTask.id ? selectedTask : task));
        closeTaskModal();
      } else {
        setError('Failed to update task.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <h2>Users</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.roles.join(', ')}</td>
              <td>
                <button onClick={() => openUserModal(user)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Tasks</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>{task.dueDate}</td>
              <td>{task.status}</td>
              <td>
                <button onClick={() => openTaskModal(task)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* User Modal */}
      <Modal 
        isOpen={isUserModalOpen} 
        onRequestClose={closeUserModal} 
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
        <h2>Edit User</h2>
        <input 
          type="text" 
          value={selectedUser?.username || ''}
          onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
        /><br />
        <input 
          type="email" 
          value={selectedUser?.email || ''}
          onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
        /><br />
        <input 
          type="password" 
          placeholder="New Password (optional)" 
          value={selectedUser?.password || ''}
          onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
        /><br />
        <button onClick={handleUserUpdate}>Update User</button>
        <button onClick={closeUserModal} className="close-button">Close</button>
        {error && <p className="error">{error}</p>}
      </Modal>

      {/* Task Modal */}
      <Modal 
        isOpen={isTaskModalOpen} 
        onRequestClose={closeTaskModal} 
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
        <h2>Edit Task</h2>
        <input 
          type="text" 
          value={selectedTask?.title || ''}
          onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
        /><br />
        <textarea 
          value={selectedTask?.description || ''}
          onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
        /><br />
        <input 
          type="date" 
          value={selectedTask?.dueDate || ''}
          onChange={(e) => setSelectedTask({ ...selectedTask, dueDate: e.target.value })}
        /><br />
        <select
          value={selectedTask?.status || ''}
          onChange={(e) => setSelectedTask({ ...selectedTask, status: e.target.value })}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select><br />
        <button onClick={handleTaskUpdate}>Update Task</button>
        <button onClick={closeTaskModal} className="close-button">Close</button>
        {error && <p className="error">{error}</p>}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
