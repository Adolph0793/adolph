document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('emailOrPhone');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('error-message');

  loginForm.addEventListener('submit', function(event) {
    // Réinitialiser le message d'erreur
    errorMessage.textContent = '';

    // Vérification simple : champs non vides
    if (!emailInput.value || !passwordInput.value) {
      event.preventDefault(); // empêche l'envoi si vide
      errorMessage.textContent = 'Veuillez remplir tous les champs.';
    }
  });
});
