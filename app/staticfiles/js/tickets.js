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

async function handleEditFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const ticketId = form.getAttribute('data-id');
    
    const formData = {
        title: form.title.value,
        description: form.description.value,
        status: form.status.value,
        assigned_to: form.assigned_to.value || null
    };
    
    try {
        const ticket = await TicketAPI.updateTicket(ticketId, formData);
        alert('Ticket actualizado correctamente');
        document.getElementById(`edit-form-${ticketId}`).style.display = 'none';
        loadTickets();  // Refrescar la lista
    } catch (error) {
        console.error('Error actualizando ticket:', error);
        alert('Error al actualizar ticket: ' + error.message);
    }
}

function handleCancelEdit(e) {
    const ticketId = e.target.getAttribute('data-id');
    document.getElementById(`edit-form-${ticketId}`).style.display = 'none';
}

async function handleDeleteClick(e) {
    if (!confirm('¿Estás seguro de que quieres eliminar este ticket?')) {
        return;
    }
    
    const ticketId = e.target.getAttribute('data-id');
    
    try {
        await TicketAPI.deleteTicket(ticketId);
        alert('Ticket eliminado correctamente');
        loadTickets();  // Refrescar la lista
    } catch (error) {
        console.error('Error eliminando ticket:', error);
        alert('Error al eliminar ticket: ' + error.message);
    }
}