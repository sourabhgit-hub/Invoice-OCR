document.addEventListener('DOMContentLoaded', function() {
    const imageContainer = document.getElementById('image-container');
    const image = document.getElementById('image');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const textForm = document.getElementById('textForm');
    const textFieldsContainer = document.getElementById('textFieldsContainer');
    const newLabelText = document.getElementById('newLabelText');
    let rectangles = [];
    let selectedTextField = null;
    let fieldCount = 1;
    let selectedBill='fuel'

    if (!imageContainer || !image || !canvas) {
        console.error('Element not found');
        return;
    }

    function resizeCanvas() {
        const containerRect = imageContainer.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();

        canvas.width = containerRect.width;
        canvas.height = containerRect.height;
        console.log(`Canvas size: ${canvas.width}x${canvas.height}`); // Debug: Log canvas size

        const scaleX = imageRect.width / image.naturalWidth;
        const scaleY = imageRect.height / image.naturalHeight;
        
        drawRectangles(scaleX, scaleY);
    }

    function drawRectangles(scaleX, scaleY) {
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
        context.strokeStyle = 'red';
        context.lineWidth = 1;

        rectangles = rectangles.map(rect => {
            const scaledRect = {
                x: rect.x * scaleX,
                y: rect.y * scaleY,
                width: rect.w * scaleX,
                height: rect.h * scaleY,
                text: rect.text
            };
            context.fillStyle = 'rgba(255, 255, 113, 0.5)';
            context.fillRect(scaledRect.x - 2, scaledRect.y - 2, scaledRect.width + 2, scaledRect.height + 2);
            console.log(`Drawing rectangle with text ${scaledRect.text} at (${scaledRect.x}, ${scaledRect.y}) with width ${scaledRect.width} and height ${scaledRect.height}`); // Debug: Log rectangle details
            return scaledRect;
        });
    }

    function handleMouseClick(event) {
        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;

        rectangles.forEach(rect => {
            if (mouseX >= rect.x && mouseX <= rect.x + rect.width &&
                mouseY >= rect.y && mouseY <= rect.y + rect.height) {
                console.log(`Clicked rectangle with text ${rect.text}`);
                if (selectedTextField) {
                    selectedTextField.value = rect.text; // Copy text to selected input field
                }
            }
        });
    }

    function handleMouseMove(event) {
        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;

        let cursorStyle = 'default';
        rectangles.forEach(rect => {
            if (mouseX >= rect.x && mouseX <= rect.x + rect.width &&
                mouseY >= rect.y && mouseY <= rect.y + rect.height) {
                cursorStyle = 'pointer';
            }
        });

        canvas.style.cursor = cursorStyle;
    }

    function loadRectangles() {
        fetch('/static/rectangles.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                rectangles = data;
                resizeCanvas();
            })
            .catch(error => console.error('Error loading rectangles:', error));
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        const textValues = Array.from(document.querySelectorAll('.inputField')).map(input => input.value);
        console.log(textValues);
        fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ texts: textValues })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Form submitted successfully:', data);
        })
        .catch(error => console.error('Error submitting form:', error));
    }

    function addDefaultTextFields() {
        let labels=[]
        if (selectedBill=='fuel'){
            labels=["Subtype","Units","Amount","Date"];
        }
        for (let i = 0; i < labels.length; i++) {
            addTextField(labels,i);
        }
    }

    function addTextField(labels, i) {
        const labelText = `${labels[i]}`; // Default label text
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';

        const label = document.createElement('label');
        label.htmlFor = `inputField${fieldCount}`;
        label.textContent = labelText;

        const newTextField = document.createElement('input');
        newTextField.type = 'text';
        newTextField.className = 'inputField';
        newTextField.id = `inputField${fieldCount}`;
        newTextField.placeholder = 'Click a rectangle to copy text here';
        newTextField.addEventListener('focus', () => {
            selectedTextField = newTextField;
        });

        inputGroup.appendChild(label);
        inputGroup.appendChild(newTextField);
        textFieldsContainer.appendChild(inputGroup);

        fieldCount++;
    }

    image.onload = () => {
        console.log('Image loaded');
        loadRectangles();
    };

    image.onerror = () => {
        console.error('Image failed to load');
    };

    canvas.addEventListener('click', handleMouseClick);
    canvas.addEventListener('mousemove', handleMouseMove);
    textForm.addEventListener('submit', handleFormSubmit);

    console.log('Script loaded, waiting for image to load');

    // Resize the canvas whenever the window is resized
    window.addEventListener('resize', resizeCanvas);

    // Add default input fields when the DOM content is loaded
    addDefaultTextFields();

    // Initialize the first text field as selected
    document.querySelector('.inputField').addEventListener('focus', function() {
        selectedTextField = this;
    });
});
