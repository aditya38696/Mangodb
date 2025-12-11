// API base URL
const API_BASE_URL = 'http://localhost:5000/api/notes';

// DOM Elements
const noteForm = document.getElementById('noteForm');
const notesContainer = document.getElementById('notesContainer');
const noNotesMessage = document.getElementById('noNotesMessage');

// Event Listeners
document.addEventListener('DOMContentLoaded', loadNotes);
noteForm.addEventListener('submit', handleFormSubmit);

// Load all notes
async function loadNotes() {
    try {
        const response = await fetch(API_BASE_URL);
        const notes = await response.json();
        
        if (notes.length > 0) {
            noNotesMessage.style.display = 'none';
            renderNotes(notes);
        } else {
            noNotesMessage.style.display = 'block';
            notesContainer.innerHTML = '';
        }
    } catch (error) {
        console.error('Error loading notes:', error);
        showMessage('Failed to load notes', 'error');
    }
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        });
        
        if (response.ok) {
            // Clear form
            noteForm.reset();
            
            // Reload notes
            loadNotes();
            
            showMessage('Note added successfully!', 'success');
        } else {
            const errorData = await response.json();
            showMessage(errorData.error || 'Failed to add note', 'error');
        }
    } catch (error) {
        console.error('Error adding note:', error);
        showMessage('Failed to add note', 'error');
    }
}

// Render notes to the page
function renderNotes(notes) {
    notesContainer.innerHTML = '';
    
    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-card';
        noteElement.innerHTML = `
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <div class="note-meta">
                Created: ${new Date(note.createdAt).toLocaleString()} | 
                Updated: ${new Date(note.updatedAt).toLocaleString()}
            </div>
            <div class="note-actions">
                <button class="btn-edit" onclick="editNote('${note._id}', '${note.title}', '${note.content}')">Edit</button>
                <button class="btn-delete" onclick="deleteNote('${note._id}')">Delete</button>
            </div>
        `;
        notesContainer.appendChild(noteElement);
    });
}

// Edit note
function editNote(id, title, content) {
    // Find the note card
    const noteCards = document.querySelectorAll('.note-card');
    let targetCard = null;
    
    noteCards.forEach(card => {
        if (card.querySelector('.btn-edit').getAttribute('onclick').includes(id)) {
            targetCard = card;
        }
    });
    
    if (targetCard) {
        // Replace the note content with an edit form
        targetCard.innerHTML = `
            <h3>Edit Note</h3>
            <form class="edit-form" onsubmit="updateNote(event, '${id}')">
                <div class="form-group">
                    <label for="edit-title-${id}">Title:</label>
                    <input type="text" id="edit-title-${id}" name="title" value="${title}" required>
                </div>
                <div class="form-group">
                    <label for="edit-content-${id}">Content:</label>
                    <textarea id="edit-content-${id}" name="content" rows="4" required>${content}</textarea>
                </div>
                <div class="note-actions">
                    <button type="submit">Save Changes</button>
                    <button type="button" class="btn-delete" onclick="cancelEdit('${id}', '${title}', '${content}')">Cancel</button>
                </div>
            </form>
        `;
    }
}

// Cancel edit
function cancelEdit(id, title, content) {
    // Reload all notes to restore the original view
    loadNotes();
}

// Update note
async function updateNote(event, id) {
    event.preventDefault();
    
    const title = document.getElementById(`edit-title-${id}`).value;
    const content = document.getElementById(`edit-content-${id}`).value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        });
        
        if (response.ok) {
            // Reload notes
            loadNotes();
            
            showMessage('Note updated successfully!', 'success');
        } else {
            const errorData = await response.json();
            showMessage(errorData.error || 'Failed to update note', 'error');
        }
    } catch (error) {
        console.error('Error updating note:', error);
        showMessage('Failed to update note', 'error');
    }
}

// Delete note
async function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Reload notes
            loadNotes();
            
            showMessage('Note deleted successfully!', 'success');
        } else {
            const errorData = await response.json();
            showMessage(errorData.error || 'Failed to delete note', 'error');
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        showMessage('Failed to delete note', 'error');
    }
}

// Show message to user
function showMessage(message, type) {
    // Remove any existing message
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    // Add styles
    messageElement.style.position = 'fixed';
    messageElement.style.top = '20px';
    messageElement.style.right = '20px';
    messageElement.style.padding = '15px';
    messageElement.style.borderRadius = '5px';
    messageElement.style.color = 'white';
    messageElement.style.fontWeight = 'bold';
    messageElement.style.zIndex = '1000';
    
    if (type === 'success') {
        messageElement.style.backgroundColor = '#4CAF50';
    } else {
        messageElement.style.backgroundColor = '#f44336';
    }
    
    document.body.appendChild(messageElement);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}