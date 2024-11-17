
const projects = ["Project A", "Project B", "Project C", "Project D", "Project E", "Project F"];

let selectedProjects = new Set();
let currentWeekIndex = 0; // Tracks the current set of weeks being shown


const preloadedData = {
    "2024-10-22": [
        { projectName: "Project A", percentages: 25 },
        { projectName: "Project B", percentages: 20 },
        { projectName: "Project C", percentages: 50 }
    ],
    "2024-10-28": [
        { projectName: "Project A", percentages: 10 },
        { projectName: "Project B", percentages: 60 },
        { projectName: "Project C", percentages: 30 }
    ],
    "2024-11-02": [
        { projectName: "Project A", percentages: 20 },
        { projectName: "Project B", percentages: 30 },
        { projectName: "Project C", percentages: 50 }
    ],
    "2024-11-09": [
        { projectName: "Project A", percentages: 5 },
        { projectName: "Project B", percentages: 95 }
    ],
    "2024-11-15": [
        { projectName: "Project A", percentages: 80 },
        { projectName: "Project B", percentages: 10 },
        { projectName: "Project C", percentages: 10 }
    ],
    "2024-11-22": [
        { projectName: "Project A", percentages: 40 },
        { projectName: "Project B", percentages: 40 },
        { projectName: "Project C", percentages: 20 }
    ]
};



const projectRows = document.getElementById("projectRows");
const addProjectBtn = document.getElementById("addProjectBtn");
const submitBtn = document.getElementById("submitBtn");
const errorMessage = document.getElementById("errorMessage");
const fridayHeader = document.getElementById("fridayHeader");

// Generate Last 6 Fridays
function generateFridays(count) {
    const fridays = [];
    const today = new Date();
    let current = new Date(today);

    // Set to most recent Friday
    current.setDate(today.getDate() - today.getDay() + 5);

    for (let i = 0; i < count; i++) {
        fridays.unshift(new Date(current)); // Insert at the beginning
        current.setDate(current.getDate() - 7); // Go back one week
    }

    return fridays;
}

