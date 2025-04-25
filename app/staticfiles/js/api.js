// app/static/js/api.js
class TicketAPI {
    static BASE_URL = '/api/tickets/';

    static getCSRFToken() {
        // Intenta obtener el token del meta tag
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            return metaTag.content;
        }
        
        // Fallback para compatibilidad
        const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfInput ? csrfInput.value : '';
    }

    static async getTickets() {
        const response = await fetch(this.BASE_URL);
        if (!response.ok) throw new Error('Error fetching tickets');
        return await response.json();
    }

    static async createTicket(data) {
        try {
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            console.log('CSRF Token:', csrfToken);
            console.log('Request Data:', data);
            
            const response = await fetch('/api/tickets/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorDetail = await response.text();
                console.error('Error response:', errorDetail);
                throw new Error(`Error ${response.status}: ${errorDetail}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Full error:', error);
            throw error;
        }
    }

    static async getCategories() {
        const response = await fetch('/api/categories/');
        if (!response.ok) throw new Error('Error fetching categories');
        return await response.json();
    }

    static async getUsers() {
        const response = await fetch('/api/users/');
        if (!response.ok) throw new Error('Error fetching users');
        return await response.json();
    }

    static async updateTicket(id, data) {
        const csrfToken = this.getCSRFToken();
        if (!csrfToken) {
            throw new Error('CSRF token not found. Please reload the page.');
        }

        try {
            const response = await fetch(`${this.BASE_URL}${id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                credentials: 'include',  // Importante para cookies de sesión
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error updating ticket');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Update error:', error);
            throw error;
        }
    }

    // En tu archivo api.js
    static async deleteTicket(id) {
        const csrfToken = this.getCSRFToken();  // Usamos el mismo método helper
        
        if (!csrfToken) {
            throw new Error('CSRF token not found. Please reload the page.');
        }

        try {
            const response = await fetch(`${this.BASE_URL}${id}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'  // Importante para las cookies de sesión
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error deleting ticket');
            }

            return true;
        } catch (error) {
            console.error('Delete error:', error);
            throw error;  // Re-lanzamos el error para manejarlo en el componente
        }
    }
}