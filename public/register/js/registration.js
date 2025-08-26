/**
 * Registration form handling including multi-step form and payment processing
 */

// Variables to store user data
let userData = {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
};

// List of common disposable email domains
const disposableEmailDomains = [
    'mailinator.com',
    'guerrillamail.com',
    'tempmail.com',
    'temp-mail.org',
    'fakeinbox.com',
    'trashmail.com',
    'yopmail.com',
    'tempinbox.com',
    '10minutemail.com',
    'mailnesia.com',
    'dispostable.com',
    'maildrop.cc',
    'getairmail.com',
    'getnada.com',
    'sharklasers.com',
    'mailinator.net',
    'tempmail.net',
];

// Store Braintree related objects
let braintreeInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    // Add email validation on blur
    document.getElementById('email').addEventListener('blur', validateEmail);

    // Step navigation
    document
        .getElementById('register-btn')
        .addEventListener('click', async function () {
            // Validate inputs
            const email = document.getElementById('email').value;
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const password = document.getElementById('password').value;

            if (!email || !firstName || !lastName || !password) {
                showError('Please fill in all fields to continue');
                return;
            }

            // Validate email format and check for disposable domains
            if (!(await validateEmail())) {
                return; // The validation function will show the appropriate error
            }

            // Check if password is strong enough using the password validator module
            if (!(await window.passwordValidation.isPasswordStrong())) {
                showError(
                    'Please choose a stronger password (Good or Strong rating)'
                );
                return;
            }

            // Store user data
            userData.email = email;
            userData.firstName = firstName;
            userData.lastName = lastName;
            userData.password_hash = await Argon2id.hashEncoded(password);

            //post /api/user/register
            const response = await fetch('/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                // Registration successful
                const result = await response.json();
                console.log('Registration successful:', result);
            } else {
                // Handle registration error
                const error = await response.json();
                showError(error.message);
            }
        });
});

// Email validation function
function validateEmail() {
    const emailInput = document.getElementById('email');
    const emailValue = emailInput.value.trim();
    const emailMessage = document.getElementById('email-validation-message');

    // Check if email is empty
    if (!emailValue) {
        return false;
    }

    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
        emailMessage.textContent = 'Please enter a valid email address';
        emailMessage.classList.remove('hidden');
        emailInput.classList.add('border-red-500');
        return false;
    }

    // Check for disposable email domains
    const domain = emailValue.split('@')[1].toLowerCase();
    if (disposableEmailDomains.includes(domain)) {
        emailMessage.textContent =
            'Please use a permanent email address, not a temporary one';
        emailMessage.classList.remove('hidden');
        emailInput.classList.add('border-red-500');
        return false;
    }

    // Valid email
    emailMessage.classList.add('hidden');
    emailInput.classList.remove('border-red-500');
    return true;
}

// Error handling
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

function hideError() {
    document.getElementById('error-message').classList.add('hidden');
}