// Format the date as "YYYY-MM-DD"
function formatFridayHeader(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Update dropdown options based on selected projects
function updateDropdownOptions() {
    const dropdowns = document.querySelectorAll("select");
    dropdowns.forEach(dropdown => {
        const currentValue = dropdown.value;
        dropdown.innerHTML = ""; // Clear existing options

        const placeholderOption = document.createElement("option");
        placeholderOption.textContent = "Select a project";
        placeholderOption.disabled = true;
        placeholderOption.selected = currentValue === "";
        dropdown.appendChild(placeholderOption);

        projects.forEach(project => {
            const option = document.createElement("option");
            option.value = project;
            option.textContent = project;
            option.disabled = selectedProjects.has(project) && project !== currentValue;
            if (project === currentValue) {
                option.selected = true;
            }
            dropdown.appendChild(option);
        });
    });

    // Hide or show "Add New Project" button
    addProjectBtn.style.display = selectedProjects.size === projects.length ? "none" : "inline-block";
}

// Add a new project row
function addProjectRow(projectName = "", editable = true) {
    const row = document.createElement("tr");

    // Project Name Cell
    const nameCell = document.createElement("td");
    if (editable) {
        const select = document.createElement("select");
        select.classList.add("form-control");
        select.addEventListener("change", (e) => {
            const previousValue = e.target.getAttribute("data-previous-value");
            if (previousValue) {
                selectedProjects.delete(previousValue);
            }
            selectedProjects.add(e.target.value);
            e.target.setAttribute("data-previous-value", e.target.value);
            updateDropdownOptions();
        });

        select.setAttribute("data-previous-value", "");

        const placeholderOption = document.createElement("option");
        placeholderOption.textContent = "Select a project";
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        select.appendChild(placeholderOption);

        projects.forEach(project => {
            const option = document.createElement("option");
            option.value = project;
            option.textContent = project;
            option.disabled = selectedProjects.has(project);
            select.appendChild(option);
        });

        nameCell.appendChild(select);
    } else {
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.value = projectName;
        nameInput.classList.add("form-control");
        nameInput.readOnly = true;
        nameCell.appendChild(nameInput);
    }
    row.appendChild(nameCell);

    // Add Friday Columns
    const fridays = generateFridays(6);
    fridays.forEach((friday, index) => {
        const cell = document.createElement("td");
        const input = document.createElement("input");
        input.type = "number";
        input.min = 0;
        input.max = 100;
        input.placeholder = "0%";
        input.classList.add("form-control");
        input.readOnly = index < fridays.length - 1; // Past dates are non-editable
        cell.appendChild(input);
        row.appendChild(cell);
    });

    // Add Delete Button
    const deleteCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-btn");
    deleteButton.innerHTML = "&times;";
    deleteButton.addEventListener("click", () => {
        const previousValue = row.querySelector("select").getAttribute("data-previous-value");
        if (previousValue) {
            selectedProjects.delete(previousValue);
        }
        row.remove();
        updateDropdownOptions();
    });

    if (editable) {
        deleteCell.appendChild(deleteButton);
    }

    row.appendChild(deleteCell);
    projectRows.appendChild(row);
}


// Function to map any date to the preceding Friday
function mapToFriday(date) {
    const givenDate = new Date(date);
    const dayOfWeek = givenDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const friday = new Date(givenDate);
    const daysToSubtract = (dayOfWeek >= 5) ? dayOfWeek - 5 : 7 + dayOfWeek - 5; // Adjust to Friday
    friday.setDate(givenDate.getDate() - daysToSubtract);
    return friday.toISOString().split("T")[0]; // Return as YYYY-MM-DD
}

// Initialize Table with Preloaded Data
function initializeTableWithPreloadedData(data) {
    updateTableHeaders(); // Update headers based on Fridays
    const fridays = generateFridays(6).map(formatFridayHeader); // Get Fridays as strings
    const projectsMap = new Map(); // To track unique projects

    // Convert preloadedData dates to Fridays
    const mappedData = {};
    for (const [date, projectEntries] of Object.entries(data)) {
        const friday = mapToFriday(date); // Map any date to the preceding Friday
        mappedData[friday] = mappedData[friday] || [];
        mappedData[friday].push(...projectEntries);
    }

    // Populate projectsMap with percentages aligned to Fridays
    for (const [date, projectEntries] of Object.entries(mappedData)) {
        projectEntries.forEach(entry => {
            const { projectName, percentages } = entry;

            // Add project to map if not already added
            if (!projectsMap.has(projectName)) {
                projectsMap.set(projectName, new Array(fridays.length).fill(null));
            }

            // Find the index of the date in the Fridays array
            const dateIndex = fridays.indexOf(date);
            if (dateIndex !== -1) {
                projectsMap.get(projectName)[dateIndex] = percentages; // Set percentage at the correct index
            }
        });
    }

    // Create rows for each project
    for (const [projectName, percentagesArray] of projectsMap.entries()) {
        addProjectRowWithData(projectName, percentagesArray, fridays);
    }

    updateDropdownOptions();
}



function addPercentageSymbol(input) {
    // Ensure the % symbol is there initially if the value is not empty and doesn't already have a % symbol
    if (input.value && !input.value.includes('%')) {
        input.value = `${input.value}%`;
    }

    // For readonly input fields: don't remove the % symbol on focus
    if (input.hasAttribute('readonly')) {
        // Do nothing on focus or blur for readonly input, just append the % symbol on initial load
        return;
    }

    // Remove % while typing (for editable inputs)
    input.addEventListener("focus", () => {
        if (input.value.includes('%')) {
            input.value = input.value.replace('%', ''); // Remove % symbol on focus for editable inputs
        }
    });

    // Append % symbol on blur (when the user finishes editing, for editable inputs)
    input.addEventListener("blur", () => {
        if (input.value) {
            input.value = `${input.value}%`; // Append % when user finishes editing for editable inputs
        }
    });

    // Real-time input handling (for editable inputs)
    input.addEventListener("input", () => {
        let value = input.value.replace('%', ''); // Remove existing %
        input.value = value ? `${value}` : ''; // Update value with % only if there's something
    });
}


// Add a project row with data
function addProjectRowWithData(projectName, percentagesArray, fridays) {
    const row = document.createElement("tr");

    // Project Name Cell
    const nameCell = document.createElement("td");
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = projectName;
    nameInput.classList.add("form-control");
    nameInput.readOnly = true;
    nameCell.appendChild(nameInput);
    row.appendChild(nameCell);

    // Add Friday Columns
    percentagesArray.forEach((percentage, index) => {
        const cell = document.createElement("td");
        const input = document.createElement("input");
        input.type = "text"; // Use text instead of number to display %
        input.min = 0;
        input.max = 100;
        input.placeholder = "0%";
        input.classList.add("form-control");
        input.readOnly = index < fridays.length - 1; // Past dates are non-editable

        if (percentage !== null) {
            input.value = percentage; // Populate the percentage if available
            addPercentageSymbol(input); // Attach % handler
        }

        cell.appendChild(input);
        row.appendChild(cell);
    });

    // Add Delete Button
    const deleteCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-btn");
    deleteButton.innerHTML = "&times;";
    deleteButton.addEventListener("click", () => {
        selectedProjects.delete(projectName); // Remove project from selected list
        row.remove();
        updateDropdownOptions();
    });
    // deleteCell.appendChild(deleteButton);
    row.appendChild(deleteCell);

    projectRows.appendChild(row);
}

// Validate Totals
function validateTotals() {
    errorMessage.style.display = "none";
    const rows = projectRows.querySelectorAll("tr");
    const lastFridayIndex = 5; // Last week's column (6th column)

    let total = 0;

    rows.forEach(row => {
        const inputs = row.querySelectorAll("td:nth-child(n+2) input");
        const lastFridayInput = inputs[lastFridayIndex];

        if (lastFridayInput && lastFridayInput.value) {
            total += parseInt(lastFridayInput.value);
        }
    });

    if (total !== 100) {
        showModal(); // Show error modal
    } else {
        showSuccessModal(); // Show success modal
    }
}

// Update Table Headers
function updateTableHeaders() {
    fridayHeader.innerHTML = '<th style="width:24%">Project Name</th>';
    const fridays = generateFridays(6);
    fridays.forEach(friday => {
        const th = document.createElement("th");
        th.textContent = getWeekNumberInMonth(formatFridayHeader(friday));

        const dt = document.createElement("div");
        dt.classList.add("readable_date");
        dt.textContent = subtractDays(formatFridayHeader(friday), 4);
        th.appendChild(dt);

        fridayHeader.appendChild(th);
    });

    const lastone = document.createElement("th");
    lastone.textContent = "Action";
    fridayHeader.appendChild(lastone);

    updateDropdownOptions();
}

// Get Week Number in Month
function getWeekNumberInMonth(date) {
    const inputDate = new Date(date);
    const firstDayOfMonth = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);
    const dayOfMonth = inputDate.getDate();
    const weekNumber = Math.ceil(dayOfMonth / 7);
    const monthName = inputDate.toLocaleString("en-us", { month: "short" });
    const weekSuffix = getWeekSuffix(weekNumber);
    return `${monthName} ${weekNumber}${weekSuffix} week`;
}

