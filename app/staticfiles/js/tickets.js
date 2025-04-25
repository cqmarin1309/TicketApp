// app/static/js/tickets.js
document.addEventListener('DOMContentLoaded', function() {
    // Cargar tickets al inicio
    loadTickets();
    
    // Manejar envío de formulario
    const form = document.getElementById('ticket-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Cargar dropdowns dinámicos
    loadFormDropdowns();
});

async function loadTickets() {
    try {
        const tickets = await TicketAPI.getTickets();
        renderTickets(tickets);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar tickets');
    }
}

// app/static/js/tickets.js
function renderTickets(tickets) {
    const container = document.getElementById('tickets-container');
    if (!container) return;
    
    if (tickets.length === 0) {
        container.innerHTML = '<tr><td colspan="8">No hay tickets disponibles</td></tr>';
        return;
    }
    
    let html = '';
    tickets.forEach(ticket => {
        if (ticket.is_deleted) return;  // Saltar tickets eliminados
        
        html += `
        <tr data-ticket-id="${ticket.id}" class="ticket-row">
            <td>${ticket.title}</td>
            <td>${ticket.status_display}</td>
            <td>${ticket.category?.name || '-'}</td>
            <td>${ticket.created_by.username}</td>
            <td>${ticket.assigned_to?.username || '-'}</td>
            <td>${new Date(ticket.created_at).toLocaleString()}</td>
            <td class="actions">
                ${ticket.can_edit ? `<button class="btn-edit" data-id="${ticket.id}">Editar</button>` : ''}
                ${ticket.can_edit ? `<button class="btn-delete" data-id="${ticket.id}">Eliminar</button>` : ''}
            </td>
        </tr>
        <tr class="edit-form-container" id="edit-form-${ticket.id}" style="display:none;">
            <td colspan="8">
                <form class="edit-ticket-form" data-id="${ticket.id}">
                    <div class="form-group">
                        <label>Título:</label>
                        <input type="text" name="title" value="${ticket.title}" required>
                    </div>
                    <div class="form-group">
                        <label>Descripción:</label>
                        <textarea name="description" required>${ticket.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Estado:</label>
                        <select name="status">
                            <option value="open" ${ticket.status === 'open' ? 'selected' : ''}>Abierto</option>
                            <option value="in_progress" ${ticket.status === 'in_progress' ? 'selected' : ''}>En progreso</option>
                            <option value="closed" ${ticket.status === 'closed' ? 'selected' : ''}>Cerrado</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Asignar a:</label>
                        <select name="assigned_to">
                            <option value="">Nadie</option>
                            <!-- Opciones se llenarán dinámicamente -->
                        </select>
                    </div>
                    <button type="submit" class="btn-save">Guardar</button>
                    <button type="button" class="btn-cancel" data-id="${ticket.id}">Cancelar</button>
                </form>
            </td>
        </tr>
        `;
    });
    
    container.innerHTML = html;
    
    // Agregar event listeners a los nuevos botones
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', handleEditClick);
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', handleDeleteClick);
    });
    
    document.querySelectorAll('.edit-ticket-form').forEach(form => {
        form.addEventListener('submit', handleEditFormSubmit);
    });
    
    document.querySelectorAll('.btn-cancel').forEach(btn => {
        btn.addEventListener('click', handleCancelEdit);
    });
}

async function handleEditClick(e) {
    const ticketId = e.target.getAttribute('data-id');
    const editForm = document.getElementById(`edit-form-${ticketId}`);
    
    // Ocultar otros formularios abiertos
    document.querySelectorAll('.edit-form-container').forEach(form => {
        form.style.display = 'none';
    });
    
    // Mostrar este formulario
    editForm.style.display = 'table-row';
    
    // Llenar dropdown de usuarios
    const select = editForm.querySelector('select[name="assigned_to"]');
    if (select && select.options.length <= 1) {  // Solo tiene la opción "Nadie"
        try {
            const users = await TicketAPI.getUsers();
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.username;
                select.appendChild(option);
            });
            
            // Seleccionar el usuario asignado actual si existe
            if (e.target.closest('.ticket-row').querySelector('td:nth-child(5)').textContent.trim() !== '-') {
                const currentUser = users.find(u => 
                    u.username === e.target.closest('.ticket-row').querySelector('td:nth-child(5)').textContent.trim()
                );
                if (currentUser) {
                    select.value = currentUser.id;
                }
            }
        } catch (error) {
            console.error('Error cargando usuarios:', error);
        }
    }
}

async function loadFormDropdowns() {
    try {
        const [categories, users] = await Promise.all([
            TicketAPI.getCategories(),
            TicketAPI.getUsers()
        ]);
        
        const categorySelect = document.getElementById('id_category');
        const userSelect = document.getElementById('id_assigned_to');
        
        if (categorySelect) {
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
        }
        
        if (userSelect) {
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.username;
                userSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar opciones');
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        title: form.title.value,
        description: form.description.value,
        category: form.category.value,
        assigned_to: form.assigned_to.value
    };
    
    try {
        const ticket = await TicketAPI.createTicket(formData);
        alert('Ticket creado exitosamente!');
        form.reset();
        loadTickets(); // Actualizar la lista
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear ticket: ' + error.message);
    }
}

async function handleEditFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const ticketId = form.getAttribute('data-id');
    
    // Mostrar estado de carga
    const submitBtn = form.querySelector('.btn-save');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Guardando...';
    
    try {
        const formData = {
            title: form.querySelector('[name="title"]').value,
            description: form.querySelector('[name="description"]').value,
            status: form.querySelector('[name="status"]').value,
            assigned_to: form.querySelector('[name="assigned_to"]').value || null
        };
        
        const updatedTicket = await TicketAPI.updateTicket(ticketId, formData);
        
        // Mostrar mensaje de éxito
        showAlert('Ticket actualizado correctamente', 'success');
        
        // Ocultar formulario y actualizar lista
        document.getElementById(`edit-form-${ticketId}`).style.display = 'none';
        await loadTickets();
        
    } catch (error) {
        console.error('Error:', error);
        showAlert(`Error al actualizar ticket: ${error.message}`, 'error');
    } finally {
        // Restaurar botón
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Función auxiliar para mostrar alertas
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    document.body.prepend(alertDiv);
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function handleCancelEdit(e) {
    const ticketId = e.target.getAttribute('data-id');
    document.getElementById(`edit-form-${ticketId}`).style.display = 'none';
}

async function handleDeleteClick(e) {
    if (!confirm('¿Estás seguro de eliminar este ticket? Esta acción no se puede deshacer.')) {
        return;
    }

    const button = e.target;
    const ticketId = button.getAttribute('data-id');
    
    // Mostrar estado de carga
    const originalText = button.textContent;
    button.disabled = true;
    button.innerHTML = '<span class="loading-spinner"></span> Eliminando...';

    try {
        const success = await TicketAPI.deleteTicket(ticketId);
        
        if (success) {
            showAlert('Ticket eliminado correctamente', 'success');
            
            // Opción 1: Eliminar la fila directamente (más rápido)
            const row = document.querySelector(`.ticket-row[data-ticket-id="${ticketId}"]`);
            if (row) {
                row.nextElementSibling?.remove();  // Elimina el formulario de edición si existe
                row.remove();
            }
            
            // Opción 2: Recargar toda la lista (más consistente)
            // await loadTickets();
        }
    } catch (error) {
        console.error('Error eliminando ticket:', error);
        showAlert(`Error al eliminar ticket: ${error.message}`, 'error');
    } finally {
        // Restaurar el botón
        button.disabled = false;
        button.textContent = originalText;
    }
}