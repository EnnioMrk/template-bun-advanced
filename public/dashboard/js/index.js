tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                ghostink: ['GHOSTINK', 'cursive'],
            },
            colors: {
                pastel: {
                    1: '#01002E',
                    2: '#2F72BA',
                    3: '#3D9FDD',
                    4: '#EFB2EF',
                    5: '#D5BAC7',
                    6: '#DD74CF',
                    7: '#DD53B4',
                },
                rtg: {
                    1: '#16532e',
                    2: '#04b989',
                    3: '#22c55e',
                    4: '#facc15',
                    5: '#fc8a4a',
                    6: '#f87171',
                },
            },
        },
    },
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/user/info');
        const data = await response.json();

        console.log(data);

        if (data.success && data.user) {
            populateUserData(data.user);
            showDashboard();
        } else {
            showError('Failed to load user data');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        showError('Unable to connect to server');
    }

    // Set up logout button
    document.getElementById('logout-btn').addEventListener('click', logout);
});

function populateUserData(user) {
    // Update profile information
    document.getElementById('first-name').textContent = user.firstName || 'N/A';
    document.getElementById('last-name').textContent = user.lastName || 'N/A';
    document.getElementById('email').textContent = user.email || 'N/A';
}

function showDashboard() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('error').classList.add('hidden');
}

function showError(message) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('error').classList.remove('hidden');
    document.getElementById('error-message').textContent = message;
}

async function logout() {
    try {
        const response = await fetch('/api/user/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            window.location.href = '/login';
        } else {
            alert('Logout failed. Please try again.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed. Please try again.');
    }
}

function showDashboard() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('error').classList.add('hidden');
}

function showError(message) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('error').classList.remove('hidden');
    document.getElementById('error-message').textContent = message;
}

async function logout() {
    try {
        const response = await fetch('/api/user/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            window.location.href = '/login';
        } else {
            alert('Logout failed. Please try again.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed. Please try again.');
    }
}
