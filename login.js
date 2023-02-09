const errorMessage = document.querySelector('#login_error');

const submitButton = document.querySelector('#submit-button');


submitButton.addEventListener('click', () => {
const username = document.querySelector('#email').value;
const password = document.querySelector('#pass').value;

fetch('/student_login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
})
    .catch(error => {
    // Handle error
    errorMessage.innerHTML = `Error: ${error.message}`;
    });
});
