// --- Custom Dropdown Logic ---
const customSelect = document.querySelector('.custom-select');
const trigger = document.querySelector('.custom-select-trigger');
const triggerText = trigger.querySelector('span');
const options = document.querySelectorAll('.custom-option');
const hiddenInput = document.getElementById('option');

// Toggle Dropdown
trigger.addEventListener('click', function() {
    customSelect.classList.toggle('open');
});

// Select an Option
options.forEach(option => {
    option.addEventListener('click', function() {
        // Remove active class from all options
        options.forEach(opt => opt.classList.remove('active'));
        
        // Add active class to clicked option
        this.classList.add('active');
        
        // Update text in trigger and highlight it white
        triggerText.textContent = this.textContent;
        triggerText.classList.add('selected');
        
        // Set the hidden input value so the calculation logic can read it
        hiddenInput.value = this.getAttribute('data-value');
        
        // Close dropdown
        customSelect.classList.remove('open');
    });
});

// Close Dropdown if clicked outside
window.addEventListener('click', function(e) {
    if (!document.querySelector('.custom-select-wrapper').contains(e.target)) {
        customSelect.classList.remove('open');
    }
});


// --- Calculation Logic ---
document.getElementById('calculateButton').addEventListener('click', function() {
    const initialVelocity = parseFloat(document.getElementById('initialVelocity').value) || 0;
    const finalVelocity = parseFloat(document.getElementById('finalVelocity').value) || 0;
    const acceleration = parseFloat(document.getElementById('acceleration').value) || 0;
    const time = parseFloat(document.getElementById('time').value) || 0;
    const displacement = parseFloat(document.getElementById('displacement').value) || 0;
    
    // Grabs the value from our newly created hidden input tag!
    const selectedOption = document.getElementById('option').value;

    let result;
    let message = "";

    if (selectedOption === 'finalVelocity') {
        result = initialVelocity + (acceleration * time);
        message = `Final Velocity: <br><strong>${result.toFixed(2)} m/s</strong>`;
        showModal("Success!", message, "🎯");

    } else if (selectedOption === 'initialVelocity') {
        result = finalVelocity - (acceleration * time);
        message = `Initial Velocity: <br><strong>${result.toFixed(2)} m/s</strong>`;
        showModal("Success!", message, "🎯");

    } else if (selectedOption === 'acceleration') {
        if (time === 0) {
            showModal("Error!", "Time cannot be zero when calculating acceleration.", "⚠️");
            return;
        }
        result = (finalVelocity - initialVelocity) / time;
        message = `Acceleration: <br><strong>${result.toFixed(2)} m/s²</strong>`;
        showModal("Success!", message, "🎯");

    } else if (selectedOption === 'time') {
        if (acceleration === 0) {
            showModal("Error!", "Acceleration cannot be zero when calculating time.", "⚠️");
            return;
        }
        result = (finalVelocity - initialVelocity) / acceleration;
        message = `Time: <br><strong>${result.toFixed(2)} s</strong>`;
        showModal("Success!", message, "🎯");

    } else if (selectedOption === 'displacement') {
        result = (initialVelocity * time) + (0.5 * acceleration * Math.pow(time, 2));
        message = `Displacement: <br><strong>${result.toFixed(2)} m</strong>`;
        showModal("Success!", message, "🎯");

    } else {
        showModal("Hold up!", "Please select a calculation option from the dropdown menu.", "👆");
    }
});

// --- Modal Popup Logic ---
const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModal');

function showModal(title, message, icon) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMessage').innerHTML = message;
    document.getElementById('modalIcon').innerText = icon;
    
    modalOverlay.classList.add('active');
}

closeModalBtn.addEventListener('click', function() {
    modalOverlay.classList.remove('active');
});

modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
    }
});