// Get Week Suffix
function getWeekSuffix(weekNumber) {
    if (weekNumber === 1) return "st";
    if (weekNumber === 2) return "nd";
    if (weekNumber === 3) return "rd";
    return "th";
}

// Subtract Days from Date
function subtractDays(dateString, daysToSubtract) {
    const date = new Date(dateString);
    date.setDate(date.getDate() - daysToSubtract);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

// Modal Control Functions
function showModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "block";
}

function hideModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
}

function showSuccessModal() {
    const modal2 = document.getElementById("modal2");
    modal2.style.display = "block";
}

function hideSuccessModal() {
    const modal2 = document.getElementById("modal2");
    modal2.style.display = "none";
}

// Initialize Table
updateTableHeaders();
["Project A", "Project B", "Project C"].forEach(project => {
    selectedProjects.add(project);
    // addProjectRow(project, false);
});

initializeTableWithPreloadedData(preloadedData);


// Event Listeners
addProjectBtn.addEventListener("click", addProjectRow);
submitBtn.addEventListener("click", validateTotals);



// Function to check if the user is on a mobile device
function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent); // Check for mobile user agent
}

function showMobileMessage() {
    const mobileMessage = document.getElementById('mobileMessage');
    const content = document.getElementById('content');
    
    if (isMobileDevice()) {
        mobileMessage.style.display = 'flex';  // Show the mobile message
        content.style.opacity = '0.2';         // Reduce opacity of the main content
    } else {
        mobileMessage.style.display = 'none';   // Hide the mobile message
        content.style.opacity = '1';            // Restore the opacity of the content
    }
}

// Run the function when the page loads
window.onload = showMobileMessage;