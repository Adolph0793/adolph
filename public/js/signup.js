signupForm.addEventListener("submit", function(event) {
    let valid = true;
    let errors = [];

    // Clear previous error messages
    errorMessage.innerHTML = "";

    // Validate full name
    if (fullNameInput.value.trim() === "") {
        valid = false;
        errors.push("Full name is required.");
    }

    // Validate email or phone format
    const emailOrPhone = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?\d{10,15}$/;

    if (!(emailRegex.test(emailOrPhone) || phoneRegex.test(emailOrPhone))) {
        valid = false;
        errors.push("Please enter a valid email address or phone number.");
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(passwordInput.value.trim())) {
        valid = false;
        errors.push("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.");
    }

    // Validate date of birth
    if (dobInput.value.trim() === "") {
        valid = false;
        errors.push("Date of birth is required.");
    }

    // Validate gender selection
    let genderSelected = false;
    for (const gender of genderInput) {
        if (gender.checked) {
            genderSelected = true;
            break;
        }
    }
    if (!genderSelected) {
        valid = false;
        errors.push("Gender selection is required.");
    }

    // If validation fails, prevent form submission and display errors
    if (!valid) {
        event.preventDefault();
        errorMessage.innerHTML = errors.join("<br>");
    }
});
