// app/static/js/forms.js

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('ticket-form');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Enviando...';
                
                const response = await fetch('/api/tickets/create/', {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                    body: JSON.stringify(Object.fromEntries(formData)),
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Ticket creado exitosamente!');
                    form.reset();
                    // Redirigir o actualizar la lista
                    window.location.href = '/';
                } else {
                    showFormErrors(data.errors);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Ocurrió un error al enviar el formulario');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function showFormErrors(errors) {
    // Limpiar errores previos
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // Mostrar nuevos errores
    for (const field in errors) {
        const input = document.querySelector(`[name="${field}"]`);
        if (input) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.color = 'red';
            errorDiv.textContent = errors[field].join(', ');
            input.parentNode.insertBefore(errorDiv, input.nextSibling);
        }
    }
}