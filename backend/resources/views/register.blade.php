<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>DOMINEXUS - Student Registration</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 40px;
        }

        .container {
            max-width: 500px;
            margin: auto;
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        h1 {
            margin-bottom: 25px;
        }

        label {
            display: block;
            margin-top: 15px;
            margin-bottom: 6px;
            font-weight: bold;
        }

        input,
        select {
            width: 100%;
            padding: 12px;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 8px;
        }

        button {
            width: 100%;
            margin-top: 25px;
            padding: 12px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
        }

        #message {
            margin-top: 15px;
        }
    </style>
</head>

<body>

<div class="container">

    <h1>Student Registration</h1>

    <form id="registerForm">

        <label for="name">Full Name</label>
        <input
            type="text"
            id="name"
            name="name"
            required
        >

        <label for="email">Email</label>
        <input
            type="email"
            id="email"
            name="email"
            required
        >

        <label for="password">Password</label>
        <input
            type="password"
            id="password"
            name="password"
            required
            minlength="8"
        >

        <label for="organization">Organization</label>

        <select id="organization" name="organization_id" required>
            <option value="">Loading organizations...</option>
        </select>

        <button type="submit">
            Register
        </button>

    </form>

    <div id="message"></div>

</div>

<script>
const organizationSelect = document.getElementById('organization');
const registerForm = document.getElementById('registerForm');
const message = document.getElementById('message');


/*
|--------------------------------------------------------------------------
| Load Organizations
|--------------------------------------------------------------------------
*/

fetch('/api/organizations')
    .then(response => response.json())
    .then(organizations => {

        organizationSelect.innerHTML =
            '<option value="">Select your organization</option>';

        organizations.forEach(organization => {

            const option = document.createElement('option');

            option.value = organization.id;
            option.textContent = organization.name;

            organizationSelect.appendChild(option);
        });

    })
    .catch(error => {

        console.error(error);

        organizationSelect.innerHTML =
            '<option value="">Unable to load organizations</option>';
    });


/*
|--------------------------------------------------------------------------
| Registration
|--------------------------------------------------------------------------
*/

registerForm.addEventListener('submit', async function(event) {

    event.preventDefault();

    message.textContent = 'Creating account...';

    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        organization_id: Number(
            document.getElementById('organization').value
        )
    };

    try {

        const response = await fetch('/api/register', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },

            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {

            message.textContent =
                result.message || 'Registration failed.';

            return;
        }

        message.textContent =
            'Registration successful!';

        console.log(result);

    } catch (error) {

        console.error(error);

        message.textContent =
            'Unable to connect to the server.';
    }

});
</script>

</body>
</html>