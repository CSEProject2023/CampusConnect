const password = document.querySelector('#spassword');
const confirmPassword = document.querySelector('#sconfirmPassword');
const errorMessage = document.querySelector('#errorMessage');

  confirmPassword.addEventListener("input", function() {
    if (password.value !== confirmPassword.value) {
      errorMessage.style.display = "block";
    } else {
      errorMessage.style.display = "none";
    }
  });